import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SideBar } from './Sidebar';
import { TopBar } from './TopBar';

const shelllessRoutes = ['/login', '/signup'];

export const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const useShell = !shelllessRoutes.includes(location.pathname);

  if (!useShell) {
    return (
      <div className="min-h-screen app-bg">
        {children}
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg">
      <div className="pointer-events-none fixed inset-0 app-bg opacity-60" />
      <div className="relative flex min-h-screen">
        <SideBar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-80">
          <TopBar setMobileNavOpen={setMobileNavOpen} />
          <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};
