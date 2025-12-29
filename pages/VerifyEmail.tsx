
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DB } from '../db';
import { User } from '../types';

interface VerifyEmailPageProps {
  onVerified: (user: User) => void;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onVerified }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }

    // Simulate server delay
    setTimeout(() => {
      const result = DB.verifyUser(token);
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Verification failed.');
      }
    }, 1500);
  }, [location]);

  return (
    <div className="max-w-xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-black/60 backdrop-blur-xl border border-neutral-800/60 p-16 rounded-[4rem] shadow-2xl text-center space-y-12">
        
        {status === 'loading' && (
          <div className="space-y-8">
            <div className="w-20 h-20 border-4 border-[#3ccfdc]/10 border-t-[#3ccfdc] rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(60,207,220,0.1)]"></div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter uppercase">Authenticating</h2>
              <p className="text-neutral-600 text-[11px] uppercase tracking-[0.4em] font-black">Syncing identity pulse...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-10 animate-in zoom-in-95 duration-700">
            <div className="w-28 h-28 bg-[#3ccfdc]/10 text-[#3ccfdc] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(60,207,220,0.25)]">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter">Authorized</h2>
              <p className="text-neutral-500 text-xs uppercase tracking-[0.3em] leading-relaxed font-black">
                Terminal Access Granted. Identity pulse confirmed.
              </p>
            </div>
            <Link 
              to="/login" 
              className="block w-full primary-button py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              Access Terminal
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-10 animate-in shake-1 duration-500">
            <div className="w-28 h-28 bg-red-900/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(153,27,27,0.15)]">
              <XCircle size={48} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter">Null Pulse</h2>
              <p className="text-red-900 text-[11px] uppercase tracking-[0.4em] font-black leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <Link 
              to="/register" 
              className="block w-full border border-neutral-800 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-neutral-900 transition-all"
            >
              Restart Protocol
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
