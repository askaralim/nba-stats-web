import { useState, useEffect, useCallback } from 'react';
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
      if (isRefresh && game) {
        const gameChanged = JSON.stringify(game) !== JSON.stringify(data);
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
  }, [gameId, game]);

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

