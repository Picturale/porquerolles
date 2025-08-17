import { useTrust } from '../../trust/TrustProvider';

export default function ProvisionalPill({ neededTrusted }: { neededTrusted: number }) {
  const { copy } = useTrust();
  if (!neededTrusted || neededTrusted <= 0) return null;
  const text = copy.public.provisionalPill.replace('{needed}', String(neededTrusted));
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      color: '#9a3412',
      borderRadius: 999,
      padding: '4px 10px',
      fontSize: 12,
      fontWeight: 600
    }}>
      {text}
    </span>
  );
}
