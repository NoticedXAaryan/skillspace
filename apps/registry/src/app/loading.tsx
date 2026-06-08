export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="spinner"></div>
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-subtle);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
