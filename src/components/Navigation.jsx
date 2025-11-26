import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              NBA数据
            </Link>
            <div className="flex space-x-1">
              <Link
                to="/games"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/games') || location.pathname === '/'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                今日比赛
              </Link>
              <Link
                to="/players"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/players')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                球员列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

