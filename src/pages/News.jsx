import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function News() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/nba/news`);
        if (!response.ok) {
          throw new Error('加载新闻失败');
        }
        const data = await response.json();
        setTweets(data.tweets || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载新闻中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">加载失败</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NBA 新闻</h1>
        <p className="text-gray-600">
          来自 <span className="font-semibold">@ShamsCharania</span> 的最新推文
        </p>
      </div>

      {tweets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg mb-2">暂无新闻</p>
          <p className="text-gray-500 text-sm">
            Twitter/X 可能阻止了数据抓取。请稍后再试。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {tweet.authorHandle.charAt(1)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-gray-900">{tweet.author}</h3>
                    <span className="text-gray-500 text-sm">{tweet.authorHandle}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap break-words mb-3">
                    {tweet.text}
                  </p>
                  {tweet.images && tweet.images.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {tweet.images.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imageUrl}
                            alt={`Tweet image ${imgIndex + 1}`}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    {tweet.timestamp && (
                      <p className="text-gray-500 text-xs">
                        {new Date(tweet.timestamp).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    {tweet.link && (
                      <a
                        href={tweet.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        查看原文 →
                      </a>
                    )}
                  </div>
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

