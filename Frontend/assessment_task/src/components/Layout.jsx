import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Hammer, ClipboardList, Rocket, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/builder', label: 'Builder', icon: Hammer, testId: 'nav-builder' },
  {
    to: '/assessments',
    label: 'Assessments',
    icon: ClipboardList,
    testId: 'nav-assessments',
  },
  {
    to: '/launchpad',
    label: 'Launch Pad',
    icon: Rocket,
    testId: 'nav-launchpad',
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: BarChart3,
    testId: 'nav-reports',
  },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-paper'>
      <header className='sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-subtle'>
        <div className='max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-6'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-accent rounded-sm flex items-center justify-center font-head font-extrabold text-white text-lg'>
              A
            </div>

            <div>
              <div className='font-head font-extrabold text-ink leading-none text-lg'>
                ASSESSO
              </div>
              <div className='font-mono text-[10px] text-muted tracking-widest'>
                ASSESSMENT.OS
              </div>
            </div>
          </div>

          <nav className='hidden md:flex items-center gap-1'>
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={n.testId}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-sm font-head font-bold text-sm uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-muted hover:text-ink hover:bg-subtle/50'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            <div className='text-right hidden sm:block'>
              <div
                className='font-head font-bold text-sm text-ink leading-tight'
                data-testid='current-user-name'
              >
                {user?.name}
              </div>

              <div className='font-mono text-[10px] text-muted'>
                {user?.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className='btn-secondary !px-4 !py-2 text-xs flex items-center gap-2'
              data-testid='logout-btn'
            >
              <LogOut size={14} />
              <span className='hidden sm:inline'>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className='md:hidden border-t border-subtle bg-paper/95 px-4 py-2 flex gap-1 overflow-x-auto'>
          {navItems.map((n) => {
            const Icon = n.icon;

            return (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`${n.testId}-mobile`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-sm font-head font-bold text-xs uppercase whitespace-nowrap ${
                    isActive ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`
                }
              >
                <Icon size={14} />
                {n.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className='max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-12'>
        <Outlet />
      </main>

      <footer className='border-t border-subtle py-6 mt-12'>
        <div className='max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center text-xs font-mono text-muted'>
          <span>ASSESSO / v1.0</span>
          <span>© {new Date().getFullYear()} — Built for evaluation</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
