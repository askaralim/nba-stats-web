import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from '../components/GameCard';
import GameCardSkeleton from '../components/GameCardSkeleton';
import GameStatsSummary from '../components/GameStatsSummary';
import { API_BASE_URL, USE_MOCK_DATA } from '../config';
import { getMockGames } from '../utils/mockGameData';

function GamesToday() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current date in Chinese timezone
  const getChineseDate = () => {
    const now = new Date();
    // Get date string in Chinese timezone (YYYY-MM-DD)
    const chineseDateStr = now.toLocaleString('en-CA', { timeZone: 'Asia/Shanghai' }).split(',')[0];
    // Parse the date string to create a date object
    const [year, month, day] = chineseDateStr.split('-').map(Number);
    // Create date at midnight in local timezone (represents the Chinese calendar date)
    return new Date(year, month - 1, day);
  };
  
  const [selectedDate, setSelectedDate] = useState(() => getChineseDate());

  // Generate date range for navigation (7 days: 3 before, today, 3 after)
  const generateDateRange = (centerDate) => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const [dateRange, setDateRange] = useState(() => generateDateRange(getChineseDate()));

  // Format date for API (YYYYMMDD) - ESPN API expects date in US Eastern timezone
  // Convert Chinese date to US Eastern timezone date for API call
  const formatDateForAPI = (chineseDate) => {
    // Get the date components from Chinese date
    const year = chineseDate.getFullYear();
    const month = chineseDate.getMonth() + 1;
    const day = chineseDate.getDate();
    
    // Create a date string in Chinese timezone format
    const chineseDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Create a date object at midnight Chinese time (UTC+8)
    // We represent this as a UTC date by subtracting 8 hours
    const chineseMidnight = new Date(`${chineseDateStr}T00:00:00+08:00`);
    
    // Convert to US Eastern timezone
    const usEasternDateStr = chineseMidnight.toLocaleString('en-CA', { 
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Convert to YYYYMMDD format
    const [usYear, usMonth, usDay] = usEasternDateStr.split('-');
    return `${usYear}${String(usMonth).padStart(2, '0')}${String(usDay).padStart(2, '0')}`;
  };

  // Format date for display in Chinese format (yyyy-mm-dd 星期X)
  const formatDateForDisplay = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleString('zh-CN', { weekday: 'long' });
    return `${year}-${month}-${day} ${weekday}`;
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const fetchGames = useCallback(async (targetDate = null, isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) {
        setLoading(true);
      }
      const dateToFetch = targetDate || selectedDate;
      const dateParam = formatDateForAPI(dateToFetch);
      
      let data;
      if (USE_MOCK_DATA) {
        // Use mock data for local testing
        data = await getMockGames(dateParam);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/nba/games/today?date=${dateParam}`);
        if (!response.ok) {
          throw new Error('加载比赛失败');
        }
        data = await response.json();
      }
      const newGames = data.games || [];
      
      // Helper functions for game categorization
      const isOvertimeGame = (game) => {
        return game.period > 4 || 
               (game.gameStatusText && (
                 game.gameStatusText.toLowerCase().includes('ot') ||
                 game.gameStatusText.toLowerCase().includes('overtime')
               ));
      };

      const getScoreDifference = (game) => {
        if (game.gameStatus !== 3) return null; // Only for completed games
        if (game.awayTeam?.score === null || game.homeTeam?.score === null) return null;
        return Math.abs(game.awayTeam.score - game.homeTeam.score);
      };

      const isClosestGame = (game) => {
        const scoreDiff = getScoreDifference(game);
        return scoreDiff !== null && scoreDiff <= 5;
      };

      // Sort games: Live → Closest → OT → Scheduled → Regular Finished
      const sortGamesByStatus = (gamesList) => {
        return [...gamesList].sort((a, b) => {
          // Priority 1: Live games (status 2)
          if (a.gameStatus === 2 && b.gameStatus !== 2) return -1;
          if (a.gameStatus !== 2 && b.gameStatus === 2) return 1;
          
          // Priority 2: Closest games (finished with score diff <= 5)
          const aIsClosest = isClosestGame(a);
          const bIsClosest = isClosestGame(b);
          if (aIsClosest && !bIsClosest) return -1;
          if (!aIsClosest && bIsClosest) return 1;
          
          // Priority 3: OT games (finished with OT)
          const aIsOT = isOvertimeGame(a);
          const bIsOT = isOvertimeGame(b);
          if (aIsOT && !bIsOT) return -1;
          if (!aIsOT && bIsOT) return 1;
          
          // Priority 4: Scheduled games (status 1) come before regular finished
          if (a.gameStatus === 1 && b.gameStatus === 3) return -1;
          if (a.gameStatus === 3 && b.gameStatus === 1) return 1;
          
          // Within same priority, maintain original order
          return 0;
        });
      };
      
      const sortedNewGames = sortGamesByStatus(newGames);
      
      // If refreshing, merge updates to prevent unnecessary re-renders
      if (isRefresh && games.length > 0) {
        setGames(prevGames => {
          // Create a map of existing games by gameId
          const gamesMap = new Map(prevGames.map(g => [g.gameId, g]));
          
          // Update only changed games
          sortedNewGames.forEach(newGame => {
            const existingGame = gamesMap.get(newGame.gameId);
            if (existingGame) {
              // Only update if data actually changed
              if (JSON.stringify(existingGame) !== JSON.stringify(newGame)) {
                gamesMap.set(newGame.gameId, newGame);
              }
            } else {
              gamesMap.set(newGame.gameId, newGame);
            }
          });
          
          // Sort the merged games
          return sortGamesByStatus(Array.from(gamesMap.values()));
        });
      } else {
        setGames(sortedNewGames);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [selectedDate, games.length]);

  useEffect(() => {
    fetchGames();
  }, [selectedDate, fetchGames]);

  useEffect(() => {
    // Auto-refresh every 2 seconds if there are live games
    const hasLiveGames = games.some(game => game.gameStatus === 2);
    if (!hasLiveGames) return;

    const interval = setInterval(() => {
      fetchGames(null, true); // Pass isRefresh=true to prevent full reload
    }, 2000);

    return () => clearInterval(interval);
  }, [games, fetchGames]);

  const handleDateSelect = (newDate) => {
    setSelectedDate(newDate);
    // Update date range to center around selected date
    setDateRange(generateDateRange(newDate));
  };

  const handlePreviousDates = () => {
    const newCenter = new Date(dateRange[0]);
    newCenter.setDate(newCenter.getDate() - 1);
    setDateRange(generateDateRange(newCenter));
  };

  const handleNextDates = () => {
    const newCenter = new Date(dateRange[dateRange.length - 1]);
    newCenter.setDate(newCenter.getDate() + 1);
    setDateRange(generateDateRange(newCenter));
  };

  const handleTodayClick = () => {
    const today = getChineseDate();
    setSelectedDate(today);
    setDateRange(generateDateRange(today));
  };

  // Show skeleton loaders on initial load
  if (loading && games.length === 0) {
    return (
      <div>
        {/* Date Navigator Skeleton */}
        <div className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-4 mb-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            {/* Previous button skeleton */}
            <div className="flex-shrink-0 w-10 h-10 bg-[#2f3336]/50 rounded-full animate-pulse" />
            
            {/* Date pills skeleton */}
            <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-hide">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-10 w-32 bg-[#2f3336]/30 rounded-full flex-shrink-0 animate-pulse" />
              ))}
            </div>
            
            {/* Next and Today buttons skeleton */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-[#2f3336]/50 rounded-full animate-pulse" />
              <div className="w-10 h-10 bg-[#2f3336]/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Selected Date Display Skeleton */}
        <div className="mb-6">
          <div className="h-6 w-48 bg-[#2f3336]/30 rounded animate-pulse" />
        </div>

        {/* Game Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载比赛失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchGames()}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Date Navigator */}
      <div className="bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-4 mb-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePreviousDates}
            disabled={loading}
            className="flex-shrink-0 p-2.5 text-[#1d9bf0] hover:bg-[#181818]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-wait hover:scale-105 active:scale-95"
            aria-label="Previous dates"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable Date Pills */}
          <div 
            className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {dateRange.map((dateItem, index) => {
              const isSelected = isSameDay(dateItem, selectedDate);
              const isToday = isSameDay(dateItem, getChineseDate());
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dateItem)}
                  disabled={loading}
                  className={`group relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    loading && isSelected
                      ? 'bg-[#1d9bf0]/50 text-white font-bold opacity-75 cursor-wait'
                      : isSelected
                      ? 'bg-[#1d9bf0] text-white font-bold shadow-lg shadow-[#1d9bf0]/30'
                      : isToday
                      ? 'bg-[#181818]/60 text-white font-semibold hover:bg-[#181818] hover:text-white hover:shadow-md'
                      : 'bg-[#181818]/30 text-[#71767a] hover:bg-[#181818]/60 hover:text-white'
                  } ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                  style={{
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(29, 155, 240, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.15)',
                    transform: 'translateZ(0)' // Enable hardware acceleration
                  }}
                >
                  {/* Bottom Indicator Bar for Selected Date */}
                  {isSelected && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '2rem' }}
                      transition={{ duration: 0.3 }}
                      style={{
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                      }}
                    />
                  )}
                  
                  <span className={`relative flex items-center gap-2 transition-all duration-200 ${
                    isSelected ? '' : 'group-hover:brightness-110'
                  }`}>
                    {formatDateForDisplay(dateItem)}
                    {loading && isSelected && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleNextDates}
              disabled={loading}
              className="p-2.5 text-[#1d9bf0] hover:bg-[#181818]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-wait hover:scale-105 active:scale-95"
              aria-label="Next dates"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleTodayClick}
              disabled={loading}
              className="p-2.5 text-[#71767a] hover:bg-[#181818]/50 hover:text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-wait hover:scale-105 active:scale-95"
              aria-label="Today"
              title="今天"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">NBA比赛</h1>
        {selectedDate && (
          <p className="text-[#71767a]">
            {formatDateForDisplay(selectedDate)}
          </p>
        )}
      </div>

      {/* Game Statistics Summary */}
      {!loading && games.length > 0 && (
        <GameStatsSummary games={games} />
      )}

      {games.length === 0 && !loading ? (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-12 text-center">
          <p className="text-white text-lg">
            {isSameDay(selectedDate, getChineseDate()) ? '今日暂无比赛' : '该日期暂无比赛'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {loading && games.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d9bf0] mb-2"></div>
                <p className="text-[#71767a] text-sm">加载中...</p>
              </div>
            </div>
          )}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${loading && games.length > 0 ? 'opacity-50' : 'opacity-100'}`}>
          {games.map((game) => (
            <GameCard key={game.gameId} game={game} />
          ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => fetchGames()}
          disabled={loading}
          className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          刷新
        </button>
      </div>
    </div>
  );
}

export default GamesToday;
