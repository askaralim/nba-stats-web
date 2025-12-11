import { useState, useEffect, useCallback } from 'react';
import GameCard from '../components/GameCard';
import { API_BASE_URL } from '../config';

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
  const [date, setDate] = useState('');

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

  const fetchGames = useCallback(async (targetDate = null) => {
    try {
      setError(null);
      setLoading(true);
      const dateToFetch = targetDate || selectedDate;
      const dateParam = formatDateForAPI(dateToFetch);
      
      const response = await fetch(`${API_BASE_URL}/api/nba/games/today?date=${dateParam}`);
      if (!response.ok) {
        throw new Error('加载比赛失败');
      }
      const data = await response.json();
      setGames(data.games || []);
      setDate(data.date || dateParam);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchGames();
  }, [selectedDate]);

  useEffect(() => {
    // Auto-refresh every 2 seconds if there are live games
    const hasLiveGames = games.some(game => game.gameStatus === 2);
    if (!hasLiveGames) return;

    const interval = setInterval(() => {
      fetchGames();
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

  if (loading && games.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载比赛中...</p>
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载比赛失败</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchGames()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Date Navigator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousDates}
            disabled={loading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
            aria-label="Previous dates"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-2 overflow-x-auto flex-1 mx-4 scrollbar-hide">
            {dateRange.map((dateItem, index) => {
              const isSelected = isSameDay(dateItem, selectedDate);
              const isToday = isSameDay(dateItem, getChineseDate());
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dateItem)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    loading && isSelected
                      ? 'bg-gray-700 text-white font-bold opacity-75 cursor-wait'
                      : isSelected
                      ? 'bg-gray-900 text-white font-bold'
                      : isToday
                      ? 'bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${loading ? 'cursor-wait' : ''}`}
                >
                  <span className="flex items-center gap-2">
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

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNextDates}
              disabled={loading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Next dates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleTodayClick}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Today"
              title="今天"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NBA比赛</h1>
        {selectedDate && (
          <p className="text-gray-600">
            {formatDateForDisplay(selectedDate)}
          </p>
        )}
      </div>

      {games.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">
            {isSameDay(selectedDate, getChineseDate()) ? '今日暂无比赛' : '该日期暂无比赛'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {loading && games.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-gray-600 text-sm">加载中...</p>
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
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
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
