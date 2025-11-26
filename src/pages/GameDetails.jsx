import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function GameDetails() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGameDetails = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/nba/games/${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      const data = await response.json();
      setGame(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching game details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameDetails();

    // Auto-refresh every 2 seconds if game is live
    const interval = setInterval(() => {
      if (game?.gameStatus === 2) {
        fetchGameDetails();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameId, game?.gameStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载比赛详情...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载比赛失败</p>
        <p className="text-red-600 text-sm mb-4">{error || '未找到比赛'}</p>
        <div className="space-x-4">
          <button
            onClick={fetchGameDetails}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            重试
          </button>
          <Link
            to="/games"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            返回比赛列表
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'bg-gray-100 text-gray-700';
      case 2:
        return 'bg-red-100 text-red-700 animate-pulse';
      case 3:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusInfo = {
    1: '已安排',
    2: '直播中',
    3: '已结束'
  };

  return (
    <div>
      <Link
        to="/games"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回比赛列表
      </Link>

      {/* Game Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">比赛详情</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              game.gameStatus
            )}`}
          >
            {statusInfo[game.gameStatus] || game.gameStatusText}
            {game.gameStatus === 2 && game.gameStatusText && ` - ${game.gameStatusText}`}
          </span>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Away Team */}
          <div className="text-center">
            <img
              src={game.awayTeam.logo}
              alt={game.awayTeam.teamName}
              className="w-24 h-24 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {game.awayTeam.teamCity} {game.awayTeam.teamName}
            </h2>
            <p className="text-gray-600 mb-2">
              {game.awayTeam.wins}-{game.awayTeam.losses}
            </p>
            {game.awayTeam.score !== null && (
              <p className="text-4xl font-bold text-gray-900">{game.awayTeam.score}</p>
            )}
          </div>

          {/* Home Team */}
          <div className="text-center">
            <img
              src={game.homeTeam.logo}
              alt={game.homeTeam.teamName}
              className="w-24 h-24 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {game.homeTeam.teamCity} {game.homeTeam.teamName}
            </h2>
            <p className="text-gray-600 mb-2">
              {game.homeTeam.wins}-{game.homeTeam.losses}
            </p>
            {game.homeTeam.score !== null && (
              <p className="text-4xl font-bold text-gray-900">{game.homeTeam.score}</p>
            )}
          </div>
        </div>

        {/* Game Time */}
        {game.gameStatus === 1 && game.gameEt && (
          <div className="text-center text-gray-600">
            {new Date(game.gameEt).toLocaleString('zh-CN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </div>
        )}
      </div>

      {/* Score by Period Table */}
      {game.awayTeam.periods && game.awayTeam.periods.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">各节比分</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">球队</th>
                  {game.awayTeam.periods.map((period, idx) => (
                    <th
                      key={idx}
                      className="text-center py-3 px-4 font-semibold text-gray-700"
                    >
                      {period.periodType === 'REGULAR' ? `Q${period.period}` : `OT${period.period - 4}`}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">总分</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {game.awayTeam.teamCity} {game.awayTeam.teamName}
                  </td>
                  {game.awayTeam.periods.map((period, idx) => (
                    <td key={idx} className="text-center py-3 px-4 text-gray-700">
                      {period.score}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-bold text-gray-900">
                    {game.awayTeam.score}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {game.homeTeam.teamCity} {game.homeTeam.teamName}
                  </td>
                  {game.homeTeam.periods.map((period, idx) => (
                    <td key={idx} className="text-center py-3 px-4 text-gray-700">
                      {period.score}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-bold text-gray-900">
                    {game.homeTeam.score}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Game Leaders */}
      {game.gameLeaders && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">球星</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Away Team Leader */}
            {game.gameLeaders.awayLeaders && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {game.awayTeam.teamTricode}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-4">
                  {game.gameLeaders.awayLeaders.name}
                </p>
                <div className="space-y-2">
                  <div className="text-gray-700">
                    <span className="text-gray-600">得分：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.awayLeaders.points}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <span className="text-gray-600">篮板：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.awayLeaders.rebounds}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <span className="text-gray-600">助攻：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.awayLeaders.assists}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Home Team Leader */}
            {game.gameLeaders.homeLeaders && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {game.homeTeam.teamTricode}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-4">
                  {game.gameLeaders.homeLeaders.name}
                </p>
                <div className="space-y-2">
                  <div className="text-gray-700">
                    <span className="text-gray-600">得分：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.homeLeaders.points}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <span className="text-gray-600">篮板：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.homeLeaders.rebounds}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <span className="text-gray-600">助攻：</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {game.gameLeaders.homeLeaders.assists}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchGameDetails}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default GameDetails;

