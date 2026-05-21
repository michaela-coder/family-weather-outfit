import { useState } from 'react';
import type { WeatherDay } from './types/weather';
import { scenarios, mockWeather } from './data/mockWeather';
import { getOutfitRecommendation } from './logic/outfitRules';
import { fetchTodayWeather } from './services/openMeteo';
import WeatherHeader from './components/WeatherHeader';
import ChildOutfitCard from './components/ChildOutfitCard';
import OutfitSummary from './components/OutfitSummary';
import './App.css';

type AppMode = 'mock' | 'real';
type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';

const scenarioButtons = [
  { key: 'horko', label: 'Horko', emoji: '☀️' },
  { key: 'teplo', label: 'Teplo', emoji: '🌤️' },
  { key: 'dest', label: 'Déšť', emoji: '🌧️' },
  { key: 'chlad', label: 'Chlad', emoji: '🧥' },
  { key: 'zima', label: 'Zima', emoji: '🧊' },
  { key: 'mraz', label: 'Mráz', emoji: '❄️' },
  { key: 'vitr', label: 'Vítr', emoji: '💨' },
];

function loadName(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('mock');
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [weather, setWeather] = useState<WeatherDay>(mockWeather);
  const [activeScenario, setActiveScenario] = useState<string>('dest');
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
      const data = await fetchTodayWeather(latitude, longitude);
      setWeather(data);
      setMode('real');
      setGeoStatus('success');
    } catch (err) {
      if (err instanceof GeolocationPositionError && err.code === GeolocationPositionError.PERMISSION_DENIED) {
        setGeoStatus('denied');
      } else {
        setGeoStatus('error');
      }
      setMode('mock');
      setWeather(scenarios[activeScenario]);
    }
  }

  function switchToMock() {
    setMode('mock');
    setGeoStatus('idle');
    setWeather(scenarios[activeScenario]);
  }

  function selectScenario(key: string) {
    setActiveScenario(key);
    setWeather(scenarios[key]);
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

      <div className="mode-switcher">
        <button
          className={`mode-btn${mode === 'real' ? ' active' : ''}`}
          onClick={loadRealWeather}
          disabled={geoStatus === 'loading'}
        >
          📍 Moje poloha
        </button>
        <button
          className={`mode-btn mode-btn-secondary${mode === 'mock' ? ' active' : ''}`}
          onClick={switchToMock}
        >
          🧪 Testovat
        </button>
      </div>

      {geoStatus === 'loading' && (
        <div className="status-card loading-card">
          <span className="spinner" />
          Zjišťuji polohu a načítám počasí…
        </div>
      )}
      {geoStatus === 'denied' && (
        <div className="status-card error-card">
          <span>🔒</span>
          <div>
            <strong>Přístup k poloze byl zamítnut.</strong>
            <p>Povolte polohu v nastavení prohlížeče, nebo použijte testovací režim.</p>
          </div>
        </div>
      )}
      {geoStatus === 'error' && (
        <div className="status-card error-card">
          <span>⚠️</span>
          <div>
            <strong>Počasí se nepodařilo načíst.</strong>
            <p>Zkontrolujte připojení k internetu nebo použijte testovací režim.</p>
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

      {mode === 'mock' && geoStatus !== 'loading' && (
        <details className="demo-controls">
          <summary className="demo-label">🧪 Vyzkoušej různá počasí</summary>
          <div className="demo-buttons">
            {scenarioButtons.map((btn) => (
              <button
                key={btn.key}
                className={`demo-btn${activeScenario === btn.key ? ' active' : ''}`}
                onClick={() => selectScenario(btn.key)}
              >
                {btn.emoji} {btn.label}
              </button>
            ))}
          </div>
        </details>
      )}

      <footer className="app-footer">
        {mode === 'real' && geoStatus === 'success'
          ? <p>📡 Reálná data · Open-Meteo API</p>
          : <p>🧪 Testovací data · <span className="footer-api">Open-Meteo API připraveno</span></p>
        }
        <p className="footer-disclaimer">Rodinná pomůcka, ne oficiální meteorologická služba.</p>
      </footer>
    </div>
  );
}
