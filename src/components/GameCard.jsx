import { Link } from 'react-router-dom';
import { memo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const GameCard = memo(function GameCard({ game }) {
  // Team color mapping for left border
  const getTeamColor = (teamAbbreviation) => { // Supports both abbreviation and teamAbbreviation
    const colors = {
      'ATL': '#E03A3E', 'BOS': '#007A33', 'BKN': '#000000', 'CHA': '#1D1160',
      'CHI': '#CE1141', 'CLE': '#860038', 'DAL': '#00538C', 'DEN': '#0E2240',
      'DET': '#C8102E', 'GSW': '#1D428A', 'HOU': '#CE1141', 'IND': '#002D62',
      'LAC': '#C8102E', 'LAL': '#552583', 'MEM': '#5D76A9', 'MIA': '#98002E',
      'MIL': '#00471B', 'MIN': '#0C2340', 'NO': '#0C2340', 'NOP': '#0C2340',
      'NY': '#006BB6', 'NYK': '#006BB6', 'OKC': '#007AC1', 'ORL': '#0077C0',
      'PHI': '#006BB6', 'PHX': '#1D1160', 'POR': '#E03A3E', 'SAC': '#5A2D81',
      'SA': '#C4CED4', 'SAS': '#C4CED4', 'TOR': '#CE1141', 'UTA': '#002B5C',
      'WAS': '#002B5C', 'WIZ': '#002B5C'
    };
    return colors[teamAbbreviation?.toUpperCase()] || '#1d9bf0';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'bg-gradient-to-r from-[#16181c] to-[#181818] text-[#71767a] border border-[#2f3336]';
      case 2:
        return 'bg-gradient-to-r from-orange-900/40 to-orange-800/30 text-orange-400 border border-orange-500/50 animate-pulse shadow-lg shadow-orange-900/20';
      case 3:
        return 'bg-gradient-to-r from-green-900/40 to-green-800/30 text-green-400 border border-green-500/50';
      default:
        return 'bg-gradient-to-r from-[#16181c] to-[#181818] text-[#71767a] border border-[#2f3336]';
    }
  };

  const statusInfo = {
    1: '已安排',
    2: '直播中',
    3: '已结束'
  };

  // Format period text for live games (Q1, Q2, Q3, Q4, OT1, OT2, etc.)
  const getPeriodText = (period, gameStatusText) => {
    if (!period) return '';
    
    // Check for halftime
    if (gameStatusText && gameStatusText.toLowerCase().includes('halftime')) {
      return 'Halftime';
    }
    
    // Regular quarters
    if (period <= 4) {
      return `Q${period}`;
    }
    
    // Overtime periods
    const otNumber = period - 4;
    return `OT${otNumber}`;
  };

  // Get status text for display
  const getStatusDisplayText = () => {
    if (game.gameStatus === 2) {
      // Live game - show period or halftime
      const periodText = getPeriodText(game.period, game.gameStatusText);
      if (periodText) {
        return periodText;
      }
      // Fallback to gameStatusText if period not available
      if (game.gameStatusText && game.gameStatusText.toLowerCase().includes('halftime')) {
        return 'Halftime';
      }
      return game.gameStatusText || '直播中';
    }
    return statusInfo[game.gameStatus] || game.gameStatusText || '';
  };

  // Get primary team color for border (use away team or home team)
  // Support both old and new field names during migration
  const primaryColor = getTeamColor(
    game.awayTeam.abbreviation || game.awayTeam.teamTricode || game.awayTeam.teamAbbreviation ||
    game.homeTeam.abbreviation || game.homeTeam.teamTricode || game.homeTeam.teamAbbreviation
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
    <Link
      to={`/games/${game.gameId}`}
        className="block group relative"
      >
        {/* Glassmorphism Card */}
        <div 
          className={`relative backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            game.gameStatus === 2
              ? 'bg-orange-950/30 border-orange-500/50 hover:bg-orange-950/40 hover:border-orange-500/70 hover:shadow-2xl hover:shadow-orange-900/30'
              : 'bg-[#16181c]/80 border-[#2f3336]/50 hover:bg-[#16181c]/90 hover:border-[#2f3336] hover:shadow-2xl hover:shadow-black/50'
          }`}
          style={{
            boxShadow: game.gameStatus === 2 
              ? '0 8px 32px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Colored Left Border */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="p-6 pl-7">
            {/* Premium Status Badge */}
            <div className="flex justify-between items-start mb-5">
              {/* LIVE Badge - Always show for live games */}
              {game.gameStatus === 2 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white border border-orange-500 animate-pulse"
                  style={{
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  LIVE
                </motion.span>
              )}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${getStatusColor(
              game.gameStatus
            )}`}
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
          >
            {getStatusDisplayText()}
              </motion.span>
        </div>

        {/* Teams and Scores */}
            <div className="space-y-5">
          {/* Away Team */}
              <motion.div 
                className="flex items-center justify-between"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Larger Centered Logo */}
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#181818]/50 rounded-xl p-2 border border-[#2f3336]/50 backdrop-blur-sm">
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name || game.awayTeam.teamName}
                      className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg truncate">
                  {game.awayTeam.city || game.awayTeam.teamCity} {game.awayTeam.name || game.awayTeam.teamName}
                </div>
                    <div className="text-sm text-[#71767a] mt-0.5">
                  {game.awayTeam.wins}-{game.awayTeam.losses}
                </div>
              </div>
            </div>
            {game.awayTeam.score !== null && (
                  <motion.div 
                    className={`text-3xl font-bold ml-4 flex-shrink-0 ${
                      game.gameStatus === 2 
                        ? 'text-orange-400 animate-pulse' 
                        : 'text-white'
                    }`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                {game.awayTeam.score}
                  </motion.div>
            )}
              </motion.div>

              {/* Divider */}
              <div className="flex items-center justify-center py-1">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2f3336] to-transparent" />
                <span className="px-3 text-[#71767a] text-xs">VS</span>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2f3336] to-transparent" />
          </div>

          {/* Home Team */}
              <motion.div 
                className="flex items-center justify-between"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Larger Centered Logo */}
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#181818]/50 rounded-xl p-2 border border-[#2f3336]/50 backdrop-blur-sm">
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name || game.homeTeam.teamName}
                      className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg truncate">
                  {game.homeTeam.city || game.homeTeam.teamCity} {game.homeTeam.name || game.homeTeam.teamName}
                </div>
                    <div className="text-sm text-[#71767a] mt-0.5">
                  {game.homeTeam.wins}-{game.homeTeam.losses}
                </div>
              </div>
            </div>
            {game.homeTeam.score !== null && (
                  <motion.div 
                    className={`text-3xl font-bold ml-4 flex-shrink-0 ${
                      game.gameStatus === 2 
                        ? 'text-orange-400 animate-pulse' 
                        : 'text-white'
                    }`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                {game.homeTeam.score}
                  </motion.div>
            )}
              </motion.div>
        </div>

        {/* Game Time */}
        {game.gameStatus === 1 && game.gameEt && (
              <motion.div 
                className="mt-5 pt-5 border-t border-[#2f3336]/50 text-sm text-[#71767a] text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {game.gameEtFormatted?.time || game.gameEt}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Subtle glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}15 0%, transparent 50%)`,
            }}
          />
      </div>
    </Link>
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard;
