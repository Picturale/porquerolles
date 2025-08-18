// Page Welcome ultra-simple pour diagnostic iOS
const WelcomeSimple = () => {
  console.log('[ios] WelcomeSimple rendering...');

  return (
    <div
      style={{
        padding: '20px',
        background: 'white',
        minHeight: '100vh',
        color: 'black',
        fontSize: '18px',
      }}
    >
      <h1 style={{ color: 'blue' }}>Welcome Simple</h1>
      <p>Si tu vois ce texte, React fonctionne !</p>
      <div
        style={{
          background: 'yellow',
          padding: '10px',
          margin: '10px 0',
          border: '2px solid red',
        }}
      >
        Test de visibilité iOS
      </div>
    </div>
  );
};

export default WelcomeSimple;
