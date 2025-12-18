import { motion } from 'framer-motion';

/**
 * Skeleton loader for Team Standings table
 */
function TeamStandingsSkeleton({ count = 15 }) {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-4">
        <div className="h-7 w-48 bg-blue-500/50 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#16181c] border border-[#2f3336] rounded-b-xl overflow-hidden">
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
              {Array.from({ length: count }).map((_, index) => (
                <motion.tr
                  key={index}
                  className={`border-b border-[#2f3336]/20 ${
                    index % 2 === 0 ? 'bg-[#16181c]/30' : 'bg-[#16181c]/10'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  {/* Rank Skeleton */}
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 bg-[#2f3336]/50 rounded-full animate-pulse" />
                  </td>

                  {/* Team Skeleton */}
                  <td className="py-3 px-4 sticky left-0 z-10 bg-inherit">
                    <div className="flex items-center space-x-3">
                      {/* Logo Skeleton */}
                      <div className="w-10 h-10 bg-[#2f3336]/50 rounded-full animate-pulse flex-shrink-0" />
                      
                      {/* Team Name Skeleton */}
                      <div className="space-y-1.5">
                        <div className="h-4 w-24 bg-[#2f3336]/50 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-[#2f3336]/30 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>

                  {/* Wins Skeleton */}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-8 bg-[#2f3336]/50 rounded mx-auto animate-pulse" />
                  </td>

                  {/* Losses Skeleton */}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-8 bg-[#2f3336]/50 rounded mx-auto animate-pulse" />
                  </td>

                  {/* Win Percent Skeleton */}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-[#2f3336]/50 rounded mx-auto animate-pulse" />
                  </td>

                  {/* Games Behind Skeleton */}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-8 bg-[#2f3336]/50 rounded mx-auto animate-pulse" />
                  </td>

                  {/* Streak Skeleton */}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-10 bg-[#2f3336]/50 rounded mx-auto animate-pulse" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeamStandingsSkeleton;

