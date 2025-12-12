import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Upload, 
  MessageSquare, 
  History, 
  Menu, 
  X, 
  LogOut,
  GraduationCap,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navigation = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Upload', page: 'UploadNotes', icon: Upload },
    { name: 'Ask', page: 'AskQuestion', icon: MessageSquare },
    { name: 'History', page: 'History', icon: History },
  ];

  const isActive = (page) => currentPageName === page;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Study Buddy</span>
          </Link>

          <div className="flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <Button
                  variant="ghost"
                  className={`rounded-xl px-4 ${
                    isActive(item.page)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="p-1.5 bg-gray-100 rounded-full">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden lg:inline">{user.email}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">AI Study Buddy</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white border-t border-gray-100"
            >
              <div className="p-4 space-y-2">
                {navigation.map((item) => (
                  <Link 
                    key={item.page} 
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                        isActive(item.page)
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navigation.map((item) => (
            <Link 
              key={item.page} 
              to={createPageUrl(item.page)}
              className="flex-1"
            >
              <div className={`flex flex-col items-center gap-1 py-2 ${
                isActive(item.page)
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}