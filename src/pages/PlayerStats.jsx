import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

function PlayerStats() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState({
    season: '2026|2',
    position: 'all-positions',
    conference: '0'
  });

  const fetchPlayerStats = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams({
        season: filters.season,
        position: filters.position,
        conference: filters.conference,
        limit: '100' // Get more players for better stat sections
      });

      const response = await fetch(`${API_BASE_URL}/api/nba/stats/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error('加载球员数据失败');
      }
      const data = await response.json();
      setPlayers(data.players || []);
      setMetadata(data.metadata || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching player stats:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPlayerStats();
  }, [fetchPlayerStats]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatValue = (player, statName) => {
    return player.stats?.[statName]?.value ?? player.stats?.[statName]?.total ?? '-';
  };

  const getStatRank = (player, statName) => {
    const rank = player.stats?.[statName]?.rank;
    return rank && rank !== '-' ? parseInt(rank) : null;
  };

  // Sort players by a specific stat and return top N
  const getTopPlayersByStat = (statName, count = 10) => {
    return [...players]
      .filter(player => {
        const value = getStatValue(player, statName);
        return value !== '-' && value !== null && !isNaN(parseFloat(value));
      })
      .sort((a, b) => {
        const valA = parseFloat(getStatValue(a, statName));
        const valB = parseFloat(getStatValue(b, statName));
        return valB - valA;
      })
      .slice(0, count);
  };

  // Stat sections configuration
  const statSections = [
    {
      title: '场均得分',
      statName: 'avgPoints',
      icon: '🏀',
      color: 'from-red-500 to-pink-500',
      description: 'Points Per Game'
    },
    {
      title: '场均助攻',
      statName: 'avgAssists',
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500',
      description: 'Assists Per Game'
    },
    {
      title: '场均篮板',
      statName: 'avgRebounds',
      icon: '📊',
      color: 'from-green-500 to-emerald-500',
      description: 'Rebounds Per Game'
    },
    {
      title: '场均抢断',
      statName: 'avgSteals',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      description: 'Steals Per Game'
    },
    {
      title: '场均盖帽',
      statName: 'avgBlocks',
      icon: '🛡️',
      color: 'from-purple-500 to-indigo-500',
      description: 'Blocks Per Game'
    },
    {
      title: '两双次数',
      statName: 'doubleDouble',
      icon: '⭐',
      color: 'from-amber-500 to-yellow-500',
      description: 'Double Double'
    },
    {
      title: '三双次数',
      statName: 'tripleDouble',
      icon: '💎',
      color: 'from-rose-500 to-pink-500',
      description: 'Triple Double'
    },
    {
      title: '场均三分命中',
      statName: 'avgThreePointFieldGoalsMade',
      icon: '🎪',
      color: 'from-teal-500 to-cyan-500',
      description: 'Average 3-Point Field Goals Made'
    },
    {
      title: '投篮命中率',
      statName: 'fieldGoalPct',
      icon: '🎨',
      color: 'from-violet-500 to-purple-500',
      description: 'Field Goal Percentage',
      format: (val) => `${parseFloat(val).toFixed(1)}%`
    },
    {
      title: '三分命中率',
      statName: 'threePointFieldGoalPct',
      icon: '🌈',
      color: 'from-sky-500 to-blue-500',
      description: '3-Point Field Goal Percentage',
      format: (val) => `${parseFloat(val).toFixed(1)}%`
    }
  ];

  const StatSection = ({ section, topPlayers }) => {
    if (topPlayers.length === 0) return null;

    const formatValue = (val) => {
      if (section.format) {
        return section.format(val);
      }
      const numVal = parseFloat(val);
      return isNaN(numVal) ? val : numVal.toFixed(1);
    };

    return (
      <div className="mb-8">
        <div className={`bg-gradient-to-r ${section.color} rounded-t-lg p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{section.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="text-sm opacity-90">{section.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {topPlayers.map((player, index) => {
              const statValue = getStatValue(player, section.statName);
              const rank = getStatRank(player, section.statName) ?? index + 1;
              
              return (
                <div
                  key={`${player.id}-${section.statName}`}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {player.headshot ? (
                          <img
                            src={player.headshot}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-semibold">
                            {player.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">
                          {player.name}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {player.teamLogo && (
                            <img
                              src={player.teamLogo}
                              alt={player.team}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="truncate">{player.team || '-'}</span>
                          <span className="text-gray-400">•</span>
                          <span>{player.position || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : rank === 2 
                          ? 'bg-gray-300 text-gray-700'
                          : rank === 3
                          ? 'bg-orange-300 text-orange-900'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rank}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      场次: {getStatValue(player, 'gamesPlayed')}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        rank === 1 ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {formatValue(statValue)}
                      </div>
                      {rank === 1 && (
                        <div className="text-xs text-yellow-600 font-semibold mt-1">
                          🏆 领先
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载球员数据中...</p>
        </div>
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载球员数据失败</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchPlayerStats}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">球员数据统计</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              赛季
            </label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="2026|2">2025-26 常规赛</option>
              <option value="2025|3">2024-25 季后赛</option>
              <option value="2025|2">2024-25 常规赛</option>
              <option value="2024|3">2023-24 季后赛</option>
              <option value="2024|2">2023-24 常规赛</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              位置
            </label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all-positions">全部位置</option>
              <option value="guard">后卫</option>
              <option value="forward">前锋</option>
              <option value="center">中锋</option>
            </select>
          </div>
        </div>

        {metadata && (
          <div className="mb-4 text-sm text-gray-600">
            <p>赛季: {metadata.season || 'N/A'} • {metadata.seasonType || 'N/A'} • 共 {metadata.totalCount || 0} 名球员</p>
          </div>
        )}
      </div>

      {players.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">未找到球员数据</p>
        </div>
      ) : (
        <div>
          {statSections.map((section) => {
            const topPlayers = getTopPlayersByStat(section.statName, 9);
            return (
              <StatSection
                key={section.statName}
                section={section}
                topPlayers={topPlayers}
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchPlayerStats}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default PlayerStats;
