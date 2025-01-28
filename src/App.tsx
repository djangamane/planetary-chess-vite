import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './components/Game';
import WelcomeScreen from './components/WelcomeScreen';
import Leaderboard from './components/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;