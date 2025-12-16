import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

function GameDetails() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const gameRef = useRef(null); // Use ref to track current game without causing re-renders

  // Update ref whenever game changes
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const fetchGameDetails = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(`${API_BASE_URL}/api/nba/games/${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      const data = await response.json();
      
      // If refreshing, only update if data changed to prevent unnecessary re-renders
      if (isRefresh && gameRef.current) {
        const gameChanged = JSON.stringify(gameRef.current) !== JSON.stringify(data);
        if (gameChanged) {
          setGame(data);
        }
      } else {
      setGame(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching game details:', err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
      setLoading(false);
      }
    }
  }, [gameId]); // Removed 'game' from dependencies to prevent infinite loop

  useEffect(() => {
    fetchGameDetails();
  }, [gameId, fetchGameDetails]);

  useEffect(() => {
    // Auto-refresh every 2 seconds if game is live
    if (game?.gameStatus !== 2) return;

    const interval = setInterval(() => {
      fetchGameDetails(true); // Pass isRefresh=true to prevent full reload
    }, 2000);

    return () => clearInterval(interval);
  }, [game?.gameStatus, fetchGameDetails]);

  // Helper function to get player identifier consistently
  const getPlayerId = (player) => {
    return player?.athleteId || player?.id || player?.name || '';
  };

  // Get top performer objects from backend (pre-calculated with team info)
  const getTopPerformerObjects = useCallback(() => {
    if (!game?.boxscore?.teams || game.boxscore.teams.length < 2) {
      return { 
        team1: { points: [], rebounds: [], assists: [], plusMinus: [], steals: [], blocks: [] },
        team2: { points: [], rebounds: [], assists: [], plusMinus: [], steals: [], blocks: [] }
      };
    }

    const [team1, team2] = game.boxscore.teams;
    
    // Use pre-calculated topPerformers from backend (team info already included)
    return {
      team1: {
        points: team1.topPerformers?.points || [],
        rebounds: team1.topPerformers?.rebounds || [],
        assists: team1.topPerformers?.assists || [],
        plusMinus: team1.topPerformers?.plusMinus || [],
        steals: team1.topPerformers?.steals || [],
        blocks: team1.topPerformers?.blocks || []
      },
      team2: {
        points: team2.topPerformers?.points || [],
        rebounds: team2.topPerformers?.rebounds || [],
        assists: team2.topPerformers?.assists || [],
        plusMinus: team2.topPerformers?.plusMinus || [],
        steals: team2.topPerformers?.steals || [],
        blocks: team2.topPerformers?.blocks || []
      }
    };
  }, [game]);

  const topPerformerObjects = getTopPerformerObjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载比赛详情...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载比赛失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error || '未找到比赛'}</p>
        <div className="space-x-4">
          <button
            onClick={fetchGameDetails}
            className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors font-medium"
          >
            重试
          </button>
          <Link
            to="/games"
            className="inline-block px-4 py-2 bg-[#16181c] border border-[#2f3336] text-white rounded-full hover:bg-[#181818] transition-colors font-medium"
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
        return 'bg-[#16181c] text-[#71767a] border border-[#2f3336]';
      case 2:
        return 'bg-red-900/30 text-red-400 border border-red-800/50 animate-pulse';
      case 3:
        return 'bg-green-900/30 text-green-400 border border-green-800/50';
      default:
        return 'bg-[#16181c] text-[#71767a] border border-[#2f3336]';
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
        className="inline-flex items-center text-[#71767a] hover:text-white mb-6 transition-colors"
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
      <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6 relative">
        {refreshing && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-[#16181c] border border-[#2f3336] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-[#1d9bf0]"></div>
              <p className="text-[#71767a] text-xs">更新中...</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">比赛详情</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
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
            <Link
              to={`/teams/${game.awayTeam.teamTricode?.toLowerCase() || game.awayTeam.teamId}`}
              className="block hover:opacity-80 transition-opacity"
            >
            <img
              src={game.awayTeam.logo}
              alt={game.awayTeam.teamName}
                className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            </Link>
            <Link
              to={`/teams/${game.awayTeam.teamTricode?.toLowerCase() || game.awayTeam.teamId}`}
              className="block hover:text-[#1d9bf0] transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-1">
              {game.awayTeam.teamCity} {game.awayTeam.teamName}
            </h2>
            </Link>
            <p className="text-[#71767a] mb-2">
              {game.awayTeam.wins}-{game.awayTeam.losses}
            </p>
            {game.awayTeam.score !== null && (
              <p className="text-4xl font-bold text-white">{game.awayTeam.score}</p>
            )}
          </div>

          {/* Home Team */}
          <div className="text-center">
            <Link
              to={`/teams/${game.homeTeam.teamTricode?.toLowerCase() || game.homeTeam.teamId}`}
              className="block hover:opacity-80 transition-opacity"
            >
            <img
              src={game.homeTeam.logo}
              alt={game.homeTeam.teamName}
                className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            </Link>
            <Link
              to={`/teams/${game.homeTeam.teamTricode?.toLowerCase() || game.homeTeam.teamId}`}
              className="block hover:text-[#1d9bf0] transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-1">
              {game.homeTeam.teamCity} {game.homeTeam.teamName}
            </h2>
            </Link>
            <p className="text-[#71767a] mb-2">
              {game.homeTeam.wins}-{game.homeTeam.losses}
            </p>
            {game.homeTeam.score !== null && (
              <p className="text-4xl font-bold text-white">{game.homeTeam.score}</p>
            )}
          </div>
        </div>

        {/* Game Time */}
        {game.gameStatus === 1 && game.gameEt && (
          <div className="text-center text-[#71767a]">
            {new Date(game.gameEt).toLocaleString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Shanghai',
              hour12: false
            })}
          </div>
        )}
      </div>

      {/* Score by Period Table */}
      {game.awayTeam.periods && game.awayTeam.periods.length > 0 && (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">各节比分</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2f3336]">
                  <th className="text-left py-3 px-4 font-semibold text-white">球队</th>
                  {game.awayTeam.periods.map((period, idx) => (
                    <th
                      key={idx}
                      className="text-center py-3 px-4 font-semibold text-white"
                    >
                      {period.periodType === 'REGULAR' ? `Q${period.period}` : `OT${period.period - 4}`}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-white">总分</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#2f3336]">
                  <td className="py-3 px-4 font-medium text-white">
                    <Link
                      to={`/teams/${game.awayTeam.teamTricode?.toLowerCase() || game.awayTeam.teamId}`}
                      className="hover:text-[#1d9bf0] transition-colors"
                    >
                    {game.awayTeam.teamCity} {game.awayTeam.teamName}
                    </Link>
                  </td>
                  {game.awayTeam.periods.map((period, idx) => (
                    <td key={idx} className="text-center py-3 px-4 text-white">
                      {period.score}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-bold text-white">
                    {game.awayTeam.score}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">
                    <Link
                      to={`/teams/${game.homeTeam.teamTricode?.toLowerCase() || game.homeTeam.teamId}`}
                      className="hover:text-[#1d9bf0] transition-colors"
                    >
                    {game.homeTeam.teamCity} {game.homeTeam.teamName}
                    </Link>
                  </td>
                  {game.homeTeam.periods.map((period, idx) => (
                    <td key={idx} className="text-center py-3 px-4 text-white">
                      {period.score}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-bold text-white">
                    {game.homeTeam.score}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Performers Widget */}
      {game.boxscore && game.boxscore.teams && game.boxscore.teams.length >= 2 && topPerformerObjects.team1 && (
        <motion.div
          className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 mb-6 shadow-lg shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⭐</span>
            本场最佳表现
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {game.boxscore.teams[0]?.teamLogo && (
                  <img
                    src={game.boxscore.teams[0].teamLogo}
                    alt={game.boxscore.teams[0].teamName}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {game.boxscore.teams[0]?.teamName || 'Team 1'}
                </h3>
              {/* Points Card */}
              {topPerformerObjects.team1.points && topPerformerObjects.team1.points.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    得分
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team1.points.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-lg border border-red-800/20 hover:border-red-700/40 hover:bg-red-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-red-400">
                            {player.stats.points || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Rebounds Card */}
              {topPerformerObjects.team1.rebounds && topPerformerObjects.team1.rebounds.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    篮板
                  </h4>
                <div className="space-y-2">
                    {topPerformerObjects.team1.rebounds.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg border border-green-800/20 hover:border-green-700/40 hover:bg-green-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-green-400">
                            {player.stats.rebounds || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Assists Card */}
              {topPerformerObjects.team1.assists && topPerformerObjects.team1.assists.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    助攻
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team1.assists.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-800/20 hover:border-blue-700/40 hover:bg-blue-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-blue-400">
                            {player.stats.assists || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Plus/Minus Card */}
              {topPerformerObjects.team1.plusMinus && topPerformerObjects.team1.plusMinus.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    +/-
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team1.plusMinus.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-800/20 hover:border-purple-700/40 hover:bg-purple-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-xl font-bold ${
                            (player.stats.plusMinus || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(player.stats.plusMinus || 0) >= 0 ? '+' : ''}{player.stats.plusMinus || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Steals Card */}
              {topPerformerObjects.team1.steals && topPerformerObjects.team1.steals.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    抢断
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team1.steals.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 rounded-lg border border-yellow-800/20 hover:border-yellow-700/40 hover:bg-yellow-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-yellow-400">
                            {player.stats.steals || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

              {/* Blocks Card */}
              {topPerformerObjects.team1.blocks && topPerformerObjects.team1.blocks.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    盖帽
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team1.blocks.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-indigo-900/20 to-indigo-800/10 rounded-lg border border-indigo-800/20 hover:border-indigo-700/40 hover:bg-indigo-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-indigo-400">
                            {player.stats.blocks || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team 2 Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {game.boxscore.teams[1]?.teamLogo && (
                  <img
                    src={game.boxscore.teams[1].teamLogo}
                    alt={game.boxscore.teams[1].teamName}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {game.boxscore.teams[1]?.teamName || 'Team 2'}
                </h3>

              {/* Points Card */}
              {topPerformerObjects.team2.points && topPerformerObjects.team2.points.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    得分
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team2.points.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-lg border border-red-800/20 hover:border-red-700/40 hover:bg-red-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-red-400">
                            {player.stats.points || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Rebounds Card */}
              {topPerformerObjects.team2.rebounds && topPerformerObjects.team2.rebounds.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    篮板
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team2.rebounds.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg border border-green-800/20 hover:border-green-700/40 hover:bg-green-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-green-400">
                            {player.stats.rebounds || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Assists Card */}
              {topPerformerObjects.team2.assists && topPerformerObjects.team2.assists.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    助攻
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team2.assists.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-800/20 hover:border-blue-700/40 hover:bg-blue-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-blue-400">
                            {player.stats.assists || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Plus/Minus Card */}
              {topPerformerObjects.team2.plusMinus && topPerformerObjects.team2.plusMinus.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    +/-
                  </h4>
                <div className="space-y-2">
                    {topPerformerObjects.team2.plusMinus.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-800/20 hover:border-purple-700/40 hover:bg-purple-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-xl font-bold ${
                            (player.stats.plusMinus || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(player.stats.plusMinus || 0) >= 0 ? '+' : ''}{player.stats.plusMinus || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Steals Card */}
              {topPerformerObjects.team2.steals && topPerformerObjects.team2.steals.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    抢断
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team2.steals.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 rounded-lg border border-yellow-800/20 hover:border-yellow-700/40 hover:bg-yellow-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-yellow-400">
                            {player.stats.steals || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocks Card */}
              {topPerformerObjects.team2.blocks && topPerformerObjects.team2.blocks.length > 0 && (
                <div className="bg-[#181818]/50 rounded-xl border border-[#2f3336]/30 p-4">
                  <h4 className="text-sm font-semibold text-[#71767a] mb-3 flex items-center gap-2">
                    盖帽
                  </h4>
                  <div className="space-y-2">
                    {topPerformerObjects.team2.blocks.map((player) => (
                      <Link
                        key={getPlayerId(player)}
                        to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-indigo-900/20 to-indigo-800/10 rounded-lg border border-indigo-800/20 hover:border-indigo-700/40 hover:bg-indigo-900/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {player.headshot && (
                            <img
                              src={player.headshot}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#2f3336] flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                              {player.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-indigo-400">
                            {player.stats.blocks || 0}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Boxscore */}
      {game.boxscore && game.boxscore.teams && (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6">
          <h2 className="text-xl font-bold text-white mb-4">球员数据</h2>
          {game.boxscore.teams.map((team, teamIndex) => (
            <div key={team.teamId} className={teamIndex > 0 ? 'mt-8' : ''}>
              {/* Team Header */}
              <div className="flex items-center mb-4">
                <Link
                  to={`/teams/${team.teamAbbreviation?.toLowerCase() || team.teamId}`}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img
                    src={team.teamLogo}
                    alt={team.teamName}
                    className="w-8 h-8 object-contain mr-3 cursor-pointer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <h3 className="text-lg font-bold text-white hover:text-[#1d9bf0] transition-colors cursor-pointer">
                    {team.teamName}
                  </h3>
                </Link>
              </div>

              {/* Starters */}
              {team.starters && team.starters.length > 0 && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h4 className="text-sm font-semibold text-white mb-3">首发</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2f3336]/30">
                          <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">球员</th>
                          <th className="text-center py-3 px-3 font-medium text-white">MIN</th>
                          <th className="text-center py-3 px-3 font-medium text-white">PTS</th>
                          <th className="text-center py-3 px-3 font-medium text-white">FG</th>
                          <th className="text-center py-3 px-3 font-medium text-white">3PT</th>
                          <th className="text-center py-3 px-3 font-medium text-white">FT</th>
                          <th className="text-center py-3 px-3 font-medium text-white">REB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">AST</th>
                          <th className="text-center py-3 px-3 font-medium text-white">TO</th>
                          <th className="text-center py-3 px-3 font-medium text-white">STL</th>
                          <th className="text-center py-3 px-3 font-medium text-white">BLK</th>
                          <th className="text-center py-3 px-3 font-medium text-white">OREB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">DREB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">PF</th>
                          <th className="text-center py-3 px-3 font-medium text-white">+/-</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.starters.map((player, idx) => (
                          <motion.tr 
                            key={idx} 
                            className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                              idx % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.15 + idx * 0.03 }}
                          >
                            <td className="py-3 px-3 sticky left-0 z-10 bg-inherit">
                              <div className="flex items-center">
                                {player.headshot && (
                                  <img
                                    src={player.headshot}
                                    alt={player.name}
                                    className="w-7 h-7 rounded-full mr-2.5 object-cover border border-[#2f3336]/30"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  {player.athleteId ? (
                                    <Link
                                      to={`/players/${player.athleteId}`}
                                      className="font-medium text-[#1d9bf0] hover:text-[#1a8cd8] hover:underline text-[15px] transition-colors"
                                    >
                                      {player.name}
                                    </Link>
                                  ) : (
                                    <div className="font-medium text-white text-[15px]">{player.name}</div>
                                  )}
                                  <div className="text-xs text-[#71767a] mt-0.5">{player.position} #{player.jersey}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.minutes}</td>
                            <td className="text-center py-3 px-3 font-semibold text-white">{player.stats.points}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.fieldGoals}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.threePointers}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.freeThrows}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.rebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.assists}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.turnovers}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.steals}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.blocks}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.offensiveRebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.defensiveRebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.fouls}</td>
                            <td className="text-center py-3 px-3">
                              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.stats.plusMinus >= 0 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {player.stats.plusMinus >= 0 ? '+' : ''}{player.stats.plusMinus}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Bench */}
              {team.bench && team.bench.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h4 className="text-sm font-semibold text-white mb-3">替补</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2f3336]/30">
                          <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">球员</th>
                          <th className="text-center py-3 px-3 font-medium text-white">MIN</th>
                          <th className="text-center py-3 px-3 font-medium text-white">PTS</th>
                          <th className="text-center py-3 px-3 font-medium text-white">FG</th>
                          <th className="text-center py-3 px-3 font-medium text-white">3PT</th>
                          <th className="text-center py-3 px-3 font-medium text-white">FT</th>
                          <th className="text-center py-3 px-3 font-medium text-white">REB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">AST</th>
                          <th className="text-center py-3 px-3 font-medium text-white">TO</th>
                          <th className="text-center py-3 px-3 font-medium text-white">STL</th>
                          <th className="text-center py-3 px-3 font-medium text-white">BLK</th>
                          <th className="text-center py-3 px-3 font-medium text-white">OREB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">DREB</th>
                          <th className="text-center py-3 px-3 font-medium text-white">PF</th>
                          <th className="text-center py-3 px-3 font-medium text-white">+/-</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.bench.map((player, idx) => (
                          <motion.tr 
                            key={idx} 
                            className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                              idx % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.25 + idx * 0.03 }}
                          >
                            <td className="py-3 px-3 sticky left-0 z-10 bg-inherit">
                              <div className="flex items-center">
                                {player.headshot && (
                                  <img
                                    src={player.headshot}
                                    alt={player.name}
                                    className="w-7 h-7 rounded-full mr-2.5 object-cover border border-[#2f3336]/30"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  {player.athleteId ? (
                                    <Link
                                      to={`/players/${player.athleteId}`}
                                      className="font-medium text-[#1d9bf0] hover:text-[#1a8cd8] hover:underline text-[15px] transition-colors"
                                    >
                                      {player.name}
                                    </Link>
                                  ) : (
                                    <div className="font-medium text-white text-[15px]">{player.name}</div>
                                  )}
                                  <div className="text-xs text-[#71767a] mt-0.5">{player.position} #{player.jersey}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.minutes}</td>
                            <td className="text-center py-3 px-3 font-semibold text-white">{player.stats.points}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.fieldGoals}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.threePointers}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.freeThrows}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.rebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.assists}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.turnovers}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.steals}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.blocks}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.offensiveRebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.defensiveRebounds}</td>
                            <td className="text-center py-3 px-3 text-white/90">{player.stats.fouls}</td>
                            <td className="text-center py-3 px-3">
                              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.stats.plusMinus >= 0 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {player.stats.plusMinus >= 0 ? '+' : ''}{player.stats.plusMinus}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
            )}
          </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchGameDetails}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default GameDetails;

