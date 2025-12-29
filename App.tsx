
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, ShoppingBag, Shield, LogOut, Ticket, User as UserIcon, Coins, Menu, X, Mail } from 'lucide-react';
import { User, UserRole } from './types';
import { DB } from './db';

// Pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ItemsPage from './pages/Items';
import AdminPage from './pages/Admin';
import TicketsPage from './pages/Tickets';
import ProfilePage from './pages/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ebon_shop_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ebon_shop_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ebon_shop_user');
  };

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        // We'll need a profile endpoint to sync credits reliably
        // For now, we'll assume the user object is updated by local actions
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Router>
      <Layout user={user} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Navigate to="/items" replace />} />
          <Route path="/login" element={!user ? <LoginPage onLogin={login} /> : <Navigate to="/items" replace />} />
          <Route path="/register" element={!user ? <RegisterPage onLogin={login} /> : <Navigate to="/items" replace />} />
          <Route path="/items" element={user ? <ItemsPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/tickets" element={user ? <TicketsPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/admin/*" element={user?.role === UserRole.ADMIN ? <AdminPage user={user} /> : <Navigate to="/items" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/items' && location.pathname.startsWith(path));
    return `nav-link px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 rounded-full ${
      isActive ? 'text-white bg-[#3ccfdc]/15 shadow-[0_0_20px_rgba(60,207,220,0.1)]' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
    }`;
  };

  return (
    <div className="relative min-h-screen flex flex-col text-neutral-100 selection:bg-[#3ccfdc]/30 selection:text-white">
      {/* Background Video */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-60"
        >
          <source src="https://motionbgs.com/media/8870/echoes-of-a-forgotten-soul.960x540.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 video-overlay" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold tracking-tighter flex items-center space-x-4 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden group-hover:shadow-[0_0_20px_rgba(60,207,220,0.4)] border border-neutral-800 bg-black">
                  <img 
                    src="https://i.pinimg.com/736x/b2/f8/8d/b2f88dff1f2fb354e0aff9412fe18c41.jpg" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="group-hover:text-white transition-colors tracking-[0.2em] text-xl font-black">EBON SHOP</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Link to="/items" className={getNavLinkClass('/items')}>
                    <ShoppingBag size={18} /> Shop
                  </Link>
                  <Link to="/tickets" className={getNavLinkClass('/tickets')}>
                    <Ticket size={18} /> Support
                  </Link>
                  {user.role === UserRole.ADMIN && (
                    <Link to="/admin" className={getNavLinkClass('/admin')}>
                      <Shield size={18} /> Admin
                    </Link>
                  )}
                  <div className="flex items-center space-x-6 ml-6 border-l border-neutral-800 pl-8">
                    <Link to="/profile" className="flex items-center space-x-4 group bg-neutral-900/40 px-6 py-3 rounded-full border border-neutral-800 hover:border-[#3ccfdc]/30 transition-all">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors uppercase tracking-widest">{user.email.split('@')[0]}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#3ccfdc]/90 group-hover:text-[#3ccfdc] transition-colors font-black tracking-widest">
                          <Coins size={12} />
                          <span>{user.credits} CR</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-[#3ccfdc]/50 group-hover:shadow-[0_0_15px_rgba(60,207,220,0.2)] transition-all overflow-hidden">
                        <UserIcon size={20} className="text-neutral-400 group-hover:text-white" />
                      </div>
                    </Link>
                    <button onClick={onLogout} className="p-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all">
                      <LogOut size={22} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="px-8 py-4 text-sm font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-white transition-colors">Login</Link>
                  <Link to="/register" className="primary-button px-10 py-4 text-sm font-black uppercase tracking-[0.3em]">Join Terminal</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-neutral-400 p-3 hover:bg-neutral-800 rounded-full transition-all">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-neutral-800 p-8 space-y-6 animate-in slide-in-from-top-4 duration-500 rounded-b-[2.5rem]">
            {user ? (
              <>
                <Link to="/items" onClick={toggleMenu} className="block py-5 px-6 rounded-2xl text-lg font-bold tracking-widest text-neutral-300 hover:text-[#3ccfdc] hover:bg-neutral-900">Shop</Link>
                <Link to="/tickets" onClick={toggleMenu} className="block py-5 px-6 rounded-2xl text-lg font-bold tracking-widest text-neutral-300 hover:text-[#3ccfdc] hover:bg-neutral-900">Support</Link>
                {user.role === UserRole.ADMIN && (
                  <Link to="/admin" onClick={toggleMenu} className="block py-5 px-6 rounded-2xl text-lg font-black tracking-widest text-[#3ccfdc] hover:bg-[#3ccfdc]/5">Admin Panel</Link>
                )}
                <div className="pt-6 border-t border-neutral-800 space-y-3">
                  <Link to="/profile" onClick={toggleMenu} className="block py-5 px-6 rounded-2xl text-lg font-bold tracking-widest text-[#3ccfdc]">Profile ({user.credits} Credits)</Link>
                  <button onClick={() => { onLogout(); toggleMenu(); }} className="block w-full text-left py-5 px-6 rounded-2xl text-lg font-bold tracking-widest text-red-500 hover:bg-red-500/5">Sign Out</button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <Link to="/login" onClick={toggleMenu} className="block py-6 text-center text-lg font-bold tracking-widest text-neutral-300">Sign In</Link>
                <Link to="/register" onClick={toggleMenu} className="block py-6 primary-button text-center text-lg font-black tracking-widest">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {children}
      </main>

      <footer className="border-t border-neutral-800/40 bg-black/60 py-16 text-neutral-500 text-xs text-center tracking-widest rounded-t-[3rem] mt-16">
        <p className="uppercase font-black">&copy; {new Date().getFullYear()} Ebon Shop &bull; Secure Digital Environment</p>
        <div className="mt-8 flex justify-center space-x-12 font-bold uppercase">
          <a href="#" className="hover:text-[#3ccfdc] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#3ccfdc] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#3ccfdc] transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
