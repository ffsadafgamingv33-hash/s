
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { DB } from '../db';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setStatus('loading');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
        setStatus('idle');
      } else {
        onLogin(data);
        navigate('/items');
      }
    })
    .catch(err => {
      setError('Authentication failed. Please try again.');
      setStatus('idle');
    });
  };

  return (
    <div className="max-w-md mx-auto mt-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-black/60 backdrop-blur-xl border border-neutral-800/60 p-12 rounded-[3.5rem] shadow-2xl">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-neutral-800 overflow-hidden">
             <img 
               src="https://i.pinimg.com/736x/b2/f8/8d/b2f88dff1f2fb354e0aff9412fe18c41.jpg" 
               alt="Logo" 
               className="w-full h-full object-cover"
             />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Login</h1>
          <p className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-black">Access terminal</p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-500/5 border border-red-500/30 text-red-500 text-xs flex items-center gap-3 rounded-2xl animate-in shake-1">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-black ml-6">Identifier</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#3ccfdc] transition-colors" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl py-5 pl-14 pr-6 text-sm transition-all focus:border-[#3ccfdc]/40 outline-none"
                placeholder="identity@ebon.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-black ml-6">Protocol</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#3ccfdc] transition-colors" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl py-5 pl-14 pr-6 text-sm transition-all focus:border-[#3ccfdc]/40 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full primary-button font-black py-5 rounded-full flex items-center justify-center gap-4 uppercase text-sm tracking-[0.4em] mt-10 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(60,207,220,0.2)]"
          >
            {status === 'loading' ? (
              <div className="w-6 h-6 border-3 border-[#3ccfdc] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                Authenticate
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center text-[11px] tracking-[0.2em] font-bold">
          <span className="text-neutral-600 uppercase">New identity? </span>
          <Link to="/register" className="text-white hover:text-[#3ccfdc] transition-colors uppercase decoration-neutral-800 underline underline-offset-8">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
