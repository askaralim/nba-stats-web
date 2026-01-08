import { useState, useEffect, useRef } from 'react';
import { apiGet, getErrorMessage } from '../utils/api';

/**
 * Format timestamp to human-friendly format
 * @param {string} iso - ISO date string
 * @returns {string} Human-friendly date string
 */
const formatDate = (iso) => {
  if (!iso) return '';
  
  const date = new Date(iso);
  const now = new Date();
  const diff = now - date; // milliseconds
  
  // Less than 1 minute ago
  if (diff < 60000) {
    return '刚刚';
  }
  
  // Less than 1 hour ago - show minutes
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // Less than 24 hours ago - show hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `昨天 ${hours}:${minutes}`;
  }
  
  // Less than 7 days ago - show days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }
  
  // Older than a week - show full date
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

function News() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false); // Prevent concurrent requests (React StrictMode)

  useEffect(() => {
    // Prevent double requests in development (React StrictMode)
    if (fetchingRef.current) {
      return;
    }

    const fetchNews = async () => {
      if (fetchingRef.current) {
        return; // Already fetching
      }
      
      fetchingRef.current = true;
      
      try {
        setError(null);
        setLoading(true);
        
        console.log('Fetching news from API...');
        const data = await apiGet('/api/nba/news');
        console.log(`Received ${data.tweets?.length || 0} tweets`);
        setTweets(data.tweets || []);
      } catch (err) {
        setError(getErrorMessage(err) || '加载新闻失败');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchNews();
    
    // Cleanup function
    return () => {
      fetchingRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0] mb-4"></div>
          <p className="text-[#71767a]">加载新闻中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">加载失败</p>
        <p className="text-[#71767a] text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-3xl font-bold text-white mb-2">NBA News!</h1>
        <p className="text-[#71767a]">
          来自 <span className="font-semibold text-white">@ShamsCharania</span> 的最新推文
        </p>
      </div>

      {tweets.length === 0 ? (
        <div className="bg-[#16181c] rounded-xl border border-[#2f3336] p-12 text-center">
          <p className="text-white text-lg mb-2">暂无新闻</p>
          <p className="text-[#71767a] text-sm">
            Twitter/X 可能阻止了数据抓取。请稍后再试。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="group relative bg-[#16181c]/80 backdrop-blur-xl rounded-2xl border border-[#2f3336]/50 p-6 transition-all duration-300 hover:bg-[#16181c]/90 hover:border-[#2f3336] hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30 cursor-pointer"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-start space-x-4">
                {/* Avatar with subtle shadow */}
                <div className="flex-shrink-0 relative">
                  {tweet.avatar ? (
                    <div className="relative">
                      <img
                        src={tweet.avatar}
                        alt={tweet.author}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#2f3336]/50 transition-all duration-300 group-hover:border-[#2f3336]"
                        style={{
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.nextElementSibling;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div 
                    className={`w-14 h-14 bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] rounded-full flex items-center justify-center ${tweet.avatar ? 'absolute top-0 left-0' : ''} transition-all duration-300 group-hover:scale-105`}
                    style={{ 
                      display: tweet.avatar ? 'none' : 'flex',
                      boxShadow: '0 4px 12px rgba(29, 155, 240, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <span className="text-white font-bold text-xl">
                      {tweet.authorHandle.charAt(1)}
                    </span>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="flex-1 min-w-0">
                  {/* Author Info */}
                  <div className="flex items-baseline space-x-2 mb-2">
                    <h3 className="font-bold text-white text-base leading-tight hover:underline">
                      {tweet.author}
                    </h3>
                    <span className="text-[#71767a] text-sm leading-tight">
                      {tweet.authorHandle}
                    </span>
                    {tweet.timestamp && (
                      <span className="text-[#71767a] text-sm leading-tight">
                        · {formatDate(tweet.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Tweet Text */}
                  <p className="text-white whitespace-pre-wrap break-words mb-4 leading-[1.6] text-[15px]">
                    {tweet.text}
                  </p>

                  {/* Media */}
                  {tweet.images && tweet.images.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {tweet.images.map((imageUrl, imgIndex) => {
                        const fullSizeUrl = tweet.imageLinks && tweet.imageLinks[imgIndex] 
                          ? tweet.imageLinks[imgIndex] 
                          : imageUrl;
                        
                        return (
                          <div 
                            key={imgIndex} 
                            className="rounded-xl overflow-hidden border border-[#2f3336]/50 max-w-xl transition-all duration-300 hover:border-[#2f3336] hover:shadow-lg"
                            style={{
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}
                          >
                            <a
                              href={fullSizeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={imageUrl}
                                alt={`Tweet image ${imgIndex + 1}`}
                                className="w-full h-auto object-contain hover:opacity-95 transition-opacity cursor-pointer"
                                style={{ maxHeight: '500px', width: 'auto', margin: '0 auto', display: 'block' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer with View on X link */}
                  {/* <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#2f3336]/50">
                    {tweet.link && (
                      <a
                        href={tweet.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-[#71767a] hover:text-[#1d9bf0] text-sm font-medium transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View on X</span>
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                          />
                        </svg>
                      </a>
                    )}
                    {!tweet.link && tweet.timestamp && (
                      <p className="text-[#71767a] text-xs">
                        {formatDate(tweet.timestamp)}
                      </p>
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;

