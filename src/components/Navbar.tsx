import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationsPopover } from './shared/NotificationsPopover';

type NavbarProps = {
  onLogout?: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
};

export function Navbar({ onLogout, onLoginClick, onSignUpClick }: NavbarProps) {
  const { session } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Über Uns' },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="w-full max-w-screen-2xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <img 
            src="https://iqqjvjzvzizrxbymrjoc.supabase.co/storage/v1/object/public/peakly/logo/Peakly%20Logo.png" 
            alt="Peakly" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`font-safiro hover:text-gray-600 ${
                isCurrentPath(path) ? 'text-black font-semibold' : 'text-gray-500'
              }`}
            >
              {label}
            </Link>
          ))}
          
          {session ? (
            <>
              
              <Link
                to="/profile"
                className={`flex items-center gap-2 font-safiro ${
                  isCurrentPath('/profile') ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                <User className="w-5 h-5" />
                Mein Profil
              </Link>
              <NotificationsPopover />
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-600 font-safiro"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Abmelden</span>
                
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={onLoginClick}
                className="text-black px-6 py-3 hover:underline font-safiro"
              >
                Anmelden
              </button>
              <button
                onClick={onSignUpClick}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors font-safiro"
              >
                Profil erstellen
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {session && <NotificationsPopover />}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden">
            <div className="flex flex-col p-4">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`py-3 px-4 font-safiro ${
                    isCurrentPath(path) ? 'text-black font-semibold' : 'text-gray-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              
              {session ? (
                <>
                  <Link
                    to="/profile"
                    className={`py-3 px-4 flex items-center gap-2 font-safiro ${
                      isCurrentPath('/profile') ? 'text-black font-semibold' : 'text-gray-500'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Mein Profil
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMenuOpen(false);
                    }}
                    className="py-3 px-4 flex items-center gap-2 text-gray-500 font-safiro"
                  >
                    <LogOut className="w-5 h-5" />
                    Abmelden
                  </button>
                </>
              ) : (
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => {
                      onLoginClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full py-3 text-center text-black hover:bg-gray-50 font-safiro rounded-xl"
                  >
                    Anmelden
                  </button>
                  <button
                    onClick={() => {
                      onSignUpClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full py-3 text-center bg-black text-white hover:bg-gray-900 font-safiro rounded-xl"
                  >
                    Profil erstellen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}