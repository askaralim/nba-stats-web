import { useState, useEffect, useCallback } from 'react';
import GameCard from '../components/GameCard';
import { API_BASE_URL } from '../config';

function GamesToday() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('');

  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/nba/games/today`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      console.log(data);
      setGames(data.games || []);
      setDate(data.date || '');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    // Auto-refresh every 2 seconds if there are live games
    const hasLiveGames = games.some(game => game.gameStatus === 2);
    if (!hasLiveGames) return;

    const interval = setInterval(() => {
      fetchGames();
    }, 2000);

    return () => clearInterval(interval);
  }, [games, fetchGames]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载比赛中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载比赛失败</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchGames}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">今日NBA比赛</h1>
        {date && (
          <p className="text-gray-600">
            {new Date(date).toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">今日暂无比赛</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.gameId} game={game} />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchGames}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default GamesToday;

