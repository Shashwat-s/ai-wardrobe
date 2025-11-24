import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Upload, Shirt, LayoutDashboard, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/upload-profile', icon: User, label: 'Profile' },
    { path: '/upload-wardrobe', icon: Upload, label: 'Upload' },
    { path: '/try-wardrobe', icon: Shirt, label: 'Try On' },
    { path: '/saved-outfits', icon: LayoutDashboard, label: 'Outfits' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">AI Wardrobe</span>
            </Link>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <div className="text-sm text-gray-600">
                    {currentUser.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full touch-feedback ${
                isActive(item.path)
                  ? 'text-primary-600'
                  : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-red-500 touch-feedback"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
