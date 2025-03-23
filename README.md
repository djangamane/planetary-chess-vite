# Planetary Chess

A futuristic chess game featuring AI Cyber Stewie as the opponent. The game combines chess strategy with quiz questions about systemic racism, inspired by Dr. Francis Cress Welsing's concept of Planetary Chess.

## Features

- Futuristic UI with advanced tech aesthetic
- Answer quiz questions correctly to weaken your AI opponent
- Responsive design that works on desktop and mobile devices
- Interactive chessboard with custom styling

## Development

This project is built with:
- React
- TypeScript
- Vite
- chess.js and react-chessboard

### Running locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for production

```bash
npm run build
```

## Deploying to Render

This project is configured for easy deployment on Render as a static site.

1. Push your code to a GitHub/GitLab repository
2. Create a new Static Site on Render
3. Connect your repository
4. Use these settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
5. Click "Create Static Site"

The render.yaml file is provided for convenience if you want to use Render's Blueprint feature for deployment.

## Mobile Support

The project also includes Capacitor configuration for Android builds. To build for Android:

1. Ensure you have Android development environment set up
2. Run: `npx cap sync`
3. Open Android Studio: `npx cap open android`

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