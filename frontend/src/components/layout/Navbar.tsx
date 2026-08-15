import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GitFork, User, LogOut, LayoutDashboard, Settings, MapPin, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#3F6B4F] flex items-center justify-center text-white shadow-card group-hover:bg-[#345A42] transition-colors">
            <GitFork className="w-5 h-5 rotate-180" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-[#1C1917] tracking-tight">FamilyTree</span>
            <span className="block text-[10px] uppercase font-semibold text-[#78716C] tracking-widest -mt-1">Ancestry & Heritage</span>
          </div>
        </Link>

        {/* Middle Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#78716C]">
          <Link to="/about" className={`hover:text-[#3F6B4F] transition-colors ${location.pathname === '/about' ? 'text-[#3F6B4F] font-bold' : ''}`}>
            About Us
          </Link>
          <Link to="/contact" className={`hover:text-[#3F6B4F] transition-colors ${location.pathname === '/contact' ? 'text-[#3F6B4F] font-bold' : ''}`}>
            Contact
          </Link>
        </div>

        {/* User Navigation / CTA (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {user.is_admin && (
                <Link to="/admin/dashboard">
                  <Button
                    variant={location.pathname.startsWith('/admin') ? 'primary' : 'outline'}
                    size="sm"
                    className="!border-[#3F6B4F] !text-[#3F6B4F] font-bold"
                    leftIcon={<Shield className="w-4 h-4 text-[#3F6B4F]" />}
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === '/dashboard' ? 'primary' : 'ghost'}
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/map">
                <Button
                  variant={location.pathname.startsWith('/map') ? 'primary' : 'ghost'}
                  size="sm"
                  leftIcon={<MapPin className="w-4 h-4" />}
                >
                  Oila Xaritasi
                </Button>
              </Link>
              <Link to="/settings">
                <Button
                  variant={location.pathname === '/settings' ? 'primary' : 'ghost'}
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4" />}
                >
                  Settings
                </Button>
              </Link>
              <div className="h-4 w-px bg-[#E7E5E4] mx-1" />
              <div className="flex items-center gap-2 pl-1">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.first_name}
                      className="w-8 h-8 rounded-full object-cover border border-[#3F6B4F]/30 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/30 flex items-center justify-center text-[#3F6B4F] font-semibold text-xs shadow-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1C1917]">
                    {user.first_name}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 rounded-lg text-[#78716C] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && (
            <Link to="/profile" className="flex items-center gap-2 mr-1">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.first_name}
                  className="w-8 h-8 rounded-full object-cover border border-[#3F6B4F]/30 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/30 flex items-center justify-center text-[#3F6B4F] font-semibold text-xs shadow-sm">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[#1C1917] hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-[#E7E5E4] mt-3 pt-3 space-y-2 overflow-hidden"
          >
            <div className="flex flex-col gap-1 pb-2">
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-[#1C1917] hover:bg-[#3F6B4F]/10 hover:text-[#3F6B4F]"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-[#1C1917] hover:bg-[#3F6B4F]/10 hover:text-[#3F6B4F]"
              >
                Contact
              </Link>
            </div>

            {user ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E7E5E4]">
                {user.is_admin && (
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start !border-[#3F6B4F] !text-[#3F6B4F] font-bold" leftIcon={<Shield className="w-4 h-4" />}>
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={location.pathname === '/dashboard' ? 'primary' : 'ghost'} size="sm" className="w-full justify-start" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    Dashboard
                  </Button>
                </Link>
                <Link to="/map" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={location.pathname.startsWith('/map') ? 'primary' : 'ghost'} size="sm" className="w-full justify-start" leftIcon={<MapPin className="w-4 h-4" />}>
                    Oila Xaritasi
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={location.pathname === '/settings' ? 'primary' : 'ghost'} size="sm" className="w-full justify-start" leftIcon={<Settings className="w-4 h-4" />}>
                    Settings
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={location.pathname === '/profile' ? 'primary' : 'ghost'} size="sm" className="w-full justify-start" leftIcon={<User className="w-4 h-4" />}>
                    Shaxsiy Profil
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-start mt-2"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E7E5E4]">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
