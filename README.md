# Planetary Chess

A React-based chess game featuring an AI opponent (Stewie from Family Guy) with dynamic difficulty based on quiz performance. Players play as Black against Stewie (White), with each move triggering chess trivia questions.

## Features
- Interactive chess board with legal move validation
- Stockfish AI integration with dynamic difficulty levels
- Quiz system with cycling questions
- Stewie-themed taunts based on quiz performance
- Checkmate/game end detection

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

### First-Time Setup
1. Clone the repository:
```bash
git clone https://github.com/djangamane/planetary-chess-vite.git
```

2. Navigate to project directory:
```bash
cd planetary-chess-vite
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:5173`

### Playing the Game
1. The game starts with a quiz (Stewie/White moves first)
2. Answer the quiz question to determine AI difficulty
3. Make your move as Black
4. Each move triggers a new quiz question
5. Continue until checkmate or game end

## Technical Details
- Built with React 18 and TypeScript
- Uses chess.js for move validation
- Integrates Stockfish for AI moves
- React-chessboard for UI
- Vite for build tooling

## Development
To setup the development environment on a new machine:

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Clone this repository:
```bash
git clone https://github.com/djangamane/planetary-chess-vite.git
```
3. Install dependencies:
```bash
cd planetary-chess-vite
npm install
```
4. Start development server:
```bash
npm run dev
```

## Project Structure
```
planetary-chess-vite/
├── public/
│   └── stockfish.js    # Stockfish engine file
├── src/
│   ├── components/
│   │   └── Game.tsx    # Main game component
│   ├── data/
│   │   └── quizQuestions.ts   # Quiz questions and types
│   └── App.tsx         # Root component
```

## Contributing
Feel free to submit issues and enhancement requests!

## License
MIT License