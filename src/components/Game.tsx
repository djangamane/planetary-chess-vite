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


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-[800px]"> {/* Increased max width significantly */}
        <div className="flex flex-col items-center space-y-1"> {/* Reduced spacing */}
          <h1 className="text-xl font-bold text-white">Planetary Chess</h1>
          <h2 className="text-sm text-white text-center">
            {isThinking ? (
              <span>
                AI Stewie is thinking...
                <span className="ml-1 animate-spin inline-block">⚙️</span>
              </span>
            ) : (
              `AI Stewie says: ${gameState.currentTaunt}`
            )}
          </h2>
          <div className="text-gray-400 text-xs">
            Question {questionNumber} of {totalQuestions}
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 
                     transition-colors duration-200 text-xs font-semibold"
          >
            ← Back
          </button>

          <div className="w-[600px]"> {/* Fixed width for consistent board size */}
            <Chessboard 
              id="PlayVsAI"
              position={game.fen()} 
              onPieceDrop={onDrop}
              boardOrientation="black"
              boardWidth={600}
            />
          </div>

          {gameState.isQuizVisible && (
            <div className="w-full max-w-[600px] bg-gray-800 rounded shadow-lg p-2">
              <h3 className="text-xs text-white mb-1">
                {gameState.currentQuestion.question}
              </h3>
              <div className="grid gap-1">
                {gameState.currentQuestion.options.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => handleQuizAnswer(option)}
                    className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded 
                             transition-colors text-xs whitespace-normal text-left"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }
  export default Game;