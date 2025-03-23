import { useNavigate } from 'react-router-dom';

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#050c17',
      background: 'linear-gradient(135deg, #050c17 0%, #0c1b30 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Futuristic background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.05) 0%, transparent 70%)',
        zIndex: 1
      }}></div>
      
      {/* Digital circuit lines */}
      <div style={{
        position: 'absolute',
        height: '1px',
        width: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.2) 50%, transparent 100%)',
        top: '30%',
        boxShadow: '0 0 8px rgba(0, 195, 255, 0.5)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        height: '1px',
        width: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        top: '70%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        left: '25%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        right: '25%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '650px',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 0 30px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
        border: '1px solid rgba(0, 195, 255, 0.2)'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          marginBottom: '30px'
        }}>
          <img 
            src="/stewie-chess-bg.png"
            alt="Stewie Chess"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '10px',
              boxShadow: '0 0 25px rgba(0, 195, 255, 0.5)'
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0, 195, 255, 0.7) inset',
            pointerEvents: 'none'
          }}></div>
        </div>

        <h1 style={{ 
          fontSize: '52px', 
          fontWeight: '900', 
          background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 10px 0',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(0, 195, 255, 0.7)',
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '2px'
        }}>
          PLANETARY CHESS
        </h1>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(0, 195, 255, 0.6)',
            boxShadow: '0 0 15px rgba(0, 195, 255, 0.4)',
            background: 'radial-gradient(circle at center, #0c1b30 0%, #050c17 90%)'
          }}>
            <img 
              src="/assets/stewie.png" 
              alt="AI Stewie"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <p style={{ 
            color: '#aadcff', 
            marginBottom: '0', 
            textAlign: 'center',
            maxWidth: '500px',
            fontSize: '14px',
            letterSpacing: '1px',
            lineHeight: '1.6',
            textShadow: '0 0 10px rgba(0, 195, 255, 0.5)'
          }}>
            Face AI Cyber Stewie in a battle of wits and knowledge. Answer correctly to weaken your opponent or face the full power of systemic oppression.
          </p>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/game')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #056df5 0%, #00a2ff 100%)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '1px solid rgba(0, 195, 255, 0.5)',
              boxShadow: '0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.5) inset',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.8), 0 0 10px rgba(0, 195, 255, 0.5) inset';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.5) inset';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            INITIALIZE GAME
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transform: 'rotate(25deg)',
              transition: 'all 0.5s',
            }}></div>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #7e12c7 0%, #b24cff 100%)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '1px solid rgba(178, 76, 255, 0.5)',
              boxShadow: '0 0 15px rgba(178, 76, 255, 0.5), 0 0 5px rgba(178, 76, 255, 0.3) inset',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(178, 76, 255, 0.8), 0 0 10px rgba(178, 76, 255, 0.5) inset';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(178, 76, 255, 0.5), 0 0 5px rgba(178, 76, 255, 0.3) inset';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            VIEW STATISTICS
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transform: 'rotate(25deg)',
              transition: 'all 0.5s',
            }}></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;