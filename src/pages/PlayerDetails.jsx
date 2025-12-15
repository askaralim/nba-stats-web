import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

function PlayerDetails() {
  const { playerId } = useParams();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [bioData, setBioData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [advancedStatsData, setAdvancedStatsData] = useState(null);
  const [gameLogData, setGameLogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const [info, bio, stats, advancedStats, gameLog] = await Promise.all([
          fetch(`${API_BASE_URL}/api/nba/players/${playerId}`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE_URL}/api/nba/players/${playerId}/bio`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE_URL}/api/nba/players/${playerId}/stats`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE_URL}/api/nba/players/${playerId}/stats/advanced`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE_URL}/api/nba/players/${playerId}/gamelog`).then(r => r.ok ? r.json() : null)
        ]);

        setPlayerInfo(info);
        setBioData(bio);
        setStatsData(stats);
        setAdvancedStatsData(advancedStats);
        setGameLogData(gameLog);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching player details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  // Extract current season stats
  const getCurrentSeasonStats = () => {
    if (!statsData?.categories) return null;
    const averagesCategory = statsData.categories.find(cat => cat.name === 'averages');
    if (!averagesCategory?.statistics) return null;
    
    // Get the most recent season (last in array)
    const seasons = averagesCategory.statistics;
    if (seasons.length === 0) return null;
    
    const currentSeason = seasons[seasons.length - 1];
    const labels = averagesCategory.labels;
    const names = averagesCategory.names;
    
    const stats = {};
    labels.forEach((label, index) => {
      stats[names[index]] = currentSeason.stats[index];
    });
    
    return {
      season: currentSeason.season?.displayName || 'Current',
      stats: stats,
      labels: labels,
      names: names
    };
  };


  // Get team info from player info
  const getTeamInfo = () => {
    if (!playerInfo?.athlete?.team) return null;
    return playerInfo.athlete.team;
  };

  // Get player basic info
  const getPlayerBasicInfo = () => {
    if (!playerInfo?.athlete) return null;
    return playerInfo.athlete;
  };

  // Get regular season stats table data
  const getRegularSeasonStats = () => {
    if (!statsData?.categories) return null;
    const averagesCategory = statsData.categories.find(cat => cat.name === 'averages');
    if (!averagesCategory) return null;
    
    return {
      labels: averagesCategory.labels,
      names: averagesCategory.names,
      displayNames: averagesCategory.displayNames,
      statistics: averagesCategory.statistics || [],
      totals: averagesCategory.totals || []
    };
  };

  // Get advanced stats table data
  const getAdvancedStats = () => {
    if (!advancedStatsData?.categories) return null;
    const advancedCategory = advancedStatsData.categories.find(cat => cat.name === 'advanced');
    if (!advancedCategory) return null;
    
    return {
      labels: advancedCategory.labels,
      names: advancedCategory.names,
      displayNames: advancedCategory.displayNames,
      statistics: advancedCategory.statistics || [],
      glossary: advancedStatsData.glossary || []
    };
  };

  // Get last 5 games from game log
  const getLast5Games = () => {
    if (!gameLogData?.seasonTypes) return null;
    
    // Find the current regular season
    const regularSeason = gameLogData.seasonTypes.find(st => 
      st.displayName && st.displayName.includes('Regular Season')
    );
    
    if (!regularSeason?.categories) return null;
    
    // Get all events from all categories (months)
    const allEvents = [];
    regularSeason.categories.forEach(category => {
      if (category.events && Array.isArray(category.events)) {
        category.events.forEach(event => {
          // Get full event details from events map
          const eventDetails = gameLogData.events?.[event.eventId] || {};
          allEvents.push({
            eventId: event.eventId,
            stats: event.stats || [],
            gameDate: eventDetails.gameDate || event.gameDate,
            score: eventDetails.score,
            gameResult: eventDetails.gameResult,
            opponent: eventDetails.opponent,
            atVs: eventDetails.atVs,
            homeTeamId: eventDetails.homeTeamId,
            awayTeamId: eventDetails.awayTeamId,
            homeTeamScore: eventDetails.homeTeamScore,
            awayTeamScore: eventDetails.awayTeamScore
          });
        });
      }
    });
    
    // Sort by date (most recent first) and take last 5
    const sortedEvents = allEvents.sort((a, b) => {
      const dateA = a.gameDate ? new Date(a.gameDate) : new Date(0);
      const dateB = b.gameDate ? new Date(b.gameDate) : new Date(0);
      return dateB - dateA;
    }).slice(0, 5);
    
    if (sortedEvents.length === 0) return null;
    
    return {
      labels: gameLogData.labels || [],
      names: gameLogData.names || [],
      displayNames: gameLogData.displayNames || [],
      events: sortedEvents
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载球员详情...</p>
        </div>
      </div>
    );
  }

  if (error || (!playerInfo && !statsData)) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error || '未找到球员数据'}</p>
        <Link
          to="/stats/players"
          className="text-[#1d9bf0] hover:text-[#1a8cd8] underline"
        >
          返回球员列表
        </Link>
      </div>
    );
  }

  const playerBasicInfo = getPlayerBasicInfo();
  const teamInfo = getTeamInfo();
  const currentSeasonStats = getCurrentSeasonStats();
  const regularSeasonStats = getRegularSeasonStats();
  const advancedStats = getAdvancedStats();
  const last5Games = getLast5Games();

  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link
          to="/stats/players"
          className="inline-flex items-center text-[#1d9bf0] hover:text-[#1a8cd8] mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回球员列表
        </Link>
      </div>

      {/* Player Header & Biography Section (Combined) */}
      {playerBasicInfo && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            {/* Player Photo */}
            <div className="w-32 h-32 rounded-full bg-[#181818] flex items-center justify-center border-2 border-[#2f3336] overflow-hidden">
              {playerBasicInfo.headshot?.href ? (
                <img
                  src={playerBasicInfo.headshot.href}
                  alt={playerBasicInfo.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#71767a] text-2xl font-bold">
                  {playerBasicInfo.displayName?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {playerBasicInfo.displayName || `球员 #${playerId}`}
              </h1>
              {teamInfo && (
                <div className="flex items-center gap-3 mb-4">
                  {teamInfo.logos?.[0]?.href && (
                    <img
                      src={teamInfo.logos[0].href}
                      alt={teamInfo.displayName}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-white font-medium">{teamInfo.displayName}</span>
                  {playerBasicInfo.displayJersey && (
                    <>
                      <span className="text-[#71767a]">•</span>
                      <span className="text-[#71767a]">{playerBasicInfo.displayJersey}</span>
                    </>
                  )}
                  {playerBasicInfo.position?.displayName && (
                    <>
                      <span className="text-[#71767a]">•</span>
                      <span className="text-[#71767a]">{playerBasicInfo.position.displayName}</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Biography Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {playerBasicInfo.displayHeight && playerBasicInfo.displayWeight && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">身高/体重:</span>
                    <span className="text-white">{playerBasicInfo.displayHeight}, {playerBasicInfo.displayWeight}</span>
                  </div>
                )}
                {playerBasicInfo.displayDOB && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">出生日期:</span>
                    <span className="text-white">{playerBasicInfo.displayDOB} {playerBasicInfo.age ? `(${playerBasicInfo.age}岁)` : ''}</span>
                  </div>
                )}
                {playerBasicInfo.college?.name && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">大学:</span>
                    <span className="text-white">{playerBasicInfo.college.name}</span>
                  </div>
                )}
                {playerBasicInfo.displayDraft && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">选秀信息:</span>
                    <span className="text-white">{playerBasicInfo.displayDraft}</span>
                  </div>
                )}
                {playerBasicInfo.active !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#71767a]">状态:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${playerBasicInfo.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-white">{playerBasicInfo.active ? '活跃' : '非活跃'}</span>
                    </div>
                  </div>
                )}
                {teamInfo && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">球队:</span>
                    <span className="text-white">{teamInfo.displayName}</span>
                  </div>
                )}
                {playerBasicInfo.displayExperience && (
                  <div className="flex justify-between">
                    <span className="text-[#71767a]">经验:</span>
                    <span className="text-white">{playerBasicInfo.displayExperience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Season Stats Card */}
            {currentSeasonStats && (
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 min-w-[280px]">
                <h3 className="text-white font-bold text-sm mb-3">
                  {currentSeasonStats.season} 常规赛数据
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['PTS', 'REB', 'AST', 'FG%'].map((stat) => {
                    const statKey = stat === 'PTS' ? 'avgPoints' : 
                                   stat === 'REB' ? 'avgRebounds' : 
                                   stat === 'AST' ? 'avgAssists' : 
                                   'fieldGoalPct';
                    const value = currentSeasonStats.stats[statKey];
                    return (
                      <div key={stat}>
                        <div className="text-xs text-orange-100 mb-1">{stat}</div>
                        <div className="text-2xl font-bold text-white">
                          {value || '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Last 5 Games Stats Section */}
      {last5Games && last5Games.events && last5Games.events.length > 0 && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">最近5场比赛</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">日期</th>
                  <th className="text-left py-3 px-3 font-medium text-white">比分</th>
                  {last5Games.labels.map((label, idx) => (
                    <th key={idx} className="text-center py-3 px-3 font-medium text-white">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {last5Games.events.map((event, index) => {
                  const gameDate = event.gameDate ? new Date(event.gameDate) : null;
                  const formattedDate = gameDate ? gameDate.toLocaleDateString('zh-CN', { 
                    month: '2-digit', 
                    day: '2-digit' 
                  }) : '-';
                  
                  // Get score and result
                  const score = event.score || '-';
                  const gameResult = event.gameResult === 'W' ? '胜' : event.gameResult === 'L' ? '负' : '';
                  const opponent = event.opponent?.displayName || event.opponent?.abbreviation || '';
                  const atVs = event.atVs === '@' ? '@' : 'vs';
                  
                  return (
                    <motion.tr
                      key={event.eventId || index}
                      className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                        index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.15 + index * 0.03 }}
                    >
                      <td className="py-3 px-3 sticky left-0 z-10 bg-inherit text-white/90">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/games/${event.eventId}`}
                            className="text-[#1d9bf0] hover:text-[#1a8cd8] hover:underline transition-colors"
                          >
                            <span className={gameResult === '胜' ? 'text-green-400' : gameResult === '负' ? 'text-red-400' : 'text-white'}>
                              {gameResult}
                            </span>
                            {' '}
                            <span className="text-white">{atVs} {opponent}</span>
                            {' '}
                            <span className="text-white/70">{score}</span>
                          </Link>
                        </div>
                      </td>
                      {event.stats && event.stats.map((stat, idx) => (
                        <td key={idx} className="text-center py-3 px-3 text-white/90">
                          {stat || '-'}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Career History Section */}
      {bioData?.teamHistory && bioData.teamHistory.length > 0 && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">职业生涯</h2>
          <div className="space-y-3">
            {bioData.teamHistory.map((team, index) => (
              <div key={index} className="flex items-center gap-3">
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={team.displayName}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="text-white font-medium">{team.displayName}</div>
                  <div className="text-sm text-[#71767a]">{team.seasons} ({team.seasonCount} 赛季)</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career Highlights Section */}
      {bioData?.awards && bioData.awards.length > 0 && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">职业生涯亮点</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bioData.awards.map((award, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="text-white font-medium">
                    {award.displayCount} {award.name}
                  </div>
                  <div className="text-sm text-[#71767a] mt-1">
                    {award.seasons.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Regular Season Stats Table */}
      {regularSeasonStats && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">常规赛平均数据</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">赛季</th>
                  <th className="text-left py-3 px-3 font-medium text-white">球队</th>
                  {regularSeasonStats.labels.map((label, idx) => (
                    <th key={idx} className="text-center py-3 px-3 font-medium text-white">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regularSeasonStats.statistics.map((stat, index) => (
                  <motion.tr
                    key={index}
                    className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                      index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.45 + index * 0.03 }}
                  >
                    <td className="py-3 px-3 sticky left-0 z-10 bg-inherit text-white/90">
                      {stat.season?.displayName || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {teamInfo?.logo && (
                        <img
                          src={teamInfo.logo}
                          alt={teamInfo.displayName}
                          className="w-6 h-6 inline-block mr-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-white/90">{teamInfo?.abbreviation || 'GS'}</span>
                    </td>
                    {stat.stats.map((value, idx) => (
                      <td key={idx} className="text-center py-3 px-3 text-white/90">
                        {value || '-'}
                      </td>
                    ))}
                  </motion.tr>
                ))}
                {/* Career Totals Row */}
                {regularSeasonStats.totals && regularSeasonStats.totals.length > 0 && (
                  <motion.tr
                    className="border-t-2 border-[#2f3336] bg-[#181818]/50 font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.5 }}
                  >
                    <td className="py-3 px-3 sticky left-0 z-10 bg-inherit text-white">职业生涯</td>
                    <td className="py-3 px-3 text-white">{teamInfo?.abbreviation || 'GS'}</td>
                    {regularSeasonStats.totals.map((value, idx) => (
                      <td key={idx} className="text-center py-3 px-3 text-white">
                        {value || '-'}
                      </td>
                    ))}
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Advanced Stats Table */}
      {advancedStats && (
        <motion.div
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">高级数据</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">赛季</th>
                  {advancedStats.labels.map((label, idx) => (
                    <th key={idx} className="text-center py-3 px-3 font-medium text-white">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {advancedStats.statistics.map((stat, index) => (
                  <motion.tr
                    key={index}
                    className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                      index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.55 + index * 0.03 }}
                  >
                    <td className="py-3 px-3 sticky left-0 z-10 bg-inherit text-white/90">
                      {stat.season?.displayName || '-'}
                    </td>
                    {stat.stats.map((value, idx) => (
                      <td key={idx} className="text-center py-3 px-3 text-white/90">
                        {value === '-' || value === null ? '-' : value}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Glossary */}
          {advancedStats.glossary && advancedStats.glossary.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#2f3336]">
              <h3 className="text-lg font-bold text-white mb-3">术语表</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {advancedStats.glossary.map((item, index) => (
                  <div key={index}>
                    <span className="font-medium text-white">{item.abbreviation}:</span>
                    <span className="text-[#71767a] ml-2">{item.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default PlayerDetails;
