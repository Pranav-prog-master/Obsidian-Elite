export default function Spinner({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, border: `3px solid rgba(42,157,143,0.2)`, borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
  );
}
// Add to globals: @keyframes spin { to { transform: rotate(360deg); } }
