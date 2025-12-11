import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载球队详情...</p>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载失败</p>
        <p className="text-red-600 text-sm mb-4">{error || '未找到球队数据'}</p>
        <Link
          to="/teams"
          className="text-blue-600 hover:text-blue-800 underline"
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
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回球队列表
        </Link>
      </div>

      {/* Team Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {team.displayName || `${team.location} ${team.name}`}
            </h1>
            {record && (
              <div className="text-xl text-gray-600">
                战绩: <span className="font-semibold text-gray-900">{record}</span>
              </div>
            )}
            {team.standingSummary && (
              <div className="text-sm text-gray-500 mt-1">
                {team.standingSummary}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Statistics Table */}
      {teamStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">球队统计</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">GP</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">PTS</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">REB</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">AST</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">STL</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">BLK</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">TO</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">PF</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">FG%</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">3P%</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">FT%</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">AST/TO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-semibold text-gray-900">{teamStats.gamesPlayed}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgPoints}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgRebounds}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgAssists}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgSteals}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgBlocks}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgTurnovers}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.avgFouls}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.fieldGoalPct}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.threePointPct}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.freeThrowPct}</td>
                  <td className="py-3 px-4 text-gray-700">{teamStats.assistTurnoverRatio}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Statistics Table */}
      {playerStats.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">球员统计</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">NAME</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">GP</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">GS</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">MIN</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">PTS</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">OR</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">DR</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">REB</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">AST</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">STL</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">BLK</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">TO</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">PF</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">AST/TO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {playerStats.map((player, index) => (
                  <tr
                    key={player.id || index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4">
                      <span className="text-blue-600 font-medium">{player.name}</span>
                      <span className="text-gray-500 ml-2">({player.position})</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.gamesPlayed}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.gamesStarted}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgMinutes}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgPoints}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgOffensiveRebounds}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgDefensiveRebounds}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgRebounds}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgAssists}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgSteals}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgBlocks}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgTurnovers}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.avgFouls}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{player.assistTurnoverRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {playerStats.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">暂无球员统计数据</p>
        </div>
      )}
    </div>
  );
}

export default TeamDetails;

