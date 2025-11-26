import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import GamesToday from './pages/GamesToday';
import GameDetails from './pages/GameDetails';
import PlayerDetails from './pages/PlayerDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<GamesToday />} />
            <Route path="/games" element={<GamesToday />} />
            <Route path="/games/:gameId" element={<GameDetails />} />
            <Route path="/players/:playerId" element={<PlayerDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
