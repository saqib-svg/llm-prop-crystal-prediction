import { Outlet, Link, useLocation } from 'react-router';
import { Atom } from 'lucide-react';
import { SettingsMenu } from './SettingsMenu';
import { Button } from './ui/button';

export function Layout() {
  const location = useLocation();
  const isMainPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Atom className="size-6 text-white" />
              </div>
              <span className="font-semibold text-lg">Crystal Band Gap Predictor</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/">
                <Button
                  variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  Predict
                </Button>
              </Link>
              <Link
                to="/about"
                aria-disabled={isMainPage}
                onClick={isMainPage ? (event) => event.preventDefault() : undefined}
                tabIndex={isMainPage ? -1 : undefined}
              >
                <Button
                  variant={location.pathname === '/about' ? 'secondary' : 'ghost'}
                  size="sm"
                  disabled={isMainPage}
                >
                  About
                </Button>
              </Link>
              <Link to="/batch">
                <Button
                  variant={location.pathname === '/batch' ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  Batch
                </Button>
              </Link>
              <div className="ml-2">
                <SettingsMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet />
    </div>
  );
}
