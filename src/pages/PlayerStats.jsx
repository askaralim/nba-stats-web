import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, getErrorMessage } from '../utils/api';

function PlayerStats() {
  const [topPlayersByStat, setTopPlayersByStat] = useState({});
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
      const params = {
        season: filters.season,
        position: filters.position,
        conference: filters.conference,
        limit: '100' // Get more players for better stat sections
      };

      const data = await apiGet('/api/nba/stats/players', params);
      setTopPlayersByStat(data.topPlayersByStat || {});
      setMetadata(data.metadata || {});
    } catch (err) {
      setError(getErrorMessage(err) || '加载球员数据失败');
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

  // Stat sections configuration (matching backend stat names)
  const statSections = [
    {
      title: '得分',
      statName: 'avgPoints',
      icon: '🏀',
      color: 'from-red-500 to-pink-500',
      description: 'Points Per Game'
    },
    {
      title: '助攻',
      statName: 'avgAssists',
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500',
      description: 'Assists Per Game'
    },
    {
      title: '篮板',
      statName: 'avgRebounds',
      icon: '📊',
      color: 'from-green-500 to-emerald-500',
      description: 'Rebounds Per Game'
    },
    {
      title: '抢断',
      statName: 'avgSteals',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      description: 'Steals Per Game'
    },
    {
      title: '盖帽',
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
      title: '三分命中',
      statName: 'avgThreePointFieldGoalsMade',
      icon: '🎪',
      color: 'from-teal-500 to-cyan-500',
      description: 'Average 3-Point Field Goals Made'
    },
    {
      title: '投篮%',
      statName: 'fieldGoalPct',
      icon: '🎨',
      color: 'from-violet-500 to-purple-500',
      description: 'Field Goal Percentage'
    },
    {
      title: '三分%',
      statName: 'threePointFieldGoalPct',
      icon: '🌈',
      color: 'from-sky-500 to-blue-500',
      description: '3-Point Field Goal Percentage'
    }
  ];

  const StatSection = ({ section, categoryData }) => {
    if (!categoryData || !categoryData.players || categoryData.players.length === 0) return null;

    const { players } = categoryData;

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
        
        <div className="bg-[#16181c] border border-[#2f3336] rounded-b-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {players.map((player) => {
              const stat = player.stats?.[section.statName];
              const statValue = stat?.displayValue || '-';
              const rank = player.statRank ?? stat?.rank ?? 1;
              const gamesPlayed = player.stats?.gamesPlayed?.displayValue || player.stats?.gamesPlayed?.value || '-';
              
              return (
                <div
                  key={`${player.id}-${section.statName}`}
                  className="bg-[#16181c] rounded-xl border border-[#2f3336] hover:bg-[#181818] hover:border-[#2f3336] transition-all duration-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {player.headshot ? (
                          <img
                            src={player.headshot}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#2f3336]"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#181818] flex items-center justify-center text-[#71767a] font-semibold">
                            {player.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {player.id ? (
                          <Link
                            to={`/players/${player.id}`}
                            className="font-bold text-[#1d9bf0] hover:text-[#1a8cd8] hover:underline truncate block transition-colors"
                          >
                            {player.name}
                          </Link>
                        ) : (
                          <div className="font-bold text-white truncate">
                            {player.name}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-[#71767a]">
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
                          <span className="text-[#71767a]">•</span>
                          <span>{player.position || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : rank === 2 
                          ? 'bg-[#2f3336] text-white'
                          : rank === 3
                          ? 'bg-orange-300 text-orange-900'
                          : 'bg-[#181818] text-[#71767a]'
                      }`}>
                        {rank}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#2f3336]">
                    <div className="text-xs text-[#71767a]">
                      场次: {gamesPlayed}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        rank === 1 ? 'text-yellow-600' : 'text-white'
                      }`}>
                        {statValue}
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

  if (loading && Object.keys(topPlayersByStat).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载球员数据中...</p>
        </div>
      </div>
    );
  }

  if (error && Object.keys(topPlayersByStat).length === 0) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载球员数据失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error}</p>
        <button
          onClick={fetchPlayerStats}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">球员数据统计</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              赛季
            </label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="w-full px-4 py-2 bg-[#16181c] border border-[#2f3336] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
            >
              <option value="2026|2">2025-26 常规赛</option>
              <option value="2025|3">2024-25 季后赛</option>
              <option value="2025|2">2024-25 常规赛</option>
              <option value="2024|3">2023-24 季后赛</option>
              <option value="2024|2">2023-24 常规赛</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              位置
            </label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full px-4 py-2 bg-[#16181c] border border-[#2f3336] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
            >
              <option value="all-positions">全部位置</option>
              <option value="guard">后卫</option>
              <option value="forward">前锋</option>
              <option value="center">中锋</option>
            </select>
          </div>
        </div>

        {metadata && (
          <div className="mb-4 text-sm text-[#71767a]">
            <p>赛季: {metadata.season || 'N/A'} • {metadata.seasonType || 'N/A'} • 共 {metadata.totalCount || 0} 名球员</p>
          </div>
        )}
      </div>

      {Object.keys(topPlayersByStat).length === 0 ? (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-12 text-center">
          <p className="text-[#71767a] text-lg">未找到球员数据</p>
        </div>
      ) : (
        <div>
          {statSections.map((section) => {
            const categoryData = topPlayersByStat[section.statName];
            return (
              <StatSection
                key={section.statName}
                section={section}
                categoryData={categoryData}
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchPlayerStats}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default PlayerStats;
