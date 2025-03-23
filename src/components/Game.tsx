import { useState, useRef, useEffect } from 'react';
import { Chess, type Chess as ChessType } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { quizQuestions, type QuizQuestion } from '../data/quizQuestions';
import { useNavigate } from 'react-router-dom';
import { shuffle } from 'lodash';

type GameState = {
  currentQuestion: QuizQuestion;
  remainingQuestions: QuizQuestion[];
  usedQuestions: QuizQuestion[];
  isQuizVisible: boolean;
  lastMoveCorrect: boolean | null;
  currentTaunt: string;
};

function Game() {
  const navigate = useNavigate();
  const [game] = useState<ChessType>(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  // Initialize game state with shuffled questions
  const [gameState, setGameState] = useState<GameState>(() => {
    const shuffledQuestions = shuffle([...quizQuestions]);
    return {
      currentQuestion: shuffledQuestions[0],
      remainingQuestions: shuffledQuestions.slice(1),
      usedQuestions: [],
      isQuizVisible: true,
      lastMoveCorrect: null,
      currentTaunt: "Before I make my first move, let's see how much you know..."
    };
  });

  const stockfishRef = useRef<Worker | null>(null);

  // Get next question and handle reshuffling when all questions are used
  const getNextQuestion = (): [QuizQuestion, QuizQuestion[], QuizQuestion[]] => {
    if (gameState.remainingQuestions.length === 0) {
      // All questions used, reshuffle excluding the current question
      const newShuffled = shuffle([...gameState.usedQuestions]);
      return [newShuffled[0], newShuffled.slice(1), []];
    }

    return [
      gameState.remainingQuestions[0],
      gameState.remainingQuestions.slice(1),
      [...gameState.usedQuestions, gameState.currentQuestion]
    ];
  };

  useEffect(() => {
    stockfishRef.current = new Worker('/stockfish.js');
    stockfishRef.current.addEventListener('message', handleStockfishMessage);
    stockfishRef.current.postMessage('uci');
    stockfishRef.current.postMessage('ucinewgame');

    return () => stockfishRef.current?.terminate();
  }, []);

  const getGameEndMessage = () => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        return game.turn() === 'b'
          ? "Hah! Checkmated by a baby. How delightfully pathetic! Your intellectual genealogy is as shallow as a colonial water basin."
          : "What?! This is preposterous! I demand a rematch... after I finish this episode of Jolly Farm Revue.";
      }
      if (game.isDraw()) {
        return "A draw? How dreadfully bourgeois. Like watching American Idol without the satisfaction of seeing dreams crushed.";
      }
      if (game.isStalemate()) {
        return "Stalemate? How pedestrian. Like a Walmart shopper trying to haggle.";
      }
      return "Game Over! Though the circumstances are... unclear.";
    }
    return null;
  };

  const handleStockfishMessage = (e: MessageEvent) => {
    const message = e.data;
    if (message.startsWith('bestmove')) {
      const move = message.split(' ')[1];
      game.move(move);
      setIsThinking(false);

      const endMessage = getGameEndMessage();
      if (endMessage) {
        setGameState(prev => ({
          ...prev,
          isQuizVisible: false,
          currentTaunt: endMessage
        }));
        return;
      }

      setGameState(prev => ({
        ...prev,
        isQuizVisible: false
      }));
    }
  };

  const makeAIMove = (difficulty: 'easy' | 'hard') => {
    setIsThinking(true);
    const depth = difficulty === 'easy' 
      ? Math.floor(Math.random() * 3) + 3
      : Math.floor(Math.random() * 3) + 16;

    if (difficulty === 'easy' && Math.random() < 0.2) {
      const moves = game.moves();
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      game.move(randomMove);
      setIsThinking(false);
      setGameState(prev => ({
        ...prev,
        isQuizVisible: false,
        currentTaunt: "Your move!"
      }));
      return;
    }

    stockfishRef.current?.postMessage(`position fen ${game.fen()}`);
    stockfishRef.current?.postMessage(`go depth ${depth}`);
  };

  const handleQuizAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;

    if (!game.isGameOver()) {
      const [nextQuestion, nextRemaining, nextUsed] = getNextQuestion();

      setGameState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        remainingQuestions: nextRemaining,
        usedQuestions: nextUsed,
        isQuizVisible: false,
        lastMoveCorrect: isCorrect,
        currentTaunt: isCorrect 
          ? gameState.currentQuestion.tauntCorrect 
          : gameState.currentQuestion.tauntIncorrect
      }));

      makeAIMove(isCorrect ? 'easy' : 'hard');
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      const endMessage = getGameEndMessage();
      if (endMessage) {
        setGameState(prev => ({
          ...prev,
          isQuizVisible: false,
          currentTaunt: endMessage
        }));
        return true;
      }

      setGameState(prev => ({
        ...prev,
        isQuizVisible: true
      }));

      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  };

  const questionNumber = gameState.usedQuestions.length + 1;
  const totalQuestions = quizQuestions.length;

  // Create a Stewie avatar image tag that links to the main image
  const stewieAvatar = (
    <div 
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(0, 195, 255, 0.8)',
        boxShadow: '0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset',
        margin: '0 auto 5px',
        animation: isThinking ? 'glow 1.5s infinite ease-in-out' : 'none',
        background: 'radial-gradient(circle at center, #0c1b30 0%, #050c17 90%)'
      }}
    >
      <img 
        src="/assets/stewie.png" 
        alt="AI Stewie"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'drop-shadow(0 0 8px rgba(0, 195, 255, 0.7))'
        }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 12, 23, 0.3) 90%)',
        borderRadius: '50%',
        zIndex: 2
      }}></div>
      {isThinking && (
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '4px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 3
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '30%',
            background: 'linear-gradient(90deg, #054487, #00a2ff)',
            borderRadius: '2px',
            animation: 'thinkingPulse 1.2s infinite',
          }}></div>
        </div>
      )}
    </div>
  );

  // Custom light and dark square colors for the chess board
  const customDarkSquareStyle = { 
    backgroundColor: '#193f6e', 
    boxShadow: 'inset 0 0 3px rgba(0, 195, 255, 0.3)'
  };
  const customLightSquareStyle = { 
    backgroundColor: '#236ab0', 
    boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.2)'
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
        overflow: 'hidden',
        padding: '10px',
        position: 'relative'
      }}
    >
      {/* Digital circuit decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '1px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '1px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)',
        boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)',
        zIndex: 1
      }}></div>

      {/* Header Section with Stewie Avatar */}
      <div 
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '10px',
          marginBottom: '10px',
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h1 
          style={{
            margin: '0 0 5px 0',
            fontSize: '28px',
            fontWeight: '800',
            background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px rgba(0, 195, 255, 0.3)',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px'
          }}
        >
          PLANETARY CHESS
        </h1>
        
        {stewieAvatar}
        
        <div 
          style={{
            backgroundColor: 'rgba(0, 30, 60, 0.7)',
            borderRadius: '8px',
            padding: '8px 15px',
            marginBottom: '5px',
            width: '85%',
            maxWidth: '500px',
            border: '1px solid rgba(0, 195, 255, 0.3)',
            boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '10px solid rgba(0, 30, 60, 0.7)',
            }}
          ></div>
          
          <p 
            style={{
              color: '#e8f4ff',
              margin: 0,
              fontSize: '14px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
              fontStyle: 'italic'
            }}
          >
            {isThinking ? (
              <span>
                Processing neural pathways
                <span style={{display: 'inline-block', animation: 'blink 1.2s infinite'}}>...</span>
              </span>
            ) : (
              gameState.currentTaunt
            )}
          </p>
        </div>
        
        <div 
          style={{
            color: '#7cb3e8',
            fontSize: '12px',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            marginBottom: '5px'
          }}
        >
          <span style={{color: '#7cb3e8'}}>QUANTUM INQUIRY</span>{' '}
          <span style={{color: '#4aa8ff'}}>{questionNumber}</span>{' '}
          <span style={{color: '#7cb3e8'}}>OF</span>{' '}
          <span style={{color: '#4aa8ff'}}>{totalQuestions}</span>
        </div>
        
        <button 
          onClick={() => navigate('/')} 
          style={{
            padding: '5px 10px',
            background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
            color: '#e8f4ff',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: '1px solid rgba(0, 195, 255, 0.3)',
            boxShadow: '0 0 5px rgba(0, 195, 255, 0.2)',
            transition: 'all 0.2s ease',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 5px rgba(0, 195, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Return to Base
        </button>
      </div>
  
      {/* Chessboard Section with Glowing Effect */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        <div 
          style={{
            width: '90%',
            maxWidth: '400px',
            margin: '0 auto',
            position: 'relative',
            borderRadius: '10px',
            padding: '10px',
            background: 'linear-gradient(135deg, #081b33 0%, #0e2a4c 100%)',
            boxShadow: '0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
            border: '1px solid rgba(0, 195, 255, 0.2)'
          }}
        >
          <Chessboard 
            id="PlayVsAI"
            position={game.fen()} 
            onPieceDrop={onDrop}
            boardOrientation="black"
            customDarkSquareStyle={customDarkSquareStyle}
            customLightSquareStyle={customLightSquareStyle}
            boardWidth={window.innerWidth < 400 ? window.innerWidth * 0.8 : 380}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(0, 195, 255, 0.2)'
            }}
          />
          
          {/* Glowing border effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0, 195, 255, 0.1) inset',
            pointerEvents: 'none',
            zIndex: 10
          }}></div>
        </div>
      </div>
  
      {/* Quiz Section */}
      {gameState.isQuizVisible && (
        <div style={{
          width: '90%',
          maxWidth: '400px',
          backgroundColor: 'rgba(0, 20, 40, 0.8)',
          backdropFilter: 'blur(5px)',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
          padding: '15px',
          margin: '15px auto',
          border: '1px solid rgba(0, 195, 255, 0.2)',
          position: 'relative',
          zIndex: 3
        }}>
          <h3 style={{
            fontSize: '16px',
            color: '#e8f4ff',
            marginTop: 0,
            marginBottom: '15px',
            lineHeight: '1.4',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            {gameState.currentQuestion.question}
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '8px'
          }}>
            {gameState.currentQuestion.options.map((option: string, index: number) => (
              <button
                key={option}
                onClick={() => handleQuizAnswer(option)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: 'linear-gradient(135deg, #054487 0%, #0A67B3 100%)',
                  color: '#e8f4ff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 195, 255, 0.3)',
                  boxShadow: '0 0 10px rgba(0, 195, 255, 0.1), 0 0 5px rgba(0, 0, 0, 0.2) inset',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.3), 0 0 5px rgba(0, 0, 0, 0.2) inset';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.1), 0 0 5px rgba(0, 0, 0, 0.2) inset';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(0, 195, 255, 0.2)',
                  marginRight: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#e8f4ff',
                  border: '1px solid rgba(0, 195, 255, 0.4)',
                  fontFamily: '"Orbitron", sans-serif',
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                
                {/* Glow effect on hover */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  right: '-50%',
                  bottom: '-50%',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 195, 255, 0.1), transparent)',
                  transform: 'rotate(25deg) translateX(-100%)',
                  transition: 'transform 0.6s',
                  pointerEvents: 'none'
                }}></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game status indicator */}
      <div style={{
        width: '80%',
        maxWidth: '400px',
        margin: '10px auto',
        height: '4px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '15px',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: isThinking ? '100%' : '30%',
          background: 'linear-gradient(90deg, #054487, #00a2ff)',
          borderRadius: '2px',
          animation: isThinking ? 'pulse 1.5s infinite' : 'none',
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      {/* Add an animation for AI thinking */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; width: 30%; }
            50% { opacity: 1; width: 100%; }
            100% { opacity: 0.6; width: 30%; }
          }
          @keyframes thinkingPulse {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          @keyframes blink {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
          @keyframes glow {
            0% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
            50% { box-shadow: 0 0 25px rgba(0, 195, 255, 0.8), 0 0 8px rgba(0, 195, 255, 0.9) inset; }
            100% { box-shadow: 0 0 15px rgba(0, 195, 255, 0.5), 0 0 5px rgba(0, 195, 255, 0.8) inset; }
          }
        `}
      </style>
    </div>
  ); 
}

export default Game;