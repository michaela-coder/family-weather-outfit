import { useState } from 'react';
import type { WeatherDay } from './types/weather';
import { mockWeather } from './data/mockWeather';
import { getOutfitRecommendation } from './logic/outfitRules';
import { fetchTodayWeather } from './services/openMeteo';
import WeatherHeader from './components/WeatherHeader';
import ChildOutfitCard from './components/ChildOutfitCard';
import OutfitSummary from './components/OutfitSummary';
import './App.css';

type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error' | 'weather-error';

function loadName(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

export default function App() {
  const [usingRealData, setUsingRealData] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [weather, setWeather] = useState<WeatherDay>(mockWeather);
  const [showSettings, setShowSettings] = useState(false);
  const [boyName, setBoyName] = useState(() => loadName('boyName', 'Kluk'));
  const [girlName, setGirlName] = useState(() => loadName('girlName', 'Holka'));
  const outfit = getOutfitRecommendation(weather);

  function updateBoyName(name: string) {
    setBoyName(name);
    localStorage.setItem('boyName', name);
  }

  function updateGirlName(name: string) {
    setGirlName(name);
    localStorage.setItem('girlName', name);
  }

  async function loadRealWeather() {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 12000,
          maximumAge: 5 * 60 * 1000,
        });
      });
      const { latitude, longitude } = position.coords;
      try {
        const data = await fetchTodayWeather(latitude, longitude);
        setWeather(data);
        setUsingRealData(true);
        setGeoStatus('success');
      } catch {
        setGeoStatus('weather-error');
        setWeather(mockWeather);
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError && err.code === GeolocationPositionError.PERMISSION_DENIED) {
        setGeoStatus('denied');
      } else {
        setGeoStatus('error');
      }
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <div className="app-header-spacer" />
          <div className="app-header-center">
            <div className="app-header-brand">
              <img src="/logo/app-logo.png" alt="Logo aplikace" className="app-logo" />
              <div className="app-title-block">
                <h1 className="app-title">Dětské oblečení</h1>
                <p className="app-subtitle">podle počasí</p>
              </div>
            </div>
          </div>
          <button
            className={`settings-btn${showSettings ? ' active' : ''}`}
            onClick={() => setShowSettings(s => !s)}
            aria-label="Nastavení jmen"
            title="Nastavení jmen"
          >
            ⚙️
          </button>
        </div>

        {showSettings && (
          <div className="settings-panel">
            <div className="settings-row">
              <label>👦</label>
              <input
                type="text"
                value={boyName}
                onChange={e => updateBoyName(e.target.value)}
                placeholder="Jméno kluka"
                maxLength={20}
              />
            </div>
            <div className="settings-row">
              <label>👧</label>
              <input
                type="text"
                value={girlName}
                onChange={e => updateGirlName(e.target.value)}
                placeholder="Jméno holky"
                maxLength={20}
              />
            </div>
          </div>
        )}
      </header>

      <div className="location-row">
        <button
          className="location-btn"
          onClick={loadRealWeather}
          disabled={geoStatus === 'loading'}
        >
          {geoStatus === 'loading' ? <><span className="spinner spinner-sm" /> Zjišťuji polohu…</> : '📍 Načíst počasí podle polohy'}
        </button>
      </div>

      {geoStatus === 'denied' && (
        <div className="status-card error-card">
          <span>🔒</span>
          <div>
            <strong>Přístup k poloze byl zamítnut.</strong>
            <p>Povolte polohu v nastavení prohlížeče a zkuste to znovu.</p>
          </div>
        </div>
      )}
      {geoStatus === 'error' && (
        <div className="status-card error-card">
          <span>⚠️</span>
          <div>
            <strong>Polohu se nepodařilo zjistit.</strong>
            <p>Zkontrolujte, zda máte zapnutou GPS, a zkuste to znovu.</p>
          </div>
        </div>
      )}
      {geoStatus === 'weather-error' && (
        <div className="status-card error-card">
          <span>🌐</span>
          <div>
            <strong>Předpověď počasí se nepodařilo načíst.</strong>
            <p>Zobrazujeme ukázková data. Zkuste to znovu za chvíli.</p>
          </div>
        </div>
      )}

      {geoStatus !== 'loading' && (
        <>
          <WeatherHeader weather={weather} />
          <div className="children-section">
            <ChildOutfitCard gender="boy" name={boyName} outfit={outfit} weather={weather} />
            <ChildOutfitCard gender="girl" name={girlName} outfit={outfit} weather={weather} />
          </div>
          <OutfitSummary outfit={outfit} boyName={boyName} girlName={girlName} />
        </>
      )}

      <footer className="app-footer">
        {usingRealData && geoStatus === 'success'
          ? <p>📡 Open-Meteo API</p>
          : <p>🌤️ <span className="footer-api">Open-Meteo API</span></p>
        }
        <p className="footer-disclaimer">Rodinná pomůcka, ne oficiální meteorologická služba.</p>
      </footer>
    </div>
  );
}
