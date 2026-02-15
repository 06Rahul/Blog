import { SideBar } from './SideBar';
import { TopBar } from './TopBar';
import { Toaster } from 'react-hot-toast';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Fixed Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <TopBar />

        {/* Scrollable Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" toastOptions={{
        className: 'dark:bg-gray-800 dark:text-white',
        duration: 3000
      }} />
    </div>
  );
};
