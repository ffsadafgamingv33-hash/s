
import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionStatus, Purchase } from '../types';
import { DB } from '../db';
import { Coins, History, CreditCard, ChevronRight, CheckCircle, Clock, XCircle, Gift, ShoppingBag, User as UserIcon } from 'lucide-react';

interface ProfilePageProps {
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'billing'>('overview');
  const [redeemCode, setRedeemCode] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    setPurchases(DB.getPurchases().filter(p => p.userId === user.id).sort((a,b) => b.timestamp - a.timestamp));
  }, [user.id]);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode) return;

    const result = DB.redeem(user.id, redeemCode);
    if (result.success) {
      setFeedback({ type: 'success', message: `Successfully claimed ${result.amount} credits.` });
      setRedeemCode('');
    } else {
      setFeedback({ type: 'error', message: result.error || 'Invalid voucher.' });
    }
  };

  const btnClass = (tab: string) => `w-full flex items-center gap-6 px-10 py-6 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all ${
    activeTab === tab 
      ? 'active-sidebar-btn shadow-[0_15px_40px_rgba(60,207,220,0.15)] border-l-[8px]' 
      : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/40'
  }`;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          <button onClick={() => setActiveTab('overview')} className={btnClass('overview')}>
            <UserIcon size={24} /> Identity
          </button>
          <button onClick={() => setActiveTab('billing')} className={btnClass('billing')}>
            <Gift size={24} /> Vouchers
          </button>
          <button onClick={() => setActiveTab('history')} className={btnClass('history')}>
            <History size={24} /> Archive
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow bg-black/40 backdrop-blur-sm border border-neutral-800/60 rounded-[4rem] p-16 shadow-2xl">
          {feedback && (
            <div className={`mb-12 p-8 border rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 ${
              feedback.type === 'success' ? 'bg-[#3ccfdc]/5 border-[#3ccfdc]/30 text-[#3ccfdc]' : 'bg-red-500/5 border-red-500/30 text-red-400'
            }`}>
              <span className="text-sm font-black uppercase tracking-[0.2em]">{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="ml-auto p-3 hover:bg-white/5 rounded-full transition-all">✕</button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-16">
              <h2 className="text-5xl font-bold tracking-tighter">Identity Profile</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="bg-neutral-900/30 border border-neutral-800/60 p-12 rounded-[3rem] shadow-inner">
                  <div className="text-neutral-600 text-[10px] uppercase tracking-[0.4em] font-black mb-4">Verified Identifier</div>
                  <div className="text-xl font-bold tracking-tight text-white">{user.email}</div>
                </div>
                <div className="bg-neutral-900/30 border border-neutral-800/60 p-12 rounded-[3rem] shadow-inner">
                  <div className="text-neutral-600 text-[10px] uppercase tracking-[0.4em] font-black mb-4">Protocol Token</div>
                  <div className="text-xl font-mono tracking-tighter text-neutral-400 font-bold">{user.id}</div>
                </div>
              </div>

              <div className="p-20 border-2 border-dashed border-neutral-800/60 flex flex-col items-center justify-center text-center space-y-10 bg-black/20 rounded-[4rem] group hover:border-[#3ccfdc]/30 transition-all duration-700 shadow-lg">
                <div className="w-28 h-28 bg-[#3ccfdc]/5 text-[#3ccfdc] rounded-[2.5rem] flex items-center justify-center group-hover:shadow-[0_0_50px_rgba(60,207,220,0.2)] group-hover:bg-[#3ccfdc]/10 transition-all duration-500">
                  <Coins size={56} />
                </div>
                <div>
                  <div className="text-7xl font-black tracking-tighter group-hover:glow-text-cyan transition-all duration-700">{user.credits}</div>
                  <div className="text-neutral-600 uppercase tracking-[0.5em] text-xs mt-6 font-black">Active Credit Balance</div>
                </div>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className="primary-button px-16 py-6 text-sm font-black uppercase tracking-[0.4em] mt-8"
                >
                  Load Credits
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-16">
              <h2 className="text-5xl font-bold tracking-tighter">Voucher Center</h2>

              <div className="max-w-2xl mx-auto space-y-10 bg-neutral-900/10 p-16 rounded-[3.5rem] border border-neutral-800/40 text-center shadow-2xl">
                <div className="w-20 h-20 bg-[#3ccfdc]/5 text-[#3ccfdc] rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Gift size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-[0.5em] font-black text-neutral-400">
                    Voucher Protocol
                  </h3>
                  <p className="text-neutral-500 text-[11px] leading-relaxed uppercase font-bold tracking-[0.3em] max-w-sm mx-auto">
                    Redeem your terminal keys here for instant balance synchronization.
                  </p>
                </div>
                
                <form onSubmit={handleRedeem} className="space-y-6">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-[1.5rem] py-6 px-8 text-lg font-mono text-center tracking-widest focus:border-[#3ccfdc]/40 transition-all shadow-inner outline-none"
                  />
                  <button type="submit" className="w-full primary-button py-6 text-sm font-black uppercase tracking-[0.4em] shadow-lg">
                    Validate Key
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-12">
              <h2 className="text-5xl font-bold tracking-tighter">Acquisition Archive</h2>
              {purchases.length > 0 ? (
                <div className="space-y-10">
                  {purchases.map(p => (
                    <div key={p.id} className="p-12 bg-neutral-900/20 border border-neutral-800/60 rounded-[3.5rem] hover:border-[#3ccfdc]/40 hover:bg-neutral-900/40 transition-all duration-500 shadow-xl">
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <div className="text-[11px] text-neutral-600 uppercase tracking-[0.3em] font-black mb-3">{new Date(p.timestamp).toLocaleString()}</div>
                          <h4 className="text-3xl font-bold tracking-tight text-white">{p.itemName}</h4>
                        </div>
                        <div className="px-8 py-4 bg-neutral-900/80 rounded-full text-lg font-black border border-neutral-800 tracking-tighter shadow-inner">
                          {p.price} <span className="text-xs text-neutral-600 ml-1 font-bold">CR</span>
                        </div>
                      </div>
                      <div className="mt-10 p-10 bg-black/60 border border-neutral-800/40 rounded-[2.5rem] shadow-inner">
                        <div className="text-[10px] uppercase text-neutral-700 mb-6 font-black tracking-[0.5em]">Decrypted Payload</div>
                        <div className="font-mono text-sm text-neutral-300 break-all leading-relaxed bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/50">{p.contentDelivered}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-48 text-center border-4 border-dashed border-neutral-800/40 rounded-[4rem] bg-black/10">
                  <ShoppingBag className="mx-auto text-neutral-900 mb-10 opacity-40" size={100} strokeWidth={0.5} />
                  <p className="text-neutral-800 uppercase tracking-[0.6em] text-sm font-black">Archive Void</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
