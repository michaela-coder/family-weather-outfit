import type { OutfitRecommendation } from '../logic/outfitRules';

interface Props {
  outfit: OutfitRecommendation;
  boyName: string;
  girlName: string;
}

function TempSign(t: number) {
  return t > 0 ? `+${t}` : `${t}`;
}

function PeriodSection({
  title, emoji, temperature, boy, girl, boyName, girlName,
}: {
  title: string; emoji: string; temperature: number;
  boy: string[]; girl: string[]; boyName: string; girlName: string;
}) {
  return (
    <div className="period-section">
      <div className="period-header">
        <span className="period-emoji">{emoji}</span>
        <span className="period-title">{title}</span>
        <span className="period-temp">{TempSign(temperature)}°C</span>
      </div>
      <div className="period-grid">
        <div className="summary-section boy-section">
          <h3>👦 {boyName}</h3>
          <ul>{boy.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="summary-section girl-section">
          <h3>👧 {girlName}</h3>
          <ul>{girl.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export default function OutfitSummary({ outfit, boyName, girlName }: Props) {
  const { morning, afternoon, backpack, warnings, headline, afternoonNote } = outfit;
  const afternoonDiffers =
    morning.temperatureCategory !== afternoon.temperatureCategory ||
    JSON.stringify(morning.boy) !== JSON.stringify(afternoon.boy);

  return (
    <div className="outfit-summary">
      {headline && <p className="outfit-headline">{headline}</p>}

      {/* Main simplified view — what to dress today */}
      <div className="main-outfit-grid">
        <div className="summary-section boy-section">
          <h3>👦 {boyName}</h3>
          <ul>{morning.boy.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="summary-section girl-section">
          <h3>👧 {girlName}</h3>
          <ul>{morning.girl.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      {backpack.length > 0 && (
        <div className="backpack-inline">
          <span className="backpack-label">🎒 Do batohu:</span>
          <span>{backpack.join(' · ')}</span>
        </div>
      )}

      {afternoonNote && (
        <div className="afternoon-note">☀️ {afternoonNote}</div>
      )}

      {warnings.length > 0 && (
        <div className="summary-section warnings-section" style={{ marginTop: 8 }}>
          <h3>⚠️ Upozornění</h3>
          <ul>{warnings.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      )}

      {/* Detailed morning/afternoon breakdown — hidden by default */}
      {afternoonDiffers && (
        <details className="detail-breakdown">
          <summary>📋 Podrobný rozpis</summary>
          <div className="detail-breakdown-content">
            <PeriodSection
              title="Ráno" emoji="🌅" temperature={morning.temperature}
              boy={morning.boy} girl={morning.girl}
              boyName={boyName} girlName={girlName}
            />
            <PeriodSection
              title="Odpoledne" emoji="☀️" temperature={afternoon.temperature}
              boy={afternoon.boy} girl={afternoon.girl}
              boyName={boyName} girlName={girlName}
            />
            {backpack.length > 0 && (
              <div className="summary-section backpack-section">
                <h3>🎒 Do batohu</h3>
                <ul>{backpack.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
