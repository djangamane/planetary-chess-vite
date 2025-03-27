import { useState, useRef, useEffect } from 'react';
import { Chess, type Chess as ChessType } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { quizQuestions, type QuizQuestion } from '../data/quizQuestions';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { calculateScore } from '../utils/scoring';
import { shuffle } from 'lodash';

type GameState = {
  currentQuestion: QuizQuestion;
  remainingQuestions: QuizQuestion[];
  usedQuestions: QuizQuestion[];
  isQuizVisible: boolean;
  lastMoveCorrect: boolean | null;
  currentTaunt: string;
  isGameOver: boolean; // Added to track game over state explicitly
};

function Game() {
  const navigate = useNavigate();
  const [game] = useState<ChessType>(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionsResetCount, setQuestionsResetCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  // Initialize game state with shuffled questions
  const [gameState, setGameState] = useState<GameState>(() => {
    const shuffledQuestions = shuffle([...quizQuestions]);
    return {
      currentQuestion: shuffledQuestions[0],
      remainingQuestions: shuffledQuestions.slice(1),
      usedQuestions: [],
      isQuizVisible: true,
      lastMoveCorrect: null,
      currentTaunt: "Before I make my first move, let's see how much you know...",
      isGameOver: false, // Initialize game over state
    };
  });

  const stockfishRef = useRef<Worker | null>(null);

  // Get next question and handle reshuffling when all questions are used
  const getNextQuestion = (): [QuizQuestion, QuizQuestion[], QuizQuestion[]] => {
    // Check if we need to reshuffle (all questions used)
    const needReshuffle = gameState.remainingQuestions.length === 0;

    // Increment reset count if reshuffling
    if (needReshuffle) {
      setQuestionsResetCount(prev => prev + 1);
      console.log("DEBUG: Reshuffling questions, incrementing reset count.");
    }

    const questionsToShuffle = needReshuffle ? [...gameState.usedQuestions] : [...gameState.remainingQuestions];
    const shuffled = shuffle(questionsToShuffle);

    const nextQuestion = shuffled[0];
    const nextRemaining = shuffled.slice(1);
    // If we reshuffled, usedQuestions starts fresh (excluding the new current one)
    // Otherwise, add the current question to usedQuestions
    const nextUsed = needReshuffle ? [] : [...gameState.usedQuestions, gameState.currentQuestion];

    return [nextQuestion, nextRemaining, nextUsed];
  };


  // --- Centralized Game Status Check ---
  const checkGameStatusAndUpdateState = async () => {
    console.log(`DEBUG: Checking game status. isGameOver: ${game.isGameOver()}, isCheckmate: ${game.isCheckmate()}, turn: ${game.turn()}`);

    if (game.isCheckmate()) {
      // Corrected logic based on logs: turn() indicates the player who CANNOT move.
      const playerWon = game.turn() === 'w'; // White (Player) cannot move => Player Won
      const aiWon = game.turn() === 'b';    // Black (AI) cannot move => AI Won

      if (playerWon) {
        // --- PLAYER WIN CONDITION ---
        console.log("Player win condition met!");
        const moves = game.history().length;
        // Pass the reset count to the scoring function
        const score = calculateScore(correctAnswersCount, incorrectAnswersCount, Math.ceil(moves / 2), questionsResetCount);
        // Update log to include reset count
        console.log(`Calculated Score: ${score}, Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}, Moves: ${Math.ceil(moves / 2)}, Resets: ${questionsResetCount}`);

        setGameState(prev => ({ ...prev, isGameOver: true, isQuizVisible: false })); // Mark game over immediately

        // Handle leaderboard logic (async)
        try {
          console.log("Fetching leaderboard...");
          const { data: leaderboard, error: fetchError } = await supabase
            .from('scores')
            .select('score')
            .order('score', { ascending: false })
            .limit(10);

          if (fetchError) throw fetchError;
          console.log("Leaderboard data:", leaderboard);

          const qualifies = !leaderboard || leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score;
          console.log(`Qualifies for leaderboard: ${qualifies}`);

          if (qualifies) {
            console.log("Prompting for name...");
            const playerName = window.prompt(`You have ranked on the Planetary Chess leaderboard with a score of ${score}! What's your handle?`);
            console.log(`Player entered name: ${playerName}`);

            if (playerName && playerName.trim() !== '') {
              console.log("Saving score to Supabase...");
              const { error: insertError } = await supabase
                .from('scores')
                .insert([{ name: playerName.trim(), score: score }]);

              if (insertError) throw insertError;

              console.log("Score saved successfully.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. Saved to leaderboard as ${playerName.trim()}!` }));
            } else {
              console.log("Player cancelled or entered empty name.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. You qualified but didn't enter a name.` }));
            }
          } else {
            setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Your score: ${score}. Not quite enough for the leaderboard this time.` }));
          }
        } catch (err) {
          console.error("Error handling win condition:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. An error occurred processing the leaderboard: ${errorMessage}` }));
        }
        return true; // Game ended

      } else if (aiWon) {
        // --- AI WIN CONDITION ---
        console.log("AI win condition met.");
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          isQuizVisible: false,
          currentTaunt: "Hah! Checkmated by a baby. How delightfully pathetic! Your intellectual genealogy is as shallow as a colonial water basin."
        }));
        return true; // Game ended
      }
    } else if (game.isDraw()) {
      console.log("Draw condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "A draw? How dreadfully bourgeois. Like watching American Idol without the satisfaction of seeing dreams crushed."
      }));
      return true; // Game ended
    } else if (game.isStalemate()) {
      console.log("Stalemate condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Stalemate? How pedestrian. Like a Walmart shopper trying to haggle."
      }));
      return true; // Game ended
    } else if (game.isInsufficientMaterial()) {
       console.log("Insufficient material condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Insufficient material? A pathetic end. Like bringing a spork to a laser gun fight."
      }));
      return true; // Game ended
    } else if (game.isThreefoldRepetition()) {
       console.log("Threefold repetition condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Threefold repetition? Are you stuck in a temporal loop, you simpleton?"
      }));
      return true; // Game ended
    }

    // --- Game Continues ---
    console.log("Game continues.");
    return false; // Game did not end
  };
  // --- End Centralized Game Status Check ---


  useEffect(() => {
    stockfishRef.current = new Worker('/stockfish.js');
    stockfishRef.current.addEventListener('message', handleStockfishMessage);
    stockfishRef.current.postMessage('uci');
    stockfishRef.current.postMessage('ucinewgame');

    return () => stockfishRef.current?.terminate();
  }, []);


  const handleStockfishMessage = async (e: MessageEvent) => {
    const message = e.data;
    if (message.startsWith('bestmove')) {
      const move = message.split(' ')[1];
      console.log(`DEBUG: Stockfish suggests move: ${move}`);
      if (move && move !== '(none)') { // Ensure move is valid
         game.move(move);
      } else {
         console.warn("Stockfish returned invalid move:", move);
      }
      setIsThinking(false);

      // Check game status AFTER AI move
      const gameEnded = await checkGameStatusAndUpdateState();

      if (!gameEnded) {
        // If game didn't end, it's player's turn, don't show quiz
        setGameState(prev => ({
          ...prev,
          isQuizVisible: false, // Hide quiz after AI moves
          currentTaunt: prev.currentTaunt // Keep the taunt from the quiz answer
        }));
      }
    }
  };

  const makeAIMove = (difficulty: 'easy' | 'hard') => {
    if (gameState.isGameOver) return; // Don't move if game is already over

    setIsThinking(true);
    // Lower the 'easy' depth range to 1-3
    const depth = difficulty === 'easy'
      ? Math.floor(Math.random() * 3) + 1
      : Math.floor(Math.random() * 3) + 16; // Keep 'hard' depth as 16-18

    // Simplified: Always use Stockfish for now, remove random move logic
    console.log(`DEBUG: Requesting Stockfish move with depth ${depth}`);
    stockfishRef.current?.postMessage(`position fen ${game.fen()}`);
    stockfishRef.current?.postMessage(`go depth ${depth}`);
  };

  const handleQuizAnswer = (selectedAnswer: string) => {
    if (gameState.isGameOver) return; // Don't process if game over

    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;

    // Update answer counts
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setIncorrectAnswersCount(prev => prev + 1);
    }

    const [nextQuestion, nextRemaining, nextUsed] = getNextQuestion();

    // Set taunt based on answer, prepare for AI move
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      remainingQuestions: nextRemaining,
      usedQuestions: nextUsed,
      isQuizVisible: false, // Hide quiz immediately
      lastMoveCorrect: isCorrect,
      currentTaunt: isCorrect
        ? gameState.currentQuestion.tauntCorrect
        : gameState.currentQuestion.tauntIncorrect
    }));

    // Trigger AI move after setting state
    makeAIMove(isCorrect ? 'easy' : 'hard');
  };

  // Must be synchronous for react-chessboard
  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameState.isGameOver) return false; // Don't allow moves if game over

    let moveSuccessful = false;
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Assuming promotion to queen
      });

      if (move === null) {
        console.log("DEBUG: Invalid player move attempted.");
        moveSuccessful = false;
      } else {
         console.log(`DEBUG: Player moved ${sourceSquare}-${targetSquare}`);
         moveSuccessful = true;

         // Call the async check function but don't await it
         checkGameStatusAndUpdateState().then(gameEnded => {
            if (!gameEnded) {
              // If game didn't end, show quiz for AI's turn
              console.log("DEBUG: Game continues, showing quiz.");
              setGameState(prev => ({
                ...prev,
                isQuizVisible: true // Show quiz before AI moves
              }));
            }
         }).catch(err => {
             // Handle potential errors from the async check if necessary
             console.error("Error during async game status check:", err);
         });
      }

    } catch (error) {
      console.error('Move error:', error);
      moveSuccessful = false; // Move failed
    }

    // Return the synchronous result of the move attempt
    return moveSuccessful;
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
        src="/assets/stewie.png" // Ensure this path is correct relative to the public folder
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
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: '0 0 5px rgba(0, 195, 255, 0.3)', zIndex: 1 }}></div>

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
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 195, 255, 0.1) inset', pointerEvents: 'none', zIndex: 10 }}></div>
        </div>
      </div>

      {/* Quiz Section */}
      {!gameState.isGameOver && gameState.isQuizVisible && ( // Only show quiz if game not over and visible flag is true
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
          width: isThinking ? '100%' : '30%', // Example width change
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