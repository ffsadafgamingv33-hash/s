
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Tag, ExternalLink, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { DB } from '../db';
import { Item, ItemType, User, Purchase } from '../types';

interface ItemsPageProps {
  user: User;
}

const ItemsPage: React.FC<ItemsPageProps> = ({ user }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<{ name: string, content: string } | null>(null);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to fetch items:', err));
  }, []);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.description && i.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePurchase = (item: Item) => {
    if (user.credits < item.price) {
      setFeedback({ type: 'error', message: 'Insufficient credits. Top up your balance in Profile.' });
      return;
    }

    setPurchasingId(item.id);
    
    fetch('/api/items/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, itemId: item.id })
    })
    .then(res => res.json())
    .then(result => {
      if (result.id) {
        setFeedback({ type: 'success', message: 'Item acquired successfully.' });
        setPurchasedContent({ name: item.name, content: result.content_delivered || '' });
        // Refresh items to get updated stock
        fetch('/api/items')
          .then(res => res.json())
          .then(data => setItems(data));
      } else {
        setFeedback({ type: 'error', message: result.error || 'Acquisition failed.' });
      }
      setPurchasingId(null);
    })
    .catch(err => {
      setFeedback({ type: 'error', message: 'Purchase failed. Server error.' });
      setPurchasingId(null);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-800/40 pb-12">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Inventory</h1>
          <p className="text-neutral-500 mt-3 text-xs uppercase tracking-[0.3em] font-black">Professional Curations</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#3ccfdc] transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full bg-neutral-900/30 border border-neutral-800 rounded-full py-5 pl-14 pr-6 text-sm focus:border-[#3ccfdc]/40 focus:ring-4 focus:ring-[#3ccfdc]/5 transition-all outline-none"
          />
        </div>
      </div>

      {feedback && (
        <div className={`p-6 border rounded-3xl flex items-center gap-5 animate-in slide-in-from-top-6 duration-600 ${
          feedback.type === 'success' ? 'bg-[#3ccfdc]/5 border-[#3ccfdc]/30 text-[#3ccfdc]' : 'bg-red-500/5 border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          <span className="text-sm font-bold uppercase tracking-widest">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-auto p-2 hover:bg-white/5 rounded-full transition-all">✕</button>
        </div>
      )}

      {purchasedContent && (
        <div className="bg-neutral-100 text-black p-10 rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tighter">Decrypted: {purchasedContent.name}</h2>
            <button onClick={() => setPurchasedContent(null)} className="p-2 hover:bg-black/5 rounded-full transition-all text-neutral-400">
              <XCircle size={32} />
            </button>
          </div>
          <div className="bg-white p-8 font-mono text-xs border border-neutral-200 rounded-3xl overflow-auto max-h-72 whitespace-pre-wrap leading-relaxed shadow-inner">
            {purchasedContent.content}
          </div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-black text-center">Data verified and secured in history.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.length > 0 ? filteredItems.map(item => {
          const isOutOfStock = item.type === ItemType.SEQUENTIAL && (!item.sequentialItems || item.sequentialItems.every(si => si.isDelivered));
          
          return (
            <div key={item.id} className="group relative bg-black/40 backdrop-blur-sm border border-neutral-800/60 rounded-[3rem] overflow-hidden hover:border-[#3ccfdc]/40 hover:shadow-[0_0_30px_rgba(60,207,220,0.1)] transition-all duration-700">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-neutral-900/60 border border-neutral-800 rounded-2xl group-hover:text-[#3ccfdc] group-hover:border-[#3ccfdc]/30 group-hover:shadow-[0_0_15px_rgba(60,207,220,0.1)] transition-all overflow-hidden flex items-center justify-center">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.type === ItemType.INSTANT ? <FileText size={32} /> : <ExternalLink size={32} />
                    )}
                  </div>
                  <div className="text-3xl font-black tracking-tighter group-hover:text-white transition-colors">{item.price} <span className="text-[10px] text-neutral-600 uppercase tracking-[0.3em] ml-1 font-black">CR</span></div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed mb-10 line-clamp-2 h-10">{item.description}</p>
                
                <div className="flex items-center justify-between text-[10px] text-neutral-600 mb-10 font-black uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-3 bg-neutral-900/40 px-3 py-1.5 rounded-full border border-neutral-800">
                    <Tag size={12} className="text-[#3ccfdc]/60" />
                    <span>{item.type === ItemType.INSTANT ? 'Instant' : 'Queue'}</span>
                  </div>
                  {item.type === ItemType.SEQUENTIAL && (
                    <div className={isOutOfStock ? 'text-red-900' : 'text-[#3ccfdc]/40'}>
                      {isOutOfStock ? 'Depleted' : `${(item.sequentialItems?.filter(si => !si.isDelivered).length || 0)} Stacks`}
                    </div>
                  )}
                </div>

                <button
                  disabled={isOutOfStock || purchasingId === item.id}
                  onClick={() => handlePurchase(item)}
                  className={`w-full py-5 px-6 font-black rounded-full flex items-center justify-center gap-4 transition-all uppercase text-xs tracking-[0.3em] border shadow-lg ${
                    isOutOfStock 
                      ? 'bg-neutral-900 text-neutral-700 border-neutral-800 cursor-not-allowed opacity-50' 
                      : 'primary-button'
                  }`}
                >
                  {purchasingId === item.id ? (
                    <div className="w-5 h-5 border-3 border-[#3ccfdc] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      {isOutOfStock ? 'Sold Out' : 'Acquire'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-40 text-center animate-pulse">
            <ShoppingBag className="mx-auto text-neutral-900 mb-8 opacity-40" size={80} strokeWidth={1} />
            <p className="text-neutral-700 text-xs uppercase tracking-[0.5em] font-black">No Database Matches Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
