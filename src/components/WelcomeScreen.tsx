import { useNavigate } from 'react-router-dom';

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#111827',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '600px'
      }}>
        <img 
          src="/stewie-chess-bg.png"
          alt="Stewie Chess"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            marginBottom: '30px'
          }}
        />

        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1a365d',
          margin: '0 0 30px 0',
          textAlign: 'center'
        }}>
          Planetary Chess
        </h1>

        <div style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <button
            onClick={() => navigate('/game')}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Start Game
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#9333ea',
              color: 'white',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;