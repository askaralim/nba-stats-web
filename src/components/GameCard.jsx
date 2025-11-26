import { Link } from 'react-router-dom';

function GameCard({ game }) {
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
    <Link
      to={`/games/${game.gameId}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex justify-end mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              game.gameStatus
            )}`}
          >
            {statusInfo[game.gameStatus] || game.gameStatusText}
            {game.gameStatus === 2 && game.gameStatusText && ` - ${game.gameStatusText}`}
          </span>
        </div>

        {/* Teams and Scores */}
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.teamName}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {game.awayTeam.teamCity} {game.awayTeam.teamName}
                </div>
                <div className="text-sm text-gray-500">
                  {game.awayTeam.wins}-{game.awayTeam.losses}
                </div>
              </div>
            </div>
            {game.awayTeam.score !== null && (
              <div className="text-2xl font-bold text-gray-900">
                {game.awayTeam.score}
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.teamName}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {game.homeTeam.teamCity} {game.homeTeam.teamName}
                </div>
                <div className="text-sm text-gray-500">
                  {game.homeTeam.wins}-{game.homeTeam.losses}
                </div>
              </div>
            </div>
            {game.homeTeam.score !== null && (
              <div className="text-2xl font-bold text-gray-900">
                {game.homeTeam.score}
              </div>
            )}
          </div>
        </div>

        {/* Game Time */}
        {game.gameStatus === 1 && game.gameEt && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 text-center">
            {new Date(game.gameEt).toLocaleString('zh-CN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

export default GameCard;

