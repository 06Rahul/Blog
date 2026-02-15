import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, Users, FileEdit, MessageSquare, Terminal, LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export const SideBar = () => {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Compass, label: 'Explore', path: '/search' },
        { icon: Users, label: 'Communities', path: '/communities' },
        { icon: FileEdit, label: 'Drafts', path: '/dashboard' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
    ];

    const isActive = (path) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="w-64 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-50 border-r border-gray-800">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-xl">B</span>
                </div>
                <span className="font-bold text-xl tracking-tight">BlogPlatform</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                ))}

                {/* Divider */}
                <div className="my-6 border-t border-gray-800 mx-4"></div>

                {/* Secondary Items */}
                <Link
                    to="/playground"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                >
                    <Terminal className="w-5 h-5" />
                    <span className="font-medium text-sm">Code Playground</span>
                </Link>

                {user && (
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium text-sm">Dashboard</span>
                    </Link>
                )}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 bg-[#0F172A] border-t border-gray-800">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full mb-3 flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {user ? (
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                        <span className="font-bold text-sm">Login</span>
                    </Link>
                )}
            </div>
        </aside>
    );
};
