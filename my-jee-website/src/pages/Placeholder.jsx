export default function Placeholder({ pageName }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top left, #0a0122, #240046, #3c096c)',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#bceaff' }}>
          {pageName}
        </h1>
        <p style={{ color: '#9ae7ff' }}>
          This page is under construction.
        </p>
      </div>
    </div>
  );
}
