import { motion } from 'framer-motion';

/**
 * Skeleton loader for GameCard component
 */
function GameCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 overflow-hidden"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Colored Left Border Skeleton */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2f3336]/50" />

      <div className="p-6 pl-7">
        {/* Status Badge Skeleton */}
        <div className="flex justify-end mb-5">
          <div className="h-7 w-24 bg-[#2f3336]/50 rounded-full animate-pulse" />
        </div>

        {/* Teams and Scores */}
        <div className="space-y-5">
          {/* Away Team Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Logo Skeleton */}
              <div className="flex-shrink-0 w-16 h-16 bg-[#2f3336]/50 rounded-xl animate-pulse" />
              
              {/* Team Info Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-32 bg-[#2f3336]/50 rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#2f3336]/30 rounded animate-pulse" />
              </div>
            </div>
            {/* Score Skeleton */}
            <div className="h-8 w-12 bg-[#2f3336]/50 rounded animate-pulse ml-4" />
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center py-1">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2f3336] to-transparent" />
            <span className="px-3 text-[#71767a] text-xs">VS</span>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2f3336] to-transparent" />
          </div>

          {/* Home Team Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Logo Skeleton */}
              <div className="flex-shrink-0 w-16 h-16 bg-[#2f3336]/50 rounded-xl animate-pulse" />
              
              {/* Team Info Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-32 bg-[#2f3336]/50 rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#2f3336]/30 rounded animate-pulse" />
              </div>
            </div>
            {/* Score Skeleton */}
            <div className="h-8 w-12 bg-[#2f3336]/50 rounded animate-pulse ml-4" />
          </div>
        </div>

        {/* Game Time Skeleton */}
        <div className="mt-5 pt-5 border-t border-[#2f3336]/50">
          <div className="h-4 w-24 bg-[#2f3336]/30 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export default GameCardSkeleton;

