import { Navbar } from './Navbar';
import { Toaster } from 'react-hot-toast';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-blue-50 transition-colors duration-300">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {children}
      </main>
      <Toaster position="top-right" toastOptions={{
        className: '!rounded-none !border !border-black !bg-white !text-black !shadow-none',
        duration: 3000
      }} />
    </div>
  );
};
