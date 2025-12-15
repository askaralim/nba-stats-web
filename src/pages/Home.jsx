import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

// Get current date in Chinese timezone
const getChineseDate = () => {
  const now = new Date();
  const chineseDateStr = now.toLocaleString('en-CA', { timeZone: 'Asia/Shanghai' }).split(',')[0];
  const [year, month, day] = chineseDateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Format date for API (YYYYMMDD)
const formatDateForAPI = (chineseDate) => {
  const year = chineseDate.getFullYear();
  const month = chineseDate.getMonth() + 1;
  const day = chineseDate.getDate();
  const chineseDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const chineseMidnight = new Date(`${chineseDateStr}T00:00:00+08:00`);
  const usEasternDateStr = chineseMidnight.toLocaleString('en-CA', { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [usYear, usMonth, usDay] = usEasternDateStr.split('-');
  return `${usYear}${String(usMonth).padStart(2, '0')}${String(usDay).padStart(2, '0')}`;
};

// Get tomorrow's date
const getTomorrowDate = () => {
  const tomorrow = new Date(getChineseDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

function Home() {
  const [todayGames, setTodayGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [leagueLeaders, setLeagueLeaders] = useState({});
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = getChineseDate();
        const tomorrow = getTomorrowDate();
        const todayParam = formatDateForAPI(today);
        const tomorrowParam = formatDateForAPI(tomorrow);

        // Fetch all data in parallel
        const [gamesTodayRes, gamesTomorrowRes, playersRes, newsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/nba/games/today?date=${todayParam}`).catch(() => null),
          fetch(`${API_BASE_URL}/api/nba/games/today?date=${tomorrowParam}`).catch(() => null),
          fetch(`${API_BASE_URL}/api/nba/stats/players?season=2026|2&limit=100&sort=offensive.avgPoints:desc`).catch(() => null),
          fetch(`${API_BASE_URL}/api/nba/news`).catch(() => null)
        ]);

        // Process today's games
        let todayGamesList = [];
        if (gamesTodayRes?.ok) {
          const gamesData = await gamesTodayRes.json();
          todayGamesList = gamesData.games || [];
          setTodayGames(todayGamesList);
        }

        // Process tomorrow's games (upcoming)
        if (gamesTomorrowRes?.ok) {
          const gamesData = await gamesTomorrowRes.json();
          setUpcomingGames((gamesData.games || []).slice(0, 5));
        }

        // Process player stats for season leaders (Top Performers Widget)
        if (playersRes?.ok) {
          const playersData = await playersRes.json();
          const players = playersData.players || [];
          
          // Get top performers (top 5 in PTS, AST, REB)
          const topPoints = players
            .filter(p => p.stats?.avgPoints?.value && !isNaN(parseFloat(p.stats.avgPoints.value)))
            .sort((a, b) => parseFloat(b.stats.avgPoints.value) - parseFloat(a.stats.avgPoints.value))
            .slice(0, 3);
          
          const topAssists = players
            .filter(p => p.stats?.avgAssists?.value && !isNaN(parseFloat(p.stats.avgAssists.value)))
            .sort((a, b) => parseFloat(b.stats.avgAssists.value) - parseFloat(a.stats.avgAssists.value))
            .slice(0, 3);
          
          const topRebounds = players
            .filter(p => p.stats?.avgRebounds?.value && !isNaN(parseFloat(p.stats.avgRebounds.value)))
            .sort((a, b) => parseFloat(b.stats.avgRebounds.value) - parseFloat(a.stats.avgRebounds.value))
            .slice(0, 3);

          setTopPerformers({
            points: topPoints,
            assists: topAssists,
            rebounds: topRebounds
          });
        }

        // Fetch game details for completed games today to get today's top performers
        const completedGames = todayGamesList.filter(game => game.gameStatus === 3); // Status 3 = Final
        if (completedGames.length > 0) {
          // Fetch game details for completed games in parallel
          const gameDetailsPromises = completedGames.map(game =>
            fetch(`${API_BASE_URL}/api/nba/games/${game.gameId}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          );

          const gameDetailsResults = await Promise.all(gameDetailsPromises);
          
          // Extract all players from all games
          const allPlayers = [];
          gameDetailsResults.forEach((gameDetail) => {
            if (!gameDetail?.boxscore?.teams) return;
            
            gameDetail.boxscore.teams.forEach(team => {
              // Process starters
              if (team.starters && Array.isArray(team.starters)) {
                team.starters.forEach(player => {
                  if (player.stats && player.athleteId) {
                    allPlayers.push({
                      id: player.athleteId,
                      name: player.name,
                      team: team.teamName,
                      teamAbbreviation: team.teamAbbreviation,
                      headshot: player.headshot,
                      points: parseInt(player.stats.points) || 0,
                      rebounds: parseInt(player.stats.rebounds) || 0,
                      assists: parseInt(player.stats.assists) || 0
                    });
                  }
                });
              }
              
              // Process bench
              if (team.bench && Array.isArray(team.bench)) {
                team.bench.forEach(player => {
                  if (player.stats && player.athleteId) {
                    allPlayers.push({
                      id: player.athleteId,
                      name: player.name,
                      team: team.teamName,
                      teamAbbreviation: team.teamAbbreviation,
                      headshot: player.headshot,
                      points: parseInt(player.stats.points) || 0,
                      rebounds: parseInt(player.stats.rebounds) || 0,
                      assists: parseInt(player.stats.assists) || 0
                    });
                  }
                });
              }
            });
          });

          // Get top 3 in each category for today
          const todayTopPoints = allPlayers
            .sort((a, b) => b.points - a.points)
            .slice(0, 3);

          const todayTopRebounds = allPlayers
            .sort((a, b) => b.rebounds - a.rebounds)
            .slice(0, 3);

          const todayTopAssists = allPlayers
            .sort((a, b) => b.assists - a.assists)
            .slice(0, 3);

          // Set today's leaders for Quick Stats Widget
          setLeagueLeaders({
            points: todayTopPoints,
            rebounds: todayTopRebounds,
            assists: todayTopAssists
          });
        } else {
          // No completed games today, set empty arrays
          setLeagueLeaders({
            points: [],
            rebounds: [],
            assists: []
          });
        }

        // Process news
        if (newsRes?.ok) {
          const newsData = await newsRes.json();
          setLatestNews((newsData.tweets || []).slice(0, 5));
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">欢迎来到 Yo! NBA</h1>
        <p className="text-[#71767a] text-lg">NBA 数据与新闻一站式平台</p>
      </motion.div> */}

      {/* Today's Games Widget - Compact Version */}
      <motion.div
        className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-5 shadow-lg shadow-black/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏀</span>
            今日比赛
          </h2>
          <Link
            to="/games"
            className="text-[#1d9bf0] hover:text-[#1a8cd8] text-xs font-medium transition-colors flex items-center gap-1"
          >
            查看全部
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {todayGames.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[#71767a] text-sm">今日暂无比赛</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {todayGames.slice(0, 5).map((game) => {
              const getStatusBadge = (status) => {
                switch (status) {
                  case 1:
                    return <span className="text-xs text-[#71767a]">已安排</span>;
                  case 2:
                    return <span className="text-xs text-red-400 animate-pulse">● 直播中</span>;
                  case 3:
                    return <span className="text-xs text-green-400">已结束</span>;
                  default:
                    return <span className="text-xs text-[#71767a]">{game.gameStatusText || ''}</span>;
                }
              };

              return (
                <Link
                  key={game.gameId}
                  to={`/games/${game.gameId}`}
                  className="block p-3 bg-[#181818]/50 rounded-lg border border-[#2f3336]/30 hover:bg-[#181818] hover:border-[#2f3336] transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Away Team */}
                    <div className="flex items-center gap-2 w-full">
                      {game.awayTeam.logo && (
                        <img
                          src={game.awayTeam.logo}
                          alt={game.awayTeam.teamName}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors text-center">
                          {game.awayTeam.teamCity} {game.awayTeam.teamName}
                        </div>
                      </div>
                      {game.awayTeam.score !== null && (
                        <div className="text-lg font-bold text-white flex-shrink-0">
                          {game.awayTeam.score}
                        </div>
                      )}
                    </div>

                    {/* VS / Status */}
                    <div className="flex flex-col items-center gap-1">
                      {game.gameStatus === 1 && game.gameEt ? (
                        <div className="text-xs text-[#71767a] text-center whitespace-nowrap">
                          {new Date(game.gameEt).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Shanghai',
                            hour12: false
                          })}
                        </div>
                      ) : (
                        <div className="text-[#71767a] text-xs">VS</div>
                      )}
                      {getStatusBadge(game.gameStatus)}
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-2 w-full">
                      {game.homeTeam.logo && (
                        <img
                          src={game.homeTeam.logo}
                          alt={game.homeTeam.teamName}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-medium truncate group-hover:text-[#1d9bf0] transition-colors text-center">
                          {game.homeTeam.teamCity} {game.homeTeam.teamName}
                        </div>
                      </div>
                      {game.homeTeam.score !== null && (
                        <div className="text-lg font-bold text-white flex-shrink-0">
                          {game.homeTeam.score}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Two Widgets Row: Quick Stats & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats Widget - Today's Top Performers */}
        <motion.div
          className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 shadow-lg shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span>
            今日最佳表现
          </h2>
        </div>
        <div className="space-y-4">
          {/* Points Leaders */}
          {leagueLeaders.points && Array.isArray(leagueLeaders.points) && leagueLeaders.points.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#71767a] mb-2 flex items-center gap-2">
                <span>🏀</span>
                得分
              </h3>
              <div className="space-y-2">
                {leagueLeaders.points.map((player, index) => (
                  <Link
                    key={player.id || index}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-lg border border-red-800/20 hover:border-red-700/40 hover:bg-red-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-[#2f3336] text-white' :
                        'bg-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      {player.headshot && (
                        <img
                          src={player.headshot}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                          {player.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#71767a] truncate">
                          {player.team || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-400">
                        {player.points || 0}
                      </div>
                      <div className="text-xs text-[#71767a]">PTS</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rebounds Leaders */}
          {leagueLeaders.rebounds && Array.isArray(leagueLeaders.rebounds) && leagueLeaders.rebounds.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#71767a] mb-2 flex items-center gap-2">
                <span>📊</span>
                篮板
              </h3>
              <div className="space-y-2">
                {leagueLeaders.rebounds.map((player, index) => (
                  <Link
                    key={player.id || index}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg border border-green-800/20 hover:border-green-700/40 hover:bg-green-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-[#2f3336] text-white' :
                        'bg-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      {player.headshot && (
                        <img
                          src={player.headshot}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                          {player.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#71767a] truncate">
                          {player.team || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        {player.rebounds || 0}
                      </div>
                      <div className="text-xs text-[#71767a]">REB</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assists Leaders */}
          {leagueLeaders.assists && Array.isArray(leagueLeaders.assists) && leagueLeaders.assists.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#71767a] mb-2 flex items-center gap-2">
                <span>🎯</span>
                助攻
              </h3>
              <div className="space-y-2">
                {leagueLeaders.assists.map((player, index) => (
                  <Link
                    key={player.id || index}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-800/20 hover:border-blue-700/40 hover:bg-blue-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-[#2f3336] text-white' :
                        'bg-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      {player.headshot && (
                        <img
                          src={player.headshot}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                          {player.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#71767a] truncate">
                          {player.team || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">
                        {player.assists || 0}
                      </div>
                      <div className="text-xs text-[#71767a]">AST</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!leagueLeaders.points || !Array.isArray(leagueLeaders.points) || leagueLeaders.points.length === 0) &&
           (!leagueLeaders.rebounds || !Array.isArray(leagueLeaders.rebounds) || leagueLeaders.rebounds.length === 0) &&
           (!leagueLeaders.assists || !Array.isArray(leagueLeaders.assists) || leagueLeaders.assists.length === 0) && (
            <div className="text-center py-8">
              <p className="text-[#71767a]">今日暂无比赛数据</p>
            </div>
          )}
        </div>
        </motion.div>

        {/* Top Performers Widget */}
        <motion.div
          className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 shadow-lg shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⭐</span>
              赛季最佳表现
            </h2>
            <Link
              to="/stats/players"
              className="text-[#1d9bf0] hover:text-[#1a8cd8] text-sm font-medium transition-colors"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {/* Points Leaders */}
            {topPerformers.points && topPerformers.points.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#71767a] mb-2">场均得分</h3>
                <div className="space-y-2">
                  {topPerformers.points.map((player, index) => (
                    <Link
                      key={player.id || index}
                      to={`/players/${player.id}`}
                      className="flex items-center justify-between p-3 bg-[#181818]/50 rounded-lg hover:bg-[#181818] transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-900' :
                          index === 1 ? 'bg-[#2f3336] text-white' :
                          'bg-orange-500 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                            {player.name || player.displayName || 'Unknown'}
                          </div>
                          <div className="text-xs text-[#71767a] truncate">
                            {player.team || player.teamName || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {player.stats?.avgPoints?.total || '-'}
                        </div>
                        <div className="text-xs text-[#71767a]">PTS</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Rebounds Leaders */}
            {topPerformers.rebounds && topPerformers.rebounds.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#71767a] mb-2">场均篮板</h3>
                <div className="space-y-2">
                  {topPerformers.rebounds.map((player, index) => (
                    <Link
                      key={player.id || index}
                      to={`/players/${player.id}`}
                      className="flex items-center justify-between p-3 bg-[#181818]/50 rounded-lg hover:bg-[#181818] transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-900' :
                          index === 1 ? 'bg-[#2f3336] text-white' :
                          'bg-orange-500 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                            {player.name || player.displayName || 'Unknown'}
                          </div>
                          <div className="text-xs text-[#71767a] truncate">
                            {player.team || player.teamName || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {player.stats?.avgRebounds?.total || '-'}
                        </div>
                        <div className="text-xs text-[#71767a]">REB</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Assists Leaders */}
            {topPerformers.assists && topPerformers.assists.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#71767a] mb-2">场均助攻</h3>
                <div className="space-y-2">
                  {topPerformers.assists.map((player, index) => (
                    <Link
                      key={player.id || index}
                      to={`/players/${player.id}`}
                      className="flex items-center justify-between p-3 bg-[#181818]/50 rounded-lg hover:bg-[#181818] transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-900' :
                          index === 1 ? 'bg-[#2f3336] text-white' :
                          'bg-orange-500 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate group-hover:text-[#1d9bf0] transition-colors">
                            {player.name || player.displayName || 'Unknown'}
                          </div>
                          <div className="text-xs text-[#71767a] truncate">
                            {player.team || player.teamName || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {player.stats?.avgAssists?.total || '-'}
                        </div>
                        <div className="text-xs text-[#71767a]">AST</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Two Column Layout: Latest News & Upcoming Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest News Widget */}
        <motion.div
          className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 shadow-lg shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📰</span>
              最新新闻
            </h2>
            <Link
              to="/news"
              className="text-[#1d9bf0] hover:text-[#1a8cd8] text-sm font-medium transition-colors flex items-center gap-1"
            >
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {latestNews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#71767a]">暂无新闻</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestNews.map((tweet, index) => (
                <Link
                  key={tweet.id || index}
                  to="/news"
                  className="block p-4 bg-[#181818]/50 rounded-lg hover:bg-[#181818] transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {tweet.avatar && (
                      <img
                        src={tweet.avatar}
                        alt={tweet.author}
                        className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{tweet.author}</span>
                        <span className="text-[#71767a] text-xs">{tweet.authorHandle}</span>
                      </div>
                      <p className="text-[#71767a] text-sm line-clamp-2 group-hover:text-white transition-colors">
                        {tweet.text}
                      </p>
                      {tweet.timestamp && (
                        <div className="text-xs text-[#71767a] mt-1">
                          {new Date(tweet.timestamp).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Games Widget */}
        <motion.div
          className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 shadow-lg shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔮</span>
              即将开始
            </h2>
            <Link
              to="/games"
              className="text-[#1d9bf0] hover:text-[#1a8cd8] text-sm font-medium transition-colors flex items-center gap-1"
            >
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {upcomingGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#71767a]">暂无即将开始的比赛</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingGames.map((game) => (
                <Link
                  key={game.gameId}
                  to={`/games/${game.gameId}`}
                  className="block p-4 bg-[#181818]/50 rounded-lg hover:bg-[#181818] transition-colors group border border-[#2f3336]/30 hover:border-[#2f3336]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {game.awayTeam.logo && (
                        <img
                          src={game.awayTeam.logo}
                          alt={game.awayTeam.teamName}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate group-hover:text-[#1d9bf0] transition-colors">
                          {game.awayTeam.teamCity} {game.awayTeam.teamName}
                        </div>
                        <div className="text-xs text-[#71767a]">客场</div>
                      </div>
                    </div>
                    <div className="text-[#71767a] text-sm mx-2">VS</div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {game.homeTeam.logo && (
                        <img
                          src={game.homeTeam.logo}
                          alt={game.homeTeam.teamName}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate group-hover:text-[#1d9bf0] transition-colors">
                          {game.homeTeam.teamCity} {game.homeTeam.teamName}
                        </div>
                        <div className="text-xs text-[#71767a]">主场</div>
                      </div>
                    </div>
                  </div>
                  {game.gameEt && (
                    <div className="flex items-center gap-2 text-xs text-[#71767a] mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(game.gameEt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Shanghai'
                      })}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Home;

