import { motion } from 'framer-motion';

/**
 * Calculate game statistics from games array
 * @param {Array} games - Array of game objects
 * @returns {Object} Statistics object
 */
export function calculateGameStats(games) {
  if (!games || games.length === 0) {
    return {
      total: 0,
      inProgress: 0,
      exciting: 0,
      overtime: 0
    };
  }

  const total = games.length;
  
  // In progress games (status === 2)
  const inProgress = games.filter(game => game.gameStatus === 2).length;
  
  // Exciting games: completed games with score difference <= 5 points
  const exciting = games.filter(game => {
    if (game.gameStatus !== 3) return false; // Only completed games
    if (game.awayTeam?.score === null || game.homeTeam?.score === null) return false;
    const scoreDiff = Math.abs(game.awayTeam.score - game.homeTeam.score);
    return scoreDiff <= 5;
  }).length;
  
  // Overtime games: period > 4 or status text contains "ot"/"overtime"
  const overtime = games.filter(game => {
    return game.period > 4 || 
           (game.gameStatusText && (
             game.gameStatusText.toLowerCase().includes('ot') ||
             game.gameStatusText.toLowerCase().includes('overtime')
           ));
  }).length;

  return {
    total,
    inProgress,
    exciting,
    overtime
  };
}

/**
 * Game Statistics Summary Bar Component
 * @param {Array} games - Array of game objects
 */
function GameStatsSummary({ games }) {
  const stats = calculateGameStats(games);

  // Don't render if no games
  if (stats.total === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#16181c]/80 backdrop-blur-xl rounded-xl border border-[#2f3336]/50 px-4 py-3 mb-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Total Games */}
        <div className="flex items-center gap-2">
          <span className="text-[#71767a] text-sm">·</span>
          <span className="text-white text-sm font-medium">
            {stats.total} 场比赛
          </span>
        </div>

        {/* In Progress */}
        {stats.inProgress > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#71767a] text-sm">·</span>
            <span className="text-orange-400 text-sm font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              {stats.inProgress} 进行中
            </span>
          </div>
        )}

        {/* Exciting Games */}
        {stats.exciting > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#71767a] text-sm">·</span>
            <span className="text-blue-400 text-sm font-medium">
              {stats.exciting} 精彩
            </span>
          </div>
        )}

        {/* Overtime Games */}
        {stats.overtime > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#71767a] text-sm">·</span>
            <span className="text-purple-400 text-sm font-medium">
              {stats.overtime} 加时
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default GameStatsSummary;

