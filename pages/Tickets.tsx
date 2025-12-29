
import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, TicketStatus, UserRole, TicketMessage } from '../types';
import { DB } from '../db';
import { MessageSquare, Send, CheckCircle, Clock, Plus, ChevronLeft, Shield } from 'lucide-react';

interface TicketsPageProps {
  user: User;
}

const TicketsPage: React.FC<TicketsPageProps> = ({ user }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [reply, setReply] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshTickets();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTicket]);

  const refreshTickets = () => {
    const all = DB.getTickets();
    if (user.role === UserRole.ADMIN) {
      setTickets(all.sort((a,b) => b.lastUpdated - a.lastUpdated));
    } else {
      setTickets(all.filter(t => t.userId === user.id).sort((a,b) => b.lastUpdated - a.lastUpdated));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;

    const ticket: Ticket = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      userEmail: user.email,
      subject: newSubject,
      status: TicketStatus.OPEN,
      lastUpdated: Date.now(),
      messages: [{
        id: Math.random().toString(36).substring(7),
        senderId: user.id,
        senderEmail: user.email,
        text: newMessage,
        timestamp: Date.now()
      }]
    };

    DB.createTicket(ticket);
    setIsCreating(false);
    setNewSubject('');
    setNewMessage('');
    refreshTickets();
    setActiveTicket(ticket);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply || !activeTicket) return;

    const msg: TicketMessage = {
      id: Math.random().toString(36).substring(7),
      senderId: user.id,
      senderEmail: user.email,
      text: reply,
      timestamp: Date.now()
    };

    DB.addTicketMessage(activeTicket.id, msg);
    setReply('');
    refreshTickets();
    const updated = DB.getTickets().find(t => t.id === activeTicket.id);
    if (updated) setActiveTicket(updated);
  };

  const handleClose = (id: string) => {
    DB.closeTicket(id);
    refreshTickets();
    const updated = DB.getTickets().find(t => t.id === id);
    if (updated) setActiveTicket(updated);
  };

  return (
    <div className="max-w-6xl mx-auto h-[800px] flex flex-col md:flex-row bg-black/40 backdrop-blur-xl border border-neutral-800/60 rounded-[4rem] overflow-hidden animate-in fade-in duration-1000 shadow-2xl">
      {/* Sidebar List */}
      <div className={`w-full md:w-96 flex-shrink-0 border-r border-neutral-800/60 flex flex-col bg-neutral-900/10 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-neutral-800/60 flex justify-between items-center bg-black/20">
          <h2 className="font-black text-xs flex items-center gap-4 uppercase tracking-[0.3em] ml-2"><MessageSquare size={18} className="text-[#3ccfdc]/60" /> Support Terminal</h2>
          <button onClick={() => { setIsCreating(true); setActiveTicket(null); }} className="p-3 hover:bg-[#3ccfdc]/10 hover:text-[#3ccfdc] transition-all rounded-full border border-neutral-800 hover:border-[#3ccfdc]/40 group shadow-md">
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {tickets.length > 0 ? tickets.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTicket(t); setIsCreating(false); }}
              className={`w-full text-left p-6 border border-transparent rounded-[2rem] transition-all duration-500 hover:bg-neutral-800/40 ${activeTicket?.id === t.id ? 'bg-[#3ccfdc]/10 border-[#3ccfdc]/20 shadow-lg' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm ${t.status === TicketStatus.OPEN ? 'bg-[#3ccfdc]/10 text-[#3ccfdc] border border-[#3ccfdc]/30' : 'bg-neutral-900 text-neutral-600 border border-neutral-800'}`}>
                  {t.status}
                </span>
                <span className="text-[9px] text-neutral-700 font-black uppercase tracking-[0.2em] mt-1">{new Date(t.lastUpdated).toLocaleDateString()}</span>
              </div>
              <div className="font-bold text-base truncate mb-1 text-neutral-200 tracking-tight">{t.subject}</div>
              <div className="text-[10px] text-neutral-600 truncate uppercase tracking-[0.3em] font-black">{t.userEmail.split('@')[0]}</div>
            </button>
          )) : (
            <div className="p-16 text-center text-neutral-800 italic text-[10px] uppercase tracking-[0.5em] font-black opacity-30">Archive Void</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-grow flex flex-col min-w-0 ${!activeTicket && !isCreating ? 'hidden md:flex' : 'flex'}`}>
        {isCreating ? (
          <div className="p-16 flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full text-center animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-[#3ccfdc]/5 text-[#3ccfdc] rounded-[2.5rem] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(60,207,220,0.1)]">
              <MessageSquare size={48} />
            </div>
            <h2 className="text-4xl font-bold tracking-tighter mb-4">Initialize Signal</h2>
            <p className="text-neutral-500 mb-12 text-xs uppercase tracking-[0.3em] font-black">Secure transmission protocol</p>
            <form onSubmit={handleCreate} className="w-full space-y-8">
              <input 
                value={newSubject} 
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Subject Protocol" 
                className="w-full bg-neutral-950 border border-neutral-800 p-5 rounded-2xl text-sm focus:border-[#3ccfdc]/40 transition-all shadow-inner outline-none"
                required
              />
              <textarea 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Details of the inquiry..." 
                className="w-full bg-neutral-950 border border-neutral-800 p-6 rounded-[2.5rem] h-56 text-sm focus:border-[#3ccfdc]/40 transition-all resize-none leading-relaxed shadow-inner outline-none"
                required
              />
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <button type="submit" className="flex-grow primary-button py-5 font-black uppercase text-[11px] tracking-[0.4em]">Transmit</button>
                <button type="button" onClick={() => setIsCreating(false)} className="px-14 py-5 border border-neutral-800 rounded-full font-black text-neutral-600 hover:text-white hover:bg-neutral-900 transition-all uppercase text-[10px] tracking-[0.2em]">Abort</button>
              </div>
            </form>
          </div>
        ) : activeTicket ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-neutral-800/60 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-6">
                <button onClick={() => setActiveTicket(null)} className="md:hidden p-3 text-neutral-500 hover:bg-neutral-800 rounded-full transition-all">
                  <ChevronLeft size={24} />
                </button>
                <div className="ml-2">
                  <h3 className="font-bold text-2xl tracking-tighter text-white">{activeTicket.subject}</h3>
                  <div className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] flex items-center gap-4 mt-2">
                    <span className="bg-neutral-900/80 px-3 py-1 rounded-full border border-neutral-800">{activeTicket.userEmail}</span>
                    <span className="opacity-40">REF: {activeTicket.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {activeTicket.status === TicketStatus.OPEN && (
                  <button 
                    onClick={() => handleClose(activeTicket.id)}
                    className="text-[9px] font-black uppercase tracking-[0.3em] border border-neutral-800 hover:border-red-900/60 hover:text-red-900 hover:bg-red-900/5 px-6 py-3 rounded-full transition-all shadow-md"
                  >
                    Close Protocol
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 space-y-10 scrollbar-thin">
              {activeTicket.messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className="flex items-center gap-4 mb-3 mx-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600">
                      {m.senderEmail.split('@')[0]} {m.senderId === user.id ? '(Local)' : ''}
                    </span>
                    {m.senderEmail.includes('admin') && <Shield size={12} className="text-[#3ccfdc]" />}
                    <span className="text-[9px] text-neutral-800 font-black uppercase tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`max-w-[75%] p-7 rounded-[2.5rem] text-sm whitespace-pre-wrap leading-relaxed transition-all duration-700 shadow-xl ${
                    m.senderId === user.id 
                      ? 'bg-white text-black rounded-tr-none' 
                      : 'bg-neutral-900/80 border border-neutral-800/60 text-neutral-300 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {activeTicket.status === TicketStatus.OPEN ? (
              <div className="p-8 bg-black/40 border-t border-neutral-800/60 rounded-b-[4rem]">
                <form onSubmit={handleReply} className="relative group">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Enter terminal response..."
                    className="w-full bg-neutral-950 border border-neutral-800 p-7 pr-24 rounded-[3rem] min-h-[140px] max-h-[350px] text-sm focus:border-[#3ccfdc]/50 transition-all resize-none leading-relaxed shadow-inner outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!reply.trim()}
                    className="absolute bottom-8 right-8 p-4 bg-white text-black rounded-[1.5rem] disabled:opacity-10 transition-all hover:bg-[#3ccfdc] hover:shadow-[0_0_30px_rgba(60,207,220,0.5)] disabled:hover:shadow-none active:scale-95"
                  >
                    <Send size={24} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-14 text-center border-t border-neutral-800/60 bg-neutral-900/20 rounded-b-[4rem]">
                <div className="text-neutral-700 text-[11px] font-black uppercase tracking-[0.5em] flex flex-col items-center gap-6">
                  <CheckCircle size={48} className="text-neutral-900 opacity-40" />
                  Signal Terminated
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-16 text-neutral-800 animate-in fade-in duration-1000">
            <MessageSquare size={100} strokeWidth={0.5} className="mb-10 opacity-10" />
            <p className="max-w-xs text-[11px] font-black uppercase tracking-[0.6em] opacity-40">Awaiting Secure Link Selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
