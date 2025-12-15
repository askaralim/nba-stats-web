import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

function TeamDetails() {
  const { teamAbbreviation } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/nba/teams/${teamAbbreviation}`);
        if (!response.ok) {
          throw new Error('加载球队详情失败');
        }
        const data = await response.json();
        setTeamData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching team details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamAbbreviation) {
      fetchTeamDetails();
    }
  }, [teamAbbreviation]);

  // Extract record from team statistics
  const getRecord = () => {
    if (!teamData?.statistics?.team?.recordSummary) return null;
    return teamData.statistics.team.recordSummary;
  };

  // Get team totals stats
  const getTeamStats = () => {
    if (!teamData?.statistics?.teamTotals) return null;
    
    const stats = {};
    teamData.statistics.teamTotals.forEach(category => {
      category.stats.forEach(stat => {
        stats[stat.name] = stat;
      });
    });
    
    return {
      gamesPlayed: stats.gamesPlayed?.displayValue || '-',
      avgPoints: stats.avgPoints?.displayValue || '-',
      avgRebounds: stats.avgRebounds?.displayValue || '-',
      avgAssists: stats.avgAssists?.displayValue || '-',
      avgSteals: stats.avgSteals?.displayValue || '-',
      avgBlocks: stats.avgBlocks?.displayValue || '-',
      avgTurnovers: stats.avgTurnovers?.displayValue || '-',
      avgFouls: stats.avgFouls?.displayValue || '-',
      fieldGoalPct: stats.fieldGoalPct?.displayValue || '-',
      threePointPct: stats.threePointPct?.displayValue || '-',
      freeThrowPct: stats.freeThrowPct?.displayValue || '-',
      assistTurnoverRatio: stats.assistTurnoverRatio?.displayValue || '-'
    };
  };

  // Get player statistics
  // The API structure: results is an array of stat categories
  // Each category has a leaders array with top players for that stat
  // We collect all unique players from all leader arrays and combine their stats
  const getPlayerStats = () => {
    if (!teamData?.statistics?.results) return [];
    
    const results = teamData.statistics.results;
    const playersMap = new Map();
    
    // Check if results is an array (stat categories with leaders)
    if (Array.isArray(results)) {
      // Iterate through each stat category in results
      results.forEach(statCategory => {
        if (!statCategory.leaders || !Array.isArray(statCategory.leaders)) return;
        
        // For each leader (player) in this stat category
        statCategory.leaders.forEach(leader => {
          if (!leader.athlete || !leader.statistics) return;
          
          const athlete = leader.athlete;
          const playerId = athlete.id;
          
          if (!playerId) return;
          
          // Get or create player entry
          if (!playersMap.has(playerId)) {
            playersMap.set(playerId, {
              id: playerId,
              name: athlete.fullName || athlete.displayName || athlete.shortName || 'Unknown',
              position: athlete.position?.abbreviation || athlete.position?.name || '-',
              stats: {}
            });
          }
          
          const player = playersMap.get(playerId);
          
          // Extract stats from this leader's statistics array
          if (Array.isArray(leader.statistics)) {
            leader.statistics.forEach(category => {
              if (Array.isArray(category.stats)) {
                category.stats.forEach(stat => {
                  // Store the stat (will be overwritten if we see it again, but that's okay)
                  player.stats[stat.name] = stat;
                });
              }
            });
          }
        });
      });
    } 
    // Check if results has athletes directly (alternative structure)
    else if (results.athletes && Array.isArray(results.athletes)) {
      results.athletes.forEach(athlete => {
        const playerId = athlete.id;
        if (!playerId) return;
        
        const stats = {};
        
        // Extract stats from athlete.statistics array
        if (Array.isArray(athlete.statistics)) {
          athlete.statistics.forEach(category => {
            if (Array.isArray(category.stats)) {
              category.stats.forEach(stat => {
                stats[stat.name] = stat;
              });
            }
          });
        }
        
        playersMap.set(playerId, {
          id: playerId,
          name: athlete.fullName || athlete.displayName || 'Unknown',
          position: athlete.position?.abbreviation || athlete.position?.name || '-',
          stats: stats
        });
      });
    }
    
    // Convert map to array and format stats
    return Array.from(playersMap.values()).map(player => {
      const stats = player.stats;
      
      return {
        id: player.id,
        name: player.name,
        position: player.position,
        gamesPlayed: stats.gamesPlayed?.displayValue || '-',
        gamesStarted: stats.gamesStarted?.displayValue || '-',
        avgMinutes: stats.avgMinutes?.displayValue || '-',
        avgPoints: stats.avgPoints?.displayValue || '-',
        avgOffensiveRebounds: stats.avgOffensiveRebounds?.displayValue || '-',
        avgDefensiveRebounds: stats.avgDefensiveRebounds?.displayValue || '-',
        avgRebounds: stats.avgRebounds?.displayValue || '-',
        avgAssists: stats.avgAssists?.displayValue || '-',
        avgSteals: stats.avgSteals?.displayValue || '-',
        avgBlocks: stats.avgBlocks?.displayValue || '-',
        avgTurnovers: stats.avgTurnovers?.displayValue || '-',
        avgFouls: stats.avgFouls?.displayValue || '-',
        assistTurnoverRatio: stats.assistTurnoverRatio?.displayValue || '-'
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载球队详情...</p>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error || '未找到球队数据'}</p>
        <Link
          to="/teams"
          className="text-[#1d9bf0] hover:text-[#1a8cd8] underline"
        >
          返回球队列表
        </Link>
      </div>
    );
  }

  const team = teamData.team;
  const record = getRecord();
  const teamStats = getTeamStats();
  const playerStats = getPlayerStats();

  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link
          to="/teams"
          className="inline-flex items-center text-[#1d9bf0] hover:text-[#1a8cd8] mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回球队列表
        </Link>
      </div>

      {/* Team Header */}
      <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6">
        <div className="flex items-center space-x-6">
          {team.logos?.[0]?.href && (
            <img
              src={team.logos[0].href}
              alt={team.displayName}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {team.displayName || `${team.location} ${team.name}`}
            </h1>
            {record && (
              <div className="text-xl text-[#71767a]">
                战绩: <span className="font-semibold text-white">{record}</span>
              </div>
            )}
            {team.standingSummary && (
              <div className="text-sm text-[#71767a] mt-1">
                {team.standingSummary}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Statistics Table */}
      {teamStats && (
        <motion.div 
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">球队统计</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-center py-3 px-3 font-medium text-white">场次</th>
                  <th className="text-center py-3 px-3 font-medium text-white">得分</th>
                  <th className="text-center py-3 px-3 font-medium text-white">篮板</th>
                  <th className="text-center py-3 px-3 font-medium text-white">助攻</th>
                  <th className="text-center py-3 px-3 font-medium text-white">抢断</th>
                  <th className="text-center py-3 px-3 font-medium text-white">盖帽</th>
                  <th className="text-center py-3 px-3 font-medium text-white">失误</th>
                  <th className="text-center py-3 px-3 font-medium text-white">犯规</th>
                  <th className="text-center py-3 px-3 font-medium text-white">命中率</th>
                  <th className="text-center py-3 px-3 font-medium text-white">三分%</th>
                  <th className="text-center py-3 px-3 font-medium text-white">罚球%</th>
                  <th className="text-center py-3 px-3 font-medium text-white">AST/TO</th>
                </tr>
              </thead>
              <tbody>
                <motion.tr 
                  className="border-b border-[#2f3336]/20 bg-[#16181c]/30 transition-all duration-200 hover:bg-[#181818]/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <td className="text-center py-3 px-3 font-semibold text-white">{teamStats.gamesPlayed}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgPoints}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgRebounds}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgAssists}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgSteals}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgBlocks}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgTurnovers}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.avgFouls}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.fieldGoalPct}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.threePointPct}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.freeThrowPct}</td>
                  <td className="text-center py-3 px-3 text-white/90">{teamStats.assistTurnoverRatio}</td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Player Statistics Table */}
      {playerStats.length > 0 && (
        <motion.div 
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">球员统计</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-left py-3 px-3 font-medium text-white sticky left-0 z-10 bg-[#16181c]">球员</th>
                  <th className="text-center py-3 px-3 font-medium text-white">场次</th>
                  <th className="text-center py-3 px-3 font-medium text-white">先发</th>
                  <th className="text-center py-3 px-3 font-medium text-white">时间</th>
                  <th className="text-center py-3 px-3 font-medium text-white">得分</th>
                  <th className="text-center py-3 px-3 font-medium text-white">进攻篮板</th>
                  <th className="text-center py-3 px-3 font-medium text-white">防守篮板</th>
                  <th className="text-center py-3 px-3 font-medium text-white">篮板</th>
                  <th className="text-center py-3 px-3 font-medium text-white">助攻</th>
                  <th className="text-center py-3 px-3 font-medium text-white">抢断</th>
                  <th className="text-center py-3 px-3 font-medium text-white">盖帽</th>
                  <th className="text-center py-3 px-3 font-medium text-white">失误</th>
                  <th className="text-center py-3 px-3 font-medium text-white">犯规</th>
                  <th className="text-center py-3 px-3 font-medium text-white">AST/TO</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((player, index) => (
                  <motion.tr
                    key={player.id || index}
                    className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                      index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.25 + index * 0.03 }}
                  >
                    <td className="py-3 px-3 sticky left-0 z-10 bg-inherit">
                      {player.id ? (
                        <Link
                          to={`/players/${player.id}`}
                          className="text-[#1d9bf0] hover:text-[#1a8cd8] hover:underline font-medium text-[15px] transition-colors"
                        >
                          {player.name}
                        </Link>
                      ) : (
                        <span className="text-[#1d9bf0] font-medium text-[15px]">{player.name}</span>
                      )}
                      <span className="text-[#71767a] ml-2 text-xs">({player.position})</span>
                    </td>
                    <td className="py-3 px-3 text-center text-white/90">{player.gamesPlayed}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.gamesStarted}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgMinutes}</td>
                    <td className="py-3 px-3 text-center font-semibold text-white">{player.avgPoints}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgOffensiveRebounds}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgDefensiveRebounds}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgRebounds}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgAssists}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgSteals}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgBlocks}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgTurnovers}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgFouls}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.assistTurnoverRatio}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {playerStats.length === 0 && (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-12 text-center">
          <p className="text-[#71767a]">暂无球员统计数据</p>
        </div>
      )}
    </div>
  );
}

export default TeamDetails;

