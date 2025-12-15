import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-black border-b border-[#2f3336] sticky top-0 z-50 backdrop-blur-xl bg-black/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-white hover:text-[#1d9bf0] transition-colors">
              Yo! NBA
            </Link>
            <div className="flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#16181c] text-white'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                首页
              </Link>
              <Link
                to="/games"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/games')
                    ? 'bg-[#16181c] text-white'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                今日比赛
              </Link>
              <Link
                to="/news"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/news')
                    ? 'bg-[#16181c] text-white'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                News!
              </Link>
              <Link
                to="/teams"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/teams')
                    ? 'bg-[#16181c] text-white'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                球队
              </Link>
              <Link
                to="/stats/players"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/stats/players')
                    ? 'bg-[#16181c] text-white'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                球员
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

