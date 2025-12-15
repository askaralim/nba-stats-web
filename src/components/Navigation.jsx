import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/games', label: '今日比赛' },
    { path: '/news', label: 'News!' },
    { path: '/teams', label: '球队' },
    { path: '/stats/players', label: '球员' }
  ];

  return (
    <nav className="bg-black border-b border-[#2f3336] sticky top-0 z-50 backdrop-blur-xl bg-black/80">
      <div className="container mx-auto px-4">
        {/* Logo/Title */}
        <div className="flex items-center h-14 md:h-16">
          <Link to="/" className="text-lg md:text-xl font-bold text-white hover:text-[#1d9bf0] transition-colors">
            Yo! NBA
            </Link>
        </div>
        
        {/* Horizontal Scrollable Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  active
                    ? 'bg-[#16181c] text-white shadow-sm'
                    : 'text-[#71767a] hover:text-white hover:bg-[#181818]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

