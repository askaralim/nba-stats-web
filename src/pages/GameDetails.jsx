import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { apiGet, getErrorMessage } from '../utils/api';

function GameDetails() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const gameRef = useRef(null); // Use ref to track current game without causing re-renders

  // Update ref whenever game changes
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const fetchGameDetails = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) {
        setLoading(true);
      }
      const data = await apiGet(`/api/v1/nba/games/${gameId}`);
      
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
      setError(getErrorMessage(err) || 'Failed to fetch game details');
      console.error('Error fetching game details:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [gameId]); // Removed 'game' from dependencies to prevent infinite loop

  useEffect(() => {
    fetchGameDetails();
  }, [gameId, fetchGameDetails]);

  // Fetch AI summary separately for finished games
  const fetchAiSummary = useCallback(async () => {
    if (!game || game.gameStatus !== 3) {
      return; // Only fetch for finished games
    }

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await apiGet(`/api/v1/nba/games/${gameId}/summary`);
      setAiSummary(data);
    } catch (err) {
      setSummaryError(getErrorMessage(err) || 'Failed to fetch AI summary');
      console.error('Error fetching AI summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [gameId, game]);

  useEffect(() => {
    if (game && game.gameStatus === 3) {
      fetchAiSummary();
    }
  }, [game, fetchAiSummary]);

  useEffect(() => {
    // Auto-refresh every 5 seconds if game is live
    if (game?.gameStatus !== 2) return;

    const interval = setInterval(() => {
      fetchGameDetails(true); // Pass isRefresh=true to prevent full reload
    }, 5000);

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

  // Helper function to check if there's any top performer data
  const hasTopPerformersData = useCallback(() => {
    if (!topPerformerObjects.team1 && !topPerformerObjects.team2) return false;
    
    const team1HasData = Object.values(topPerformerObjects.team1 || {}).some(
      arr => Array.isArray(arr) && arr.length > 0
    );
    const team2HasData = Object.values(topPerformerObjects.team2 || {}).some(
      arr => Array.isArray(arr) && arr.length > 0
    );
    
    return team1HasData || team2HasData;
  }, [topPerformerObjects]);

  // Helper function to check if there's any boxscore player data
  const hasBoxscoreData = useCallback(() => {
    if (!game?.boxscore?.teams || game.boxscore.teams.length < 2) return false;
    
    return game.boxscore.teams.some(team => {
      const hasStarters = team.starters && Array.isArray(team.starters) && team.starters.length > 0;
      const hasBench = team.bench && Array.isArray(team.bench) && team.bench.length > 0;
      const hasDidNotPlay = team.didNotPlay && Array.isArray(team.didNotPlay) && team.didNotPlay.length > 0;
      return hasStarters || hasBench || hasDidNotPlay;
    });
  }, [game]);

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
        <div className="flex items-center justify-between mb-6">
          {/* <h1 className="text-2xl font-bold text-white">比赛详情</h1> */}
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                game.gameStatus
              )}`}
            >
              {statusInfo[game.gameStatus] || game.gameStatusText}
              {game.gameStatus === 2 && game.gameStatusText && ` - ${game.gameStatusText}`}
            </span>
            {/* Competitiveness Badge - Show for finished games */}
            {game.gameStatus === 3 && game.competitiveness && game.competitiveness.icon && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-[#181818]/50 text-white border border-[#2f3336]/50">
                {game.competitiveness.label} {game.competitiveness.icon}
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Away Team */}
          <div className="text-center">
            <Link
              to={`/teams/${(game.awayTeam.abbreviation || game.awayTeam.teamTricode)?.toLowerCase() || game.awayTeam.id || game.awayTeam.teamId}`}
              className="block hover:opacity-80 transition-opacity"
            >
            <img
              src={game.awayTeam.logo}
              alt={game.awayTeam.name || game.awayTeam.teamName}
                className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            </Link>
            <Link
              to={`/teams/${(game.awayTeam.abbreviation || game.awayTeam.teamTricode)?.toLowerCase() || game.awayTeam.id || game.awayTeam.teamId}`}
              className="block hover:text-[#1d9bf0] transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-1">
              {game.awayTeam.city || game.awayTeam.teamCity} {game.awayTeam.name || game.awayTeam.teamName}
            </h2>
            </Link>
            <p className="text-[#71767a] mb-2">
              {game.awayTeam.wins}-{game.awayTeam.losses}
            </p>
            {game.awayTeam.score !== null && (
              <p className="text-4xl font-bold text-white">{game.awayTeam.score}</p>
            )}
            {/* Season Series Score */}
            {game.seasonSeries && (
              <div className="mt-3 pt-3 border-t border-[#2f3336]/50">
                <p className="text-xs text-[#71767a] mb-1">赛季交锋</p>
                <p className="text-lg font-bold text-white">
                  {game.seasonSeries.score.awayWins}-{game.seasonSeries.score.homeWins}
                </p>
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="text-center">
            <Link
              to={`/teams/${(game.homeTeam.abbreviation || game.homeTeam.teamTricode)?.toLowerCase() || game.homeTeam.id || game.homeTeam.teamId}`}
              className="block hover:opacity-80 transition-opacity"
            >
            <img
              src={game.homeTeam.logo}
              alt={game.homeTeam.name || game.homeTeam.teamName}
                className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            </Link>
            <Link
              to={`/teams/${(game.homeTeam.abbreviation || game.homeTeam.teamTricode)?.toLowerCase() || game.homeTeam.id || game.homeTeam.teamId}`}
              className="block hover:text-[#1d9bf0] transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-1">
              {game.homeTeam.city || game.homeTeam.teamCity} {game.homeTeam.name || game.homeTeam.teamName}
            </h2>
            </Link>
            <p className="text-[#71767a] mb-2">
              {game.homeTeam.wins}-{game.homeTeam.losses}
            </p>
            {game.homeTeam.score !== null && (
              <p className="text-4xl font-bold text-white">{game.homeTeam.score}</p>
            )}
            {/* Season Series Score */}
            {game.seasonSeries && (
              <div className="mt-3 pt-3 border-t border-[#2f3336]/50">
                <p className="text-xs text-[#71767a] mb-1">赛季交锋</p>
                <p className="text-lg font-bold text-white">
                  {game.seasonSeries.score.homeWins}-{game.seasonSeries.score.awayWins}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Game Time */}
        {game.gameStatus === 1 && game.gameEt && (
          <div className="text-center text-[#71767a]">
            {game.gameEtFormatted?.time || game.gameEt}
          </div>
        )}

        {/* Season Series Games List */}
        {game.seasonSeries && game.seasonSeries.games && game.seasonSeries.games.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#2f3336]">
            <h3 className="text-sm font-semibold text-[#71767a] mb-4 text-center">赛季交锋记录</h3>
            <div className="space-y-2">
              {game.seasonSeries.games.map((seriesGame, idx) => (
                <Link
                  key={seriesGame.gameId || idx}
                  to={seriesGame.isCurrentGame ? '#' : `/games/${seriesGame.gameId}`}
                  className={`block p-3 rounded-lg text-sm transition-all ${
                    seriesGame.isCurrentGame
                      ? 'bg-[#1d9bf0]/20 border border-[#1d9bf0]/50 cursor-default'
                      : 'bg-[#181818]/50 hover:bg-[#181818]/70 border border-[#2f3336]/30 hover:border-[#2f3336]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {seriesGame.isCompleted ? (
                        <>
                          <span className={`font-semibold ${
                            seriesGame.winner === 'away' ? 'text-white' : 'text-[#71767a]'
                          }`}>
                            {seriesGame.awayTeam.abbreviation} {seriesGame.awayTeam.score}
                          </span>
                          <span className="text-[#71767a]">@</span>
                          <span className={`font-semibold ${
                            seriesGame.winner === 'home' ? 'text-white' : 'text-[#71767a]'
                          }`}>
                            {seriesGame.homeTeam.abbreviation} {seriesGame.homeTeam.score}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#71767a]">
                            {seriesGame.awayTeam.abbreviation} @ {seriesGame.homeTeam.abbreviation}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {seriesGame.isCompleted ? (
                        <span className="text-xs text-green-400">已结束</span>
                      ) : seriesGame.isCurrentGame ? (
                        <span className="text-xs text-[#1d9bf0] font-semibold">本场</span>
                      ) : (
                        <>
                          <span className="text-xs text-[#71767a]">
                            {seriesGame.dateFormatted?.shortDate || (seriesGame.date ? '未开始' : '未开始')}
                          </span>
                          <span className="text-xs text-[#71767a]">
                            {seriesGame.dateFormatted?.time || ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Story - AI-generated or Fallback Recap */}
      {game.gameStatus === 3 && (
        <motion.div
          className="bg-gradient-to-br from-[#16181c]/80 to-[#181818]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📝</span>
            比赛回顾
          </h2>
          <div className="space-y-3">
            {/* Loading state */}
            {summaryLoading && (
              <div className="flex items-center gap-2 text-[#71767a]">
                <div className="w-4 h-4 border-2 border-[#71767a] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">AI 正在分析比赛…</span>
              </div>
            )}

            {/* Error state */}
            {summaryError && !summaryLoading && (
              <div className="text-sm text-[#71767a]">
                AI 解说暂不可用，已显示基础总结
              </div>
            )}

            {/* AI Summary (preferred) */}
            {aiSummary && !summaryLoading && (
              <>
                <p className="text-lg text-white leading-relaxed">
                  {aiSummary.summary}
                </p>
                <p className="text-xs text-[#71767a] mt-2">
                  由 AI 根据比赛数据生成
                </p>
              </>
            )}
            
            {/* Fallback to algorithmic summary if no AI summary and not loading */}
            {!aiSummary && !summaryLoading && !summaryError && game.boxscore?.gameStory && (
              <>
                <p className="text-lg text-white leading-relaxed">
                  {game.boxscore.gameStory.summary}
                </p>
                {game.boxscore.gameStory.insights && game.boxscore.gameStory.insights.length > 0 && (
                  <ul className="space-y-2">
                    {game.boxscore.gameStory.insights.map((insight, idx) => (
                      <li key={idx} className="text-[#71767a] text-sm flex items-start gap-2">
                        <span className="text-[#1d9bf0] mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* Fallback to algorithmic summary on error */}
            {summaryError && !summaryLoading && game.boxscore?.gameStory && (
              <>
                <p className="text-lg text-white leading-relaxed">
                  {game.boxscore.gameStory.summary}
                </p>
                {game.boxscore.gameStory.insights && game.boxscore.gameStory.insights.length > 0 && (
                  <ul className="space-y-2">
                    {game.boxscore.gameStory.insights.map((insight, idx) => (
                      <li key={idx} className="text-[#71767a] text-sm flex items-start gap-2">
                        <span className="text-[#1d9bf0] mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Score by Period Table */}
      {game.awayTeam.periods && game.awayTeam.periods.length > 0 && (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6">
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
                      to={`/teams/${(game.awayTeam.abbreviation || game.awayTeam.teamTricode)?.toLowerCase() || game.awayTeam.id || game.awayTeam.teamId}`}
                      className="hover:text-[#1d9bf0] transition-colors"
                    >
                    {game.awayTeam.abbreviation || game.awayTeam.teamTricode}
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
                      to={`/teams/${(game.homeTeam.abbreviation || game.homeTeam.teamTricode)?.toLowerCase() || game.homeTeam.id || game.homeTeam.teamId}`}
                      className="hover:text-[#1d9bf0] transition-colors"
                    >
                    {game.homeTeam.abbreviation || game.homeTeam.teamTricode}
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

      {/* Game MVP & Top Performers - Combined Section */}
      {(game.boxscore?.gameMVP || (game.boxscore && game.boxscore.teams && game.boxscore.teams.length >= 2 && topPerformerObjects.team1)) && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game MVP - Who Carried? */}
            {game.boxscore?.gameMVP && (
              <div className="bg-gradient-to-br from-[#16181c]/80 to-[#181818]/80 backdrop-blur-xl rounded-2xl border-2 border-[#1d9bf0]/30 p-6 shadow-lg shadow-[#1d9bf0]/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  主宰比赛
                </h2>
                <div className="flex items-center gap-4">
                  {game.boxscore.gameMVP.headshot && (
                    <img
                      src={game.boxscore.gameMVP.headshot}
                      alt={game.boxscore.gameMVP.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#1d9bf0]/50 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      to={`/players/${game.boxscore.gameMVP.athleteId}`}
                      className="block hover:text-[#1d9bf0] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-white">
                          {game.boxscore.gameMVP.name}
                        </h3>
                        {game.boxscore.gameMVP.teamLogo && (
                          <img
                            src={game.boxscore.gameMVP.teamLogo}
                            alt={game.boxscore.gameMVP.teamName || game.boxscore.gameMVP.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </Link>
                    <p className="text-[#71767a] text-sm mb-2">
                      {game.boxscore.gameMVP.jersey && `#${game.boxscore.gameMVP.jersey}`} {game.boxscore.gameMVP.position && `· ${game.boxscore.gameMVP.position}`} {(game.boxscore.gameMVP.teamAbbreviation || game.boxscore.gameMVP.abbreviation) && `· ${game.boxscore.gameMVP.teamAbbreviation || game.boxscore.gameMVP.abbreviation}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#1d9bf0]">
                        {game.boxscore.gameMVP.gis}
                      </span>
                      <span className="text-sm text-[#71767a]">GIS</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">PTS</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.points}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">REB</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.rebounds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">AST</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.assists}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">STL</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.steals}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">BLK</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.blocks}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#71767a] mb-1">TOV</div>
                      <div className="text-lg font-bold text-white">{game.boxscore.gameMVP.stats.turnovers}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers Widget - Simplified */}
            {game.boxscore && game.boxscore.teams && game.boxscore.teams.length >= 2 && hasTopPerformersData() && (
              <div className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 shadow-lg shadow-black/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  最佳表现
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Team 1 Column */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      {game.boxscore.teams[0]?.teamLogo && (
                        <img
                          src={game.boxscore.teams[0].teamLogo}
                          alt={game.boxscore.teams[0].teamName || game.boxscore.teams[0].name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="truncate">{game.boxscore.teams[0]?.teamName || game.boxscore.teams[0]?.name || 'Team 1'}</span>
                    </h3>
                    
                    {/* Points */}
                    {topPerformerObjects.team1.points && topPerformerObjects.team1.points.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">得分</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team1.points.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-red-400 font-semibold ml-2">{player.stats.points || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rebounds */}
                    {topPerformerObjects.team1.rebounds && topPerformerObjects.team1.rebounds.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">篮板</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team1.rebounds.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-green-400 font-semibold ml-2">{player.stats.rebounds || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assists */}
                    {topPerformerObjects.team1.assists && topPerformerObjects.team1.assists.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">助攻</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team1.assists.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-blue-400 font-semibold ml-2">{player.stats.assists || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plus/Minus */}
                    {topPerformerObjects.team1.plusMinus && topPerformerObjects.team1.plusMinus.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">+/-</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team1.plusMinus.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className={`font-semibold ml-2 ${(player.stats.plusMinus || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(player.stats.plusMinus || 0) >= 0 ? '+' : ''}{player.stats.plusMinus || 0}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team 2 Column */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      {game.boxscore.teams[1]?.teamLogo && (
                        <img
                          src={game.boxscore.teams[1].teamLogo}
                          alt={game.boxscore.teams[1].teamName || game.boxscore.teams[1].name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="truncate">{game.boxscore.teams[1]?.teamName || game.boxscore.teams[1]?.name || 'Team 2'}</span>
                    </h3>
                    
                    {/* Points */}
                    {topPerformerObjects.team2.points && topPerformerObjects.team2.points.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">得分</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team2.points.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-red-400 font-semibold ml-2">{player.stats.points || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rebounds */}
                    {topPerformerObjects.team2.rebounds && topPerformerObjects.team2.rebounds.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">篮板</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team2.rebounds.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-green-400 font-semibold ml-2">{player.stats.rebounds || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assists */}
                    {topPerformerObjects.team2.assists && topPerformerObjects.team2.assists.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">助攻</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team2.assists.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className="text-blue-400 font-semibold ml-2">{player.stats.assists || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plus/Minus */}
                    {topPerformerObjects.team2.plusMinus && topPerformerObjects.team2.plusMinus.length > 0 && (
                      <div className="bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 p-3">
                        <h4 className="text-xs font-semibold text-[#71767a] mb-2">+/-</h4>
                        <div className="space-y-1.5">
                          {topPerformerObjects.team2.plusMinus.map((player) => (
                            <Link
                              key={getPlayerId(player)}
                              to={player.athleteId ? `/players/${player.athleteId}` : '#'}
                              className="flex items-center justify-between text-sm group"
                            >
                              <span className="text-white truncate group-hover:text-[#1d9bf0] transition-colors">{player.name}</span>
                              <span className={`font-semibold ml-2 ${(player.stats.plusMinus || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(player.stats.plusMinus || 0) >= 0 ? '+' : ''}{player.stats.plusMinus || 0}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Team Stats */}
      {game.boxscore?.teamStatistics && (() => {
        const stats = game.boxscore.teamStatistics;
        const team1 = stats.team1;
        const team2 = stats.team2;

        // Helper function to create a stat row with bar chart (bars start from center)
        const StatRow = ({ label, team1Value, team2Value, format = (v) => v, isPercentage = false }) => {
          let team1BarWidth, team2BarWidth, team1Higher, team2Higher;
          
          if (isPercentage) {
            // For percentage data: each bar represents the value, extending from center
            // Scale to fit within 50% on each side (so max 100% total)
            team1BarWidth = Math.min(team1Value, 100) / 2; // Divide by 2 to fit in 50% space
            team2BarWidth = Math.min(team2Value, 100) / 2;
            team1Higher = team1Value > team2Value;
            team2Higher = team2Value > team1Value;
          } else {
            // For count data: calculate percentage of total, each bar extends from center
            const total = team1Value + team2Value;
            team1BarWidth = total > 0 ? (team1Value / total) * 50 : 0; // 50% max per side
            team2BarWidth = total > 0 ? (team2Value / total) * 50 : 0;
            team1Higher = team1Value > team2Value;
            team2Higher = team2Value > team1Value;
          }

          const team1Percent = isPercentage ? team1Value : (team1Value + team2Value > 0 ? (team1Value / (team1Value + team2Value)) * 100 : 0);
          const team2Percent = isPercentage ? team2Value : (team1Value + team2Value > 0 ? (team2Value / (team1Value + team2Value)) * 100 : 0);

          return (
            <div className="py-3 border-b border-[#2f3336]/50">
              <div className="text-xs text-[#71767a] mb-2 font-medium">{label}</div>
              <div className="flex items-center">
                {/* Team 1 - Left side */}
                <div className="flex-1 flex items-center justify-end gap-2 pr-2">
                  <div className="text-sm font-semibold text-white min-w-[50px] text-right">
                    {format(team1Value)}{isPercentage ? '%' : ''}
                  </div>
                  {!isPercentage && (
                    <div className="text-xs text-[#71767a] min-w-[40px] text-right">
                      {team1Percent.toFixed(1)}%
                    </div>
                  )}
                </div>
                
                {/* Center bar container */}
                <div className="flex-1 h-6 bg-[#2f3336]/50 rounded relative overflow-hidden">
                  {/* Center divider line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#2f3336] z-10" />
                  
                  {/* Team 1 bar (extends left from center) */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-r transition-all ${
                      team1Higher ? 'bg-red-500' : team2Higher ? 'bg-[#2f3336]' : 'bg-[#2f3336]'
                    }`}
                    style={{
                      right: '50%',
                      width: `${team1BarWidth}%`
                    }}
                  />
                  
                  {/* Team 2 bar (extends right from center) */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-l transition-all ${
                      team2Higher ? 'bg-red-500' : team1Higher ? 'bg-[#2f3336]' : 'bg-[#2f3336]'
                    }`}
                    style={{
                      left: '50%',
                      width: `${team2BarWidth}%`
                    }}
                  />
                </div>
                
                {/* Team 2 - Right side */}
                <div className="flex-1 flex items-center gap-2 pl-2">
                  {!isPercentage && (
                    <div className="text-xs text-[#71767a] min-w-[40px] text-left">
                      {team2Percent.toFixed(1)}%
                    </div>
                  )}
                  <div className="text-sm font-semibold text-white min-w-[50px] text-left">
                    {format(team2Value)}{isPercentage ? '%' : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        };

        // Parse field goals, three pointers, free throws
        const parseFG = (fg) => {
          const [made, attempted] = fg.split('-').map(Number);
          return { made, attempted };
        };

        const fg1 = parseFG(team1.fieldGoals);
        const fg2 = parseFG(team2.fieldGoals);
        const threePT1 = parseFG(team1.threePointers);
        const threePT2 = parseFG(team2.threePointers);
        const ft1 = parseFG(team1.freeThrows);
        const ft2 = parseFG(team2.freeThrows);

        return (
          <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">团队统计</h2>
            
            {/* Team Headers */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2f3336]">
              <div className="flex items-center gap-3 flex-1">
                {team1.teamLogo && (
                  <img
                    src={team1.teamLogo}
                    alt={team1.teamName || team1.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{team1.teamAbbreviation || team1.abbreviation}</div>
                  <div className="text-xs text-[#71767a]">{team1.teamName || team1.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{team2.teamAbbreviation || team2.abbreviation}</div>
                  <div className="text-xs text-[#71767a]">{team2.teamName || team2.name}</div>
                </div>
                {team2.teamLogo && (
                  <img
                    src={team2.teamLogo}
                    alt={team2.teamName || team2.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Statistics with Bar Charts */}
            <div className="space-y-1">
              {/* Field Goals Made */}
              <StatRow
                label="投篮命中"
                team1Value={fg1.made}
                team2Value={fg2.made}
                format={(v) => v}
              />
              
              {/* Field Goal Percentage */}
              <StatRow
                label="投篮命中率"
                team1Value={team1.fieldGoalPercent}
                team2Value={team2.fieldGoalPercent}
                format={(v) => v}
                isPercentage={true}
              />
              
              {/* Three Pointers Made */}
              <StatRow
                label="三分命中"
                team1Value={threePT1.made}
                team2Value={threePT2.made}
                format={(v) => v}
              />
              
              {/* Three Point Percentage */}
              <StatRow
                label="三分命中率"
                team1Value={team1.threePointPercent}
                team2Value={team2.threePointPercent}
                format={(v) => v}
                isPercentage={true}
              />
              
              {/* Free Throws Made */}
              <StatRow
                label="罚球命中"
                team1Value={ft1.made}
                team2Value={ft2.made}
                format={(v) => v}
              />
              
              {/* Free Throw Percentage */}
              <StatRow
                label="罚球命中率"
                team1Value={team1.freeThrowPercent}
                team2Value={team2.freeThrowPercent}
                format={(v) => v}
                isPercentage={true}
              />
              
              {/* Rebounds */}
              <StatRow
                label="篮板"
                team1Value={team1.rebounds}
                team2Value={team2.rebounds}
                format={(v) => v}
              />
              
              {/* Offensive Rebounds */}
              <StatRow
                label="进攻篮板"
                team1Value={team1.offensiveRebounds}
                team2Value={team2.offensiveRebounds}
                format={(v) => v}
              />
              
              {/* Defensive Rebounds */}
              <StatRow
                label="防守篮板"
                team1Value={team1.defensiveRebounds}
                team2Value={team2.defensiveRebounds}
                format={(v) => v}
              />
              
              {/* Assists */}
              <StatRow
                label="助攻"
                team1Value={team1.assists}
                team2Value={team2.assists}
                format={(v) => v}
              />
              
              {/* Steals */}
              <StatRow
                label="抢断"
                team1Value={team1.steals}
                team2Value={team2.steals}
                format={(v) => v}
              />
              
              {/* Blocks */}
              <StatRow
                label="盖帽"
                team1Value={team1.blocks}
                team2Value={team2.blocks}
                format={(v) => v}
              />
              
              {/* Turnovers */}
              <StatRow
                label="失误"
                team1Value={team1.turnovers}
                team2Value={team2.turnovers}
                format={(v) => v}
              />
              
              {/* Fouls */}
              <StatRow
                label="犯规"
                team1Value={team1.fouls}
                team2Value={team2.fouls}
                format={(v) => v}
              />
            </div>
          </div>
        );
      })()}

      {/* Boxscore */}
      {hasBoxscoreData() && (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6">
          <h2 className="text-xl font-bold text-white mb-4">球员数据</h2>
          {game.boxscore.teams.map((team, teamIndex) => (
            <div key={team.teamId || team.id} className={teamIndex > 0 ? 'mt-8' : ''}>
              {/* Team Header */}
              <div className="flex items-center mb-4">
                <Link
                  to={`/teams/${(team.teamAbbreviation || team.abbreviation)?.toLowerCase() || team.teamId || team.id}`}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img
                    src={team.teamLogo || team.logo}
                    alt={team.teamName || team.name}
                    className="w-8 h-8 object-contain mr-3 cursor-pointer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <h3 className="text-lg font-bold text-white hover:text-[#1d9bf0] transition-colors cursor-pointer">
                    {team.teamName || team.name}
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

      {/* Injuries Section */}
      {game.injuries && (game.injuries.away.length > 0 || game.injuries.home.length > 0) && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            伤病报告
            {!game.injuries.gameStarted && (
              <span className="text-xs font-normal text-[#71767a] ml-2">(赛前)</span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Away Team Injuries */}
            {game.injuries.away.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {game.awayTeam.logo && (
                    <img
                      src={game.awayTeam.logo}
                      alt={game.awayTeam.teamName || game.awayTeam.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-sm font-semibold text-white">
                    {game.awayTeam.abbreviation || game.awayTeam.teamTricode}
                  </h3>
                </div>
                <div className="space-y-2">
                  {game.injuries.away.map((injury, idx) => (
                    <div
                      key={injury.playerId || idx}
                      className="p-3 bg-[#181818]/50 rounded-lg border border-[#2f3336]/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/players/${injury.playerId}`}
                            className="text-white font-medium hover:text-[#1d9bf0] transition-colors"
                          >
                            {injury.name}
                          </Link>
                          {injury.position && (
                            <span className="text-xs text-[#71767a] ml-2">
                              {injury.position}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          injury.status?.toLowerCase().includes('out') || injury.status?.toLowerCase().includes('doubtful')
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : injury.status?.toLowerCase().includes('questionable')
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {injury.status || 'Unknown'}
                        </span>
                      </div>
                      {injury.statusText && (
                        <p className="text-xs text-[#71767a] mt-2">{injury.statusText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home Team Injuries */}
            {game.injuries.home.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {game.homeTeam.logo && (
                    <img
                      src={game.homeTeam.logo}
                      alt={game.homeTeam.teamName || game.homeTeam.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-sm font-semibold text-white">
                    {game.homeTeam.abbreviation || game.homeTeam.teamTricode}
                  </h3>
                </div>
                <div className="space-y-2">
                  {game.injuries.home.map((injury, idx) => (
                    <div
                      key={injury.playerId || idx}
                      className="p-3 bg-[#181818]/50 rounded-lg border border-[#2f3336]/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/players/${injury.playerId}`}
                            className="text-white font-medium hover:text-[#1d9bf0] transition-colors"
                          >
                            {injury.name}
                          </Link>
                          {injury.position && (
                            <span className="text-xs text-[#71767a] ml-2">
                              {injury.position}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          injury.status?.toLowerCase().includes('out') || injury.status?.toLowerCase().includes('doubtful')
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : injury.status?.toLowerCase().includes('questionable')
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {injury.status || 'Unknown'}
                        </span>
                      </div>
                      {injury.statusText && (
                        <p className="text-xs text-[#71767a] mt-2">{injury.statusText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
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

