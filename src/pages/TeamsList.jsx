import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

  const formatWinPercent = (percent) => {
    if (percent === null || percent === undefined) return '-';
    return (percent * 100).toFixed(1);
  };

  const formatGamesBehind = (gamesBehind) => {
    if (gamesBehind === null || gamesBehind === undefined || gamesBehind === 0) return '-';
    return gamesBehind.toFixed(1);
  };

  const getStreakColor = (streakType) => {
    if (!streakType) return 'text-gray-600';
    return streakType.toLowerCase().includes('win') ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载排名中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载排名失败</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchStandings}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!standings || !standings.conferences) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600 text-lg">未找到排名数据</p>
      </div>
    );
  }

  const eastConference = standings.conferences.East || standings.conferences['Eastern Conference'];
  const westConference = standings.conferences.West || standings.conferences['Western Conference'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NBA球队排名</h1>
        {standings.seasonDisplayName && (
          <p className="text-gray-600">
            {standings.seasonDisplayName} {standings.seasonType === 3 ? '季后赛' : '常规赛'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eastern Conference */}
        {eastConference && (
          <div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-4 text-white">
              <h2 className="text-2xl font-bold">{eastConference.name}</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">排名</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">球队</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">负</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜率</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜差</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">连胜</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eastConference.teams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            team.playoffSeed <= 8
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {team.playoffSeed || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/teams/${team.id}`}
                            className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
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
                              <div className="font-semibold text-gray-900">{team.name}</div>
                              <div className="text-xs text-gray-500">{team.abbreviation}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 font-semibold">
                          {team.wins ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {team.losses ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {formatWinPercent(team.winPercent)}%
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 text-sm">
                          {formatGamesBehind(team.gamesBehind)}
                        </td>
                        <td className={`py-3 px-4 text-center text-sm font-semibold ${getStreakColor(team.streakType)}`}>
                          {team.streakType || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Western Conference */}
        {westConference && (
          <div>
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-lg p-4 text-white">
              <h2 className="text-2xl font-bold">{westConference.name}</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">排名</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">球队</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">负</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜率</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">胜差</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">连胜</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {westConference.teams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            team.playoffSeed <= 8
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {team.playoffSeed || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/teams/${team.id}`}
                            className="flex items-center space-x-3 hover:text-red-600 transition-colors"
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
                              <div className="font-semibold text-gray-900">{team.name}</div>
                              <div className="text-xs text-gray-500">{team.abbreviation}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 font-semibold">
                          {team.wins ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {team.losses ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {formatWinPercent(team.winPercent)}%
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 text-sm">
                          {formatGamesBehind(team.gamesBehind)}
                        </td>
                        <td className={`py-3 px-4 text-center text-sm font-semibold ${getStreakColor(team.streakType)}`}>
                          {team.streakType || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchStandings}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          刷新
        </button>
      </div>
    </div>
  );
}

export default TeamsList;
