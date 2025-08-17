import { useTrust } from '../../trust/TrustProvider';
import { getBadgeForT, getNextBadgeInfo } from '../../trust/logic/badges';

export default function TrustLabel({ t }: { t?: number }) {
  const { copy } = useTrust();
  const badge = getBadgeForT(t);
  const next = getNextBadgeInfo(t);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 600 }}>{copy.public.trustLabel}:</span>
      <span style={{
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid #e5e7eb',
        background: '#f8fafc'
      }}>{typeof t === 'number' ? Math.round(t) : '—'}</span>
      {badge && (
        <span style={{ fontSize: 12, color: '#475569' }}>{badge.name}</span>
      )}
      {next && (
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {copy.private.nextBadgeHint
            .replace('{points}', String(next.pointsNeeded))
            .replace('{badge}', next.next.name)}
        </span>
      )}
    </div>
  );
}
