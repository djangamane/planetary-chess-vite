import { useNavigate } from 'react-router-dom';

function Leaderboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#050c17',
      background: 'linear-gradient(135deg, #050c17 0%, #0c1b30 100%)',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Digital circuit decorations */}
      <div style={{
        position: 'absolute',
        height: '1px',
        width: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.2) 50%, transparent 100%)',
        top: '15%',
        boxShadow: '0 0 8px rgba(0, 195, 255, 0.5)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        height: '1px',
        width: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        top: '85%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        left: '10%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        right: '10%',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '20px 0 30px 0',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(0, 195, 255, 0.7)',
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '2px'
        }}>
          TACTICAL ANALYSIS
        </h1>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
            color: '#e8f4ff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: '1px solid rgba(0, 195, 255, 0.3)',
            boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
            transition: 'all 0.2s ease',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← RETURN TO COMMAND CENTER
        </button>

        <div style={{
          width: '100%',
          background: 'rgba(0, 20, 40, 0.7)',
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 0 30px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
          border: '1px solid rgba(0, 195, 255, 0.2)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(0, 195, 255, 0.1) inset',
            pointerEvents: 'none'
          }}></div>

          <h2 style={{
            color: '#e8f4ff',
            fontSize: '22px',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            marginBottom: '20px',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0, 195, 255, 0.5)'
          }}>
            COMBAT PERFORMANCE METRICS
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            borderBottom: '1px solid rgba(0, 195, 255, 0.2)',
            paddingBottom: '10px'
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                color: '#7cb3e8',
                fontSize: '14px',
                marginBottom: '5px',
                fontFamily: '"Orbitron", sans-serif'
              }}>RANK</div>
            </div>
            <div style={{ flex: 3, textAlign: 'center' }}>
              <div style={{
                color: '#7cb3e8',
                fontSize: '14px',
                marginBottom: '5px',
                fontFamily: '"Orbitron", sans-serif'
              }}>OPERATIVE</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                color: '#7cb3e8',
                fontSize: '14px',
                marginBottom: '5px',
                fontFamily: '"Orbitron", sans-serif'
              }}>SCORE</div>
            </div>
          </div>

          <div style={{
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              border: '1px dashed rgba(0, 195, 255, 0.3)',
              borderRadius: '8px',
              background: 'rgba(0, 30, 60, 0.3)'
            }}>
              <p style={{
                color: '#e8f4ff',
                fontSize: '16px',
                fontStyle: 'italic',
                marginBottom: '10px'
              }}>
                Intelligence database initialization in progress...
              </p>
              <div style={{
                width: '100%',
                height: '4px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '30%',
                  background: 'linear-gradient(90deg, #054487, #00a2ff)',
                  borderRadius: '2px',
                  animation: 'pulse 1.5s infinite',
                }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(0, 20, 40, 0.5)',
          backdropFilter: 'blur(5px)',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(0, 195, 255, 0.1)',
          border: '1px solid rgba(0, 195, 255, 0.1)',
          color: '#7cb3e8',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '600px',
          fontStyle: 'italic'
        }}>
          "In the grand game of Planetary Chess, one's strategic acumen is measured not merely by victories, but by the comprehension of systemic patterns. Return frequently to analyze your performance metrics."
        </div>
      </div>

      {/* Animation styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; width: 30%; }
            50% { opacity: 1; width: 60%; }
            100% { opacity: 0.6; width: 30%; }
          }
        `}
      </style>
    </div>
  );
}

export default Leaderboard;