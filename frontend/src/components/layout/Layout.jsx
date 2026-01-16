import { Navbar } from './Navbar';
import { Toaster } from 'react-hot-toast';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <Toaster position="top-right" />
    </div>
  );
};
