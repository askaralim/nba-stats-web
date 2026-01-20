import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { apiGet, getErrorMessage } from '../utils/api';

function TeamDetails() {
  const { teamAbbreviation } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [leaders, setLeaders] = useState(null);
  const [recentGames, setRecentGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Fetch all data in parallel using apiGet utility
        const [teamDataResult, leadersResult, recentGamesResult] = await Promise.allSettled([
          apiGet(`/api/v1/nba/teams/${teamAbbreviation}`),
          apiGet(`/api/v1/nba/teams/${teamAbbreviation}/leaders`).catch(() => null),
          apiGet(`/api/v1/nba/teams/${teamAbbreviation}/recent-games`, { seasontype: '2' }).catch(() => null)
        ]);
        
        if (teamDataResult.status === 'fulfilled') {
          setTeamData(teamDataResult.value);
        } else {
          throw teamDataResult.reason;
        }
        
        if (leadersResult.status === 'fulfilled' && leadersResult.value) {
          setLeaders(leadersResult.value);
        }
        
        if (recentGamesResult.status === 'fulfilled' && recentGamesResult.value) {
          setRecentGames(recentGamesResult.value);
        }
      } catch (err) {
        setError(getErrorMessage(err) || '加载球队详情失败');
        console.error('Error fetching team details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamAbbreviation) {
      fetchTeamDetails();
    }
  }, [teamAbbreviation]);

  // Use clean API data directly - no extraction needed
  const record = teamData?.team?.record || null;
  const teamStats = teamData?.teamStats || {};
  // Ensure players is an array
  const playerStats = Array.isArray(teamData?.players) ? teamData.players : [];
  const last5Games = recentGames?.last5Games || [];
  const next3Games = recentGames?.next3Games || [];
  const teamLeaders = leaders || {
    offense: { points: null, assists: null, fieldGoalPct: null },
    defense: { rebounds: null, steals: null, blocks: null }
  };

  // Early return if loading
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

  if (!teamData) {
    return null; // Don't render if data isn't loaded yet
  }

  const team = teamData.team;

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
        <div className="flex items-center space-x-6 mb-6">
          {team.logo && (
            <img
              src={team.logo}
              alt={team.displayName}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {team.name}
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

        {/* Team Statistics Grid */}
        {teamStats && Object.keys(teamStats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Helper function to render stat card with ranking */}
            {(() => {
              const StatCard = ({ statValue, label, isPercentage = false }) => {
                if (!statValue) return null;
                
                const value = typeof statValue === 'object' ? statValue.value : statValue;
                const rank = typeof statValue === 'object' ? statValue.rank : null;
                const displayValue = isPercentage ? `${value}%` : value;

                return (
                  <motion.div 
                    className="bg-gradient-to-br from-[#0f1114] to-[#16181c] rounded-xl border border-[#2f3336]/40 p-5 hover:border-[#1d9bf0]/30 hover:shadow-lg hover:shadow-[#1d9bf0]/10 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-3xl font-bold text-white mb-2">{displayValue}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#71767a]">{label}</div>
                      {rank && (
                        <div className="text-xs text-[#1d9bf0]">
                          #{rank}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              };
              
              return (
                <>
                  <StatCard statValue={teamStats.avgPoints} label="得分" />
                  <StatCard statValue={teamStats.avgRebounds} label="篮板" />
                  <StatCard statValue={teamStats.avgAssists} label="助攻" />
                  <StatCard statValue={teamStats.avgSteals} label="抢断" />
                  <StatCard statValue={teamStats.avgBlocks} label="封盖" />
                  <StatCard statValue={teamStats.fieldGoalPct} label="投篮命中率" isPercentage={true} />
                  <StatCard statValue={teamStats.threePointPct} label="三分命中率" isPercentage={true} />
                  <StatCard statValue={teamStats.freeThrowPct} label="罚球命中率" isPercentage={true} />
                  <StatCard statValue={teamStats.avgTurnovers} label="失误" />
                </>
              );
            })()}
            {/* Assist/Turnover Ratio */}
            {/* {teamStats.assistTurnoverRatio && (
              <motion.div 
                className="bg-gradient-to-br from-[#0f1114] to-[#16181c] rounded-xl border border-[#2f3336]/40 p-5 hover:border-[#1d9bf0]/30 hover:shadow-lg hover:shadow-[#1d9bf0]/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-2">{teamStats.assistTurnoverRatio}</div>
                <div className="text-sm text-[#71767a]">助攻失误比</div>
              </motion.div>
            )} */}
            {/* Offensive Rebounds */}
            {/* {teamStats.avgOffensiveRebounds && (
              <motion.div 
                className="bg-gradient-to-br from-[#0f1114] to-[#16181c] rounded-xl border border-[#2f3336]/40 p-5 hover:border-[#1d9bf0]/30 hover:shadow-lg hover:shadow-[#1d9bf0]/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-2">{teamStats.avgOffensiveRebounds}</div>
                <div className="text-sm text-[#71767a]">进攻篮板</div>
              </motion.div>
            )} */}
            {/* Defensive Rebounds */}
            {/* {teamStats.avgDefensiveRebounds && (
              <motion.div 
                className="bg-gradient-to-br from-[#0f1114] to-[#16181c] rounded-xl border border-[#2f3336]/40 p-5 hover:border-[#1d9bf0]/30 hover:shadow-lg hover:shadow-[#1d9bf0]/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-2">{teamStats.avgDefensiveRebounds}</div>
                <div className="text-sm text-[#71767a]">防守篮板</div>
              </motion.div>
            )} */}
            {/* Fouls */}
            {/* {teamStats.avgFouls && (
              <motion.div 
                className="bg-gradient-to-br from-[#0f1114] to-[#16181c] rounded-xl border border-[#2f3336]/40 p-5 hover:border-[#1d9bf0]/30 hover:shadow-lg hover:shadow-[#1d9bf0]/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-2">{teamStats.avgFouls}</div>
                <div className="text-sm text-[#71767a]">犯规</div>
              </motion.div>
            )} */}
          </div>
        )}
      </div>

      {/* Last 5 Games & Next 3 Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Last 5 Games */}
        <motion.div 
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">最近比赛</h2>
          {last5Games.length === 0 ? (
            <p className="text-[#71767a] text-sm">暂无比赛数据</p>
          ) : (
            <div className="space-y-3">
              {last5Games.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="block p-3 rounded-lg bg-[#0f1114] hover:bg-[#181818]/50 transition-colors border border-[#2f3336]/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        game.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {game.won ? 'W' : 'L'}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          <span className={game.homeTeam.abbreviation === teamAbbreviation?.toUpperCase() ? 'font-semibold' : ''}>
                            {game.homeTeam.name}
                          </span>
                          {' vs '}
                          <span className={game.awayTeam.abbreviation === teamAbbreviation?.toUpperCase() ? 'font-semibold' : ''}>
                            {game.awayTeam.name}
                          </span>
                        </div>
                        <div className="text-xs text-[#71767a] mt-1">
                          {game.dateFormatted?.shortDate || game.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {game.homeTeam.score} - {game.awayTeam.score}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Next 3 Games */}
        <motion.div 
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">即将开打</h2>
          {next3Games.length === 0 ? (
            <p className="text-[#71767a] text-sm">暂无比赛数据</p>
          ) : (
            <div className="space-y-3">
              {next3Games.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="block p-3 rounded-lg bg-[#0f1114] hover:bg-[#181818]/50 transition-colors border border-[#2f3336]/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white">
                        <span className={game.homeTeam.abbreviation === teamAbbreviation?.toUpperCase() ? 'font-semibold' : ''}>
                          {game.homeTeam.name}
                        </span>
                        {' vs '}
                        <span className={game.awayTeam.abbreviation === teamAbbreviation?.toUpperCase() ? 'font-semibold' : ''}>
                          {game.awayTeam.name}
                        </span>
                      </div>
                      <div className="text-xs text-[#71767a] mt-1">
                        {game.dateFormatted?.shortDate || game.date}
                      </div>
                    </div>
                    <div className="text-xs text-[#71767a]">
                      {game.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Team Leaders - Combined Offense & Defense */}
      <motion.div 
        className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">球队领袖</h2>
        
        {/* Offense & Defense Leaders in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offense Leaders */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">进攻</h3>
            <div className="space-y-4">
          {/* Points Per Game */}
          {teamLeaders.offense.points && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">得分</div>
              {teamLeaders.offense.points.headshot && (
                <img
                  src={teamLeaders.offense.points.headshot}
                  alt={teamLeaders.offense.points.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.offense.points.id ? (
                    <Link
                      to={`/players/${teamLeaders.offense.points.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.offense.points.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.offense.points.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.offense.points.position} #{teamLeaders.offense.points.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.offense.points.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  MIN: {teamLeaders.offense.points.additionalStats?.avgMinutes || '-'} | 
                  FG%: {teamLeaders.offense.points.additionalStats?.fieldGoalPct || '-'}
                </div>
              </div>
            </div>
          )}

          {/* Assists Per Game */}
          {teamLeaders.offense.assists && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">助攻</div>
              {teamLeaders.offense.assists.headshot && (
                <img
                  src={teamLeaders.offense.assists.headshot}
                  alt={teamLeaders.offense.assists.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.offense.assists.id ? (
                    <Link
                      to={`/players/${teamLeaders.offense.assists.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.offense.assists.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.offense.assists.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.offense.assists.position} #{teamLeaders.offense.assists.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.offense.assists.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  PPG: {teamLeaders.offense.assists.additionalStats?.avgPoints || '-'} | 
                  TO: {teamLeaders.offense.assists.additionalStats?.avgTurnovers || '-'}
                </div>
              </div>
            </div>
          )}

          {/* Field Goal Percentage */}
          {teamLeaders.offense.fieldGoalPct && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">投篮%</div>
              {teamLeaders.offense.fieldGoalPct.headshot && (
                <img
                  src={teamLeaders.offense.fieldGoalPct.headshot}
                  alt={teamLeaders.offense.fieldGoalPct.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.offense.fieldGoalPct.id ? (
                    <Link
                      to={`/players/${teamLeaders.offense.fieldGoalPct.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.offense.fieldGoalPct.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.offense.fieldGoalPct.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.offense.fieldGoalPct.position} #{teamLeaders.offense.fieldGoalPct.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.offense.fieldGoalPct.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  MIN: {teamLeaders.offense.fieldGoalPct.additionalStats?.avgMinutes || '-'} | 
                  PPG: {teamLeaders.offense.fieldGoalPct.additionalStats?.avgPoints || '-'}
                </div>
              </div>
            </div>
          )}
            </div>
          </div>

          {/* Defense Leaders */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">防守</h3>
            <div className="space-y-4">
          {/* Rebounds Per Game */}
          {teamLeaders.defense.rebounds && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">篮板</div>
              {teamLeaders.defense.rebounds.headshot && (
                <img
                  src={teamLeaders.defense.rebounds.headshot}
                  alt={teamLeaders.defense.rebounds.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.defense.rebounds.id ? (
                    <Link
                      to={`/players/${teamLeaders.defense.rebounds.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.defense.rebounds.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.defense.rebounds.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.defense.rebounds.position} #{teamLeaders.defense.rebounds.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.defense.rebounds.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  DRPG: {teamLeaders.defense.rebounds.additionalStats?.avgDefensiveRebounds || '-'} | 
                  ORPG: {teamLeaders.defense.rebounds.additionalStats?.avgOffensiveRebounds || '-'}
                </div>
              </div>
            </div>
          )}

          {/* Steals Per Game */}
          {teamLeaders.defense.steals && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">抢断</div>
              {teamLeaders.defense.steals.headshot && (
                <img
                  src={teamLeaders.defense.steals.headshot}
                  alt={teamLeaders.defense.steals.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.defense.steals.id ? (
                    <Link
                      to={`/players/${teamLeaders.defense.steals.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.defense.steals.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.defense.steals.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.defense.steals.position} #{teamLeaders.defense.steals.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.defense.steals.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  MIN: {teamLeaders.defense.steals.additionalStats?.avgMinutes || '-'} | 
                  TO: {teamLeaders.defense.steals.additionalStats?.avgTurnovers || '-'}
                </div>
              </div>
            </div>
          )}

          {/* Blocks Per Game */}
          {teamLeaders.defense.blocks && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f1114] border border-[#2f3336]/30">
              <div className="text-sm font-medium text-[#71767a] w-32">盖帽</div>
              {teamLeaders.defense.blocks.headshot && (
                <img
                  src={teamLeaders.defense.blocks.headshot}
                  alt={teamLeaders.defense.blocks.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {teamLeaders.defense.blocks.id ? (
                    <Link
                      to={`/players/${teamLeaders.defense.blocks.id}`}
                      className="font-semibold text-white hover:text-[#1d9bf0] transition-colors"
                    >
                      {teamLeaders.defense.blocks.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{teamLeaders.defense.blocks.name}</span>
                  )}
                  <span className="text-xs text-[#71767a]">
                    {teamLeaders.defense.blocks.position} #{teamLeaders.defense.blocks.jersey}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{teamLeaders.defense.blocks.mainStat}</div>
                <div className="text-xs text-[#71767a] mt-1">
                  STL: {teamLeaders.defense.blocks.additionalStats?.avgSteals || '-'} | 
                  REB: {teamLeaders.defense.blocks.additionalStats?.avgRebounds || '-'}
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Statistics Table */}
      {playerStats.length > 0 && (
        <motion.div 
          className="bg-[#16181c] rounded-xl border border-[#2f3336] p-6 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">球员统计</h2>
          <div className="overflow-x-auto relative -mx-6 px-6" style={{ isolation: 'isolate' }}>
            <table className="w-full text-sm border-collapse relative">
              <thead>
                <tr className="border-b border-[#2f3336]/30">
                  <th className="text-left py-3 px-3 font-medium text-white sticky left-0 bg-[#16181c] border-r border-[#2f3336]/50 shadow-[2px_0_4px_rgba(0,0,0,0.3)]" style={{ position: 'sticky', left: 0, zIndex: 1000 }}>球员</th>
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
                {playerStats.map((player, index) => {
                  const isEven = index % 2 === 0;
                  // Debug: log first player to check data structure
                  if (index === 0) {
                    console.log('First player in table:', player);
                  }
                  return (
                  <tr
                    key={player.id || index}
                    className={`border-b border-[#2f3336]/20 transition-all duration-200 hover:bg-[#181818]/50 ${
                      isEven ? 'bg-[#0f1114]' : 'bg-[#16181c]'
                    }`}
                    onMouseEnter={(e) => {
                      const stickyCell = e.currentTarget.querySelector('td[data-sticky]');
                      if (stickyCell) {
                        stickyCell.style.backgroundColor = '#181818';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const stickyCell = e.currentTarget.querySelector('td[data-sticky]');
                      if (stickyCell) {
                        stickyCell.style.backgroundColor = isEven ? '#0f1114' : '#16181c';
                      }
                    }}
                  >
                    <td 
                      data-sticky
                      className="py-3 px-3 sticky left-0 transition-colors duration-200 border-r border-[#2f3336]/50 shadow-[2px_0_4px_rgba(0,0,0,0.3)]" 
                      style={{ position: 'sticky', left: 0, zIndex: 1000, backgroundColor: isEven ? '#0f1114' : '#16181c' }}
                    >
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
                    <td className="py-3 px-3 text-center text-white/90">{player.gamesPlayed || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.gamesStarted || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgMinutes || '-'}</td>
                    <td className="py-3 px-3 text-center font-semibold text-white">{player.avgPoints || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgOffensiveRebounds || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgDefensiveRebounds || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgRebounds || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgAssists || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgSteals || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgBlocks || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgTurnovers || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.avgFouls || '-'}</td>
                    <td className="py-3 px-3 text-center text-white/90">{player.assistTurnoverRatio || '-'}</td>
                  </tr>
                );
                })}
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

