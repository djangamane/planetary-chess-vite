import { useState, useRef, useEffect } from 'react';
import { Chess, type Chess as ChessType } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { quizQuestions } from '../data/quizQuestions';

type GameState = {
  currentQuestionIndex: number;
  isQuizVisible: boolean;
  lastMoveCorrect: boolean | null;
  currentTaunt: string;
};

function Game() {
  const [game] = useState<ChessType>(new Chess());
  const [isThinking, setIsThinking] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    isQuizVisible: true,
    lastMoveCorrect: null,
    currentTaunt: "Before I make my first move, let's see how much you know..."
  });
  
  const stockfishRef = useRef<Worker | null>(null);

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
        return game.turn() === 'b'  // If it's black's turn, that means white (Stewie) just won
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

      // Keep the previous taunt (from quiz answer) visible until next move
      setGameState(prev => ({
        ...prev,
        isQuizVisible: false
      }));
    }
  };

  const makeAIMove = (difficulty: 'easy' | 'hard') => {
    setIsThinking(true);
    // Easy mode: depth 3-5 (more tactical mistakes)
    // Hard mode: depth 16-18 (very strong play)
    const depth = difficulty === 'easy' 
      ? Math.floor(Math.random() * 3) + 3  // Random depth between 3-5
      : Math.floor(Math.random() * 3) + 16; // Random depth between 16-18

    // For easy mode, occasionally make a random legal move instead of using Stockfish
    if (difficulty === 'easy' && Math.random() < 0.2) { // 20% chance of random move
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

  const handleQuizAnswer = (questionId: number, selectedAnswer: string) => {
    const question = quizQuestions[questionId % quizQuestions.length];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (!game.isGameOver()) {
      // Show quiz result taunt first
      setGameState(prev => ({
        ...prev,
        isQuizVisible: false,
        lastMoveCorrect: isCorrect,
        currentTaunt: isCorrect ? question.tauntCorrect : question.tauntIncorrect,
        currentQuestionIndex: (prev.currentQuestionIndex + 1) % quizQuestions.length
      }));

      // Make AI move with appropriate difficulty
      makeAIMove(isCorrect ? 'easy' : 'hard');
    }
  };

  const getPostMoveMessage = () => {
    if (game.inCheck()) {
      return "Oh my! Someone's learned how to say 'check'. How... primitive.";
    }
    const randomTaunts = [
      "How predictably pedestrian...",
      "Is that what passes for strategy in your dimension?",
      "Oh, bravo! You've mastered moving pieces. Next up: walking and chewing gum.",
      "A move worthy of a preschool prodigy... and I don't mean that as a compliment.",
      "*sigh* Must we continue this charade of competence?",
    ];
    return randomTaunts[Math.floor(Math.random() * randomTaunts.length)];
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
      
      // Show next quiz and keep current taunt
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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Planetary Chess</h1>
      
      <div className="relative mb-8">
        <h2 className="text-xl text-white text-center mb-4">
          {isThinking ? "AI Stewie is thinking..." : `AI Stewie says: ${gameState.currentTaunt}`}
          {isThinking && <span className="ml-2 animate-spin inline-block">⚙️</span>}
        </h2>
        <div className="text-gray-400 text-center text-sm">
          Question {(gameState.currentQuestionIndex % quizQuestions.length) + 1} of {quizQuestions.length} (Questions will cycle)
        </div>
      </div>
      
      <div className="mb-8">
        <Chessboard 
          id="PlayVsAI"
          position={game.fen()} 
          onPieceDrop={onDrop}
          boardOrientation="black"
        />
      </div>

      {gameState.isQuizVisible && (
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-xl text-white mb-4">
            {quizQuestions[gameState.currentQuestionIndex % quizQuestions.length].question}
          </h3>
          {quizQuestions[gameState.currentQuestionIndex % quizQuestions.length].options.map((option: string) => (
            <button
              key={option}
              onClick={() => handleQuizAnswer(gameState.currentQuestionIndex, option)}
              className="w-full p-3 mb-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {option} {option.match(/^\d+$/) ? 'moves' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Game;