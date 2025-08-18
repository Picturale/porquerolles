import { useTrust } from '../trust/TrustProvider';

export default function TrustPage() {
  const cfg = useTrust();
  return (
    <div style={{ padding: 16 }}>
      <h2>Transparence — Système de confiance</h2>
      <p>Version: {cfg.version}</p>
      <section>
        <h3>Badges</h3>
        <ul>
          {cfg.badges.map((b) => (
            <li key={b.name}>
              <strong>{b.name}</strong> — T ≥ {b.minT}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Stabilisation des posts</h3>
        <div>Min évaluations: {cfg.stability.minRatings}</div>
        <div>Min évaluateurs T≥60: {cfg.stability.minTrusted}</div>
        <div>Part max cluster: {Math.round(cfg.stability.maxClusterShare * 100)}%</div>
      </section>
      <section>
        <h3>Modération</h3>
        <div>Masquage auto WFS ≥ {cfg.moderation.maskWFS}</div>
        <div>File de modération WFS ≥ {cfg.moderation.queueWFS}</div>
      </section>
    </div>
  );
}
