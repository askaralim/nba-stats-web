import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import TeamStandingsSkeleton from '../components/TeamStandingsSkeleton';
import { API_BASE_URL } from '../config';

function TeamsList() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStandings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/nba/standings`);
      if (!response.ok) {
        throw new Error('加载排名失败');
      }
      const data = await response.json();
      setStandings(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching standings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const getStreakColor = (streakType) => {
    if (!streakType) return 'text-[#71767a]';
    return streakType.toLowerCase().includes('w') ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-[#2f3336]/50 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-[#2f3336]/30 rounded animate-pulse" />
        </div>

        {/* Standings Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eastern Conference Skeleton */}
          <TeamStandingsSkeleton count={15} />
          
          {/* Western Conference Skeleton */}
          <TeamStandingsSkeleton count={15} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载排名失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error}</p>
        <button
          onClick={fetchStandings}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  if (!standings || !standings.conferences) {
    return (
      <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-12 text-center">
        <p className="text-white text-lg">未找到排名数据</p>
      </div>
    );
  }

  const eastConference = standings.conferences.East || standings.conferences['Eastern Conference'];
  const westConference = standings.conferences.West || standings.conferences['Western Conference'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">NBA球队排名</h1>
        {standings.seasonDisplayName && (
          <p className="text-[#71767a]">
            {standings.seasonDisplayName} {standings.seasonType === 3 ? '季后赛' : '常规赛'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eastern Conference */}
        {eastConference && (
          <div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-4 text-white">
              <h2 className="text-2xl font-bold">{eastConference.name}</h2>
            </div>
            <motion.div 
              className="bg-[#16181c] border border-[#2f3336] rounded-b-xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2f3336]/30">
                      <th className="text-left py-3 px-4 font-medium text-white text-sm">排名</th>
                      <th className="text-left py-3 px-4 font-medium text-white text-sm sticky left-0 z-10 bg-[#181818]">球队</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">负</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜率</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜差</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">连胜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eastConference.teams.map((team, index) => (
                      <motion.tr
                        key={team.id}
                        className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                          index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.15 + index * 0.03 }}
                      >
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            team.playoffSeed <= 8
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                              : 'bg-[#181818] text-[#71767a] border border-[#2f3336]/30'
                          }`}>
                            {team.playoffSeed || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4 sticky left-0 z-10 bg-inherit">
                          <Link
                            to={`/teams/${team.abbreviation?.toLowerCase() || team.id}`}
                            className="flex items-center space-x-3 hover:text-[#1d9bf0] transition-colors"
                          >
                            {team.logo && (
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-white">{team.name}</div>
                              <div className="text-xs text-[#71767a]">{team.abbreviation}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-center text-white/90 font-semibold">
                          {team.wins ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-white/90">
                          {team.losses ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-white/90">
                          {team.winPercentDisplay || '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-[#71767a] text-sm">
                          {team.gamesBehindDisplay || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            getStreakColor(team.streakType) === 'text-green-400' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : getStreakColor(team.streakType) === 'text-red-400'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'text-[#71767a]'
                          }`}>
                            {team.streakType || '-'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* Western Conference */}
        {westConference && (
          <div>
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-xl p-4 text-white">
              <h2 className="text-2xl font-bold">{westConference.name}</h2>
            </div>
            <motion.div 
              className="bg-[#16181c] border border-[#2f3336] rounded-b-xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2f3336]/30">
                      <th className="text-left py-3 px-4 font-medium text-white text-sm">排名</th>
                      <th className="text-left py-3 px-4 font-medium text-white text-sm sticky left-0 z-10 bg-[#181818]">球队</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">负</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜率</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">胜差</th>
                      <th className="text-center py-3 px-4 font-medium text-white text-sm">连胜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {westConference.teams.map((team, index) => (
                      <motion.tr
                        key={team.id}
                        className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                          index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.25 + index * 0.03 }}
                      >
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            team.playoffSeed <= 8
                              ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                              : 'bg-[#181818] text-[#71767a] border border-[#2f3336]/30'
                          }`}>
                            {team.playoffSeed || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4 sticky left-0 z-10 bg-inherit">
                          <Link
                            to={`/teams/${team.abbreviation?.toLowerCase() || team.id}`}
                            className="flex items-center space-x-3 hover:text-[#1d9bf0] transition-colors"
                          >
                            {team.logo && (
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-white">{team.name}</div>
                              <div className="text-xs text-[#71767a]">{team.abbreviation}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-center text-white/90 font-semibold">
                          {team.wins ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-white/90">
                          {team.losses ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-white/90">
                          {team.winPercentDisplay || '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-[#71767a] text-sm">
                          {team.gamesBehindDisplay || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            getStreakColor(team.streakType) === 'text-green-400' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : getStreakColor(team.streakType) === 'text-red-400'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'text-[#71767a]'
                          }`}>
                            {team.streakType || '-'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchStandings}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default TeamsList;
