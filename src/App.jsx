import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import GamesToday from './pages/GamesToday';
import GameDetails from './pages/GameDetails';
import PlayerDetails from './pages/PlayerDetails';
import TeamsList from './pages/TeamsList';
import TeamDetails from './pages/TeamDetails';
import PlayerStats from './pages/PlayerStats';
import News from './pages/News';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<GamesToday />} />
            <Route path="/games/:gameId" element={<GameDetails />} />
            <Route path="/players/:playerId" element={<PlayerDetails />} />
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/teams/:teamAbbreviation" element={<TeamDetails />} />
            <Route path="/stats/players" element={<PlayerStats />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
