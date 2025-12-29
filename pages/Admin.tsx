
import React, { useState, useEffect } from 'react';
import { User, UserRole, Item, ItemType, Transaction, TransactionStatus, RedeemCode, SequentialItem } from '../types';
import { DB } from '../db';
import { 
  Plus, Trash2, Check, X, Users, Package, CreditCard, 
  Ticket as TicketIcon, Key, FileText, List, Layers, AlertCircle, Edit2, Image as ImageIcon, Sparkles, Coins
} from 'lucide-react';

interface AdminPageProps {
  user: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [tab, setTab] = useState<'items' | 'users' | 'billing' | 'codes' | 'tickets'>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [codes, setCodes] = useState<RedeemCode[]>([]);

  // Item Form
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemType, setItemType] = useState<ItemType>(ItemType.INSTANT);
  const [itemLogo, setItemLogo] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [seqPages, setSeqPages] = useState<string[]>(['']);

  // Redeem Code Form
  const [customCode, setCustomCode] = useState('');
  const [customAmount, setCustomAmount] = useState(100);
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setItems(DB.getItems());
    setUsers(DB.getUsers());
    setTxs(DB.getTransactions());
    setCodes(DB.getRedeemCodes());
  };

  const startEdit = (item: Item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price);
    setItemType(item.type);
    setItemLogo(item.logoUrl || '');
    setItemContent(item.content || '');
    setSeqPages(item.sequentialItems?.map(si => si.content) || ['']);
    setIsAdding(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData: Item = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substring(7),
      name: itemName,
      description: itemDesc,
      price: itemPrice,
      type: itemType,
      logoUrl: itemLogo,
      deliveredCount: editingItem ? editingItem.deliveredCount : 0
    };

    if (itemType === ItemType.INSTANT) {
      itemData.content = itemContent;
    } else {
      itemData.sequentialItems = seqPages
        .filter(p => p.trim() !== '')
        .map((p, i) => ({
          id: editingItem?.sequentialItems?.[i]?.id || Math.random().toString(36).substring(7),
          content: p,
          isDelivered: editingItem?.sequentialItems?.[i]?.isDelivered || false,
          order: i + 1
        }));
    }

    if (editingItem) {
      DB.updateItem(itemData);
    } else {
      DB.addItem(itemData);
    }

    setIsAdding(false);
    setEditingItem(null);
    resetForm();
    refreshData();
  };

  const resetForm = () => {
    setItemName('');
    setItemDesc('');
    setItemPrice(0);
    setItemType(ItemType.INSTANT);
    setItemLogo('');
    setItemContent('');
    setSeqPages(['']);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Permanently remove this asset?')) {
      DB.deleteItem(id);
      refreshData();
    }
  };

  const handleTx = (id: string, status: TransactionStatus) => {
    DB.updateTransactionStatus(id, status);
    refreshData();
  };

  const handleCreateCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode) return;

    // Check if code exists
    if (codes.some(c => c.code === customCode && !c.isUsed)) {
      alert("This code is already active.");
      return;
    }

    const code: RedeemCode = {
      id: Math.random().toString(36).substring(7),
      code: customCode.toUpperCase(),
      amount: customAmount,
      isUsed: false,
      createdBy: user.email,
      createdAt: Date.now()
    };
    DB.addRedeemCode(code);
    setCustomCode('');
    setIsCreatingCode(false);
    refreshData();
  };

  const generateRandomCode = () => {
    const randomStr = Math.random().toString(36).toUpperCase().substring(2, 14);
    setCustomCode(randomStr);
  };

  const tabBtn = (t: typeof tab) => `px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-full transition-all ${
    tab === t 
      ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
      : 'text-neutral-500 hover:text-white hover:bg-neutral-800/40'
  }`;

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-neutral-800/40 pb-16">
        <div>
          <h1 className="text-6xl font-bold tracking-tighter">Terminal</h1>
          <p className="text-neutral-600 mt-4 text-sm uppercase tracking-[0.4em] font-black">System Administrator Console</p>
        </div>
        
        <div className="flex bg-neutral-900/40 p-3 rounded-full border border-neutral-800/60 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          <button onClick={() => setTab('items')} className={tabBtn('items')}>Inventory</button>
          <button onClick={() => setTab('codes')} className={tabBtn('codes')}>Vouchers</button>
          <button onClick={() => setTab('users')} className={tabBtn('users')}>Registry</button>
        </div>
      </div>

      {tab === 'items' && (
        <div className="space-y-12">
          <div className="flex justify-between items-center bg-neutral-900/10 p-10 rounded-[3rem] border border-neutral-800/40">
            <h2 className="text-3xl font-bold flex items-center gap-6 tracking-tight"><Package size={32} className="text-[#3ccfdc]/60" /> Central Inventory</h2>
            {!isAdding && (
              <button onClick={() => { setEditingItem(null); resetForm(); setIsAdding(true); }} className="primary-button flex items-center gap-4 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                <Plus size={20} /> Deploy Asset
              </button>
            )}
          </div>

          {isAdding && (
            <div className="bg-black/40 backdrop-blur-md border border-neutral-800/60 p-16 rounded-[4rem] animate-in zoom-in-95 duration-500 shadow-2xl">
              <form onSubmit={handleSaveItem} className="space-y-12 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8">Designation</label>
                    <input value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 py-5 px-8 rounded-2xl text-base shadow-inner outline-none focus:border-[#3ccfdc]/40 transition-all" placeholder="Encrypted Archive..." required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8">Valuation (CR)</label>
                    <input type="number" value={itemPrice} onChange={e => setItemPrice(parseInt(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 py-5 px-8 rounded-2xl text-base shadow-inner outline-none focus:border-[#3ccfdc]/40 transition-all" required />
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8 flex items-center gap-3"><ImageIcon size={14} /> Logo URL</label>
                    <input value={itemLogo} onChange={e => setItemLogo(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 py-5 px-8 rounded-2xl text-sm shadow-inner outline-none focus:border-[#3ccfdc]/40 transition-all" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8">Description Meta</label>
                  <textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-8 rounded-[2.5rem] h-40 text-sm resize-none shadow-inner outline-none focus:border-[#3ccfdc]/40 transition-all leading-relaxed" placeholder="Detailed asset metadata..." required />
                </div>

                <div className="space-y-8">
                  <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8">Delivery Protocol</label>
                  <div className="flex flex-col md:flex-row gap-8">
                    <button type="button" onClick={() => setItemType(ItemType.INSTANT)} className={`flex-1 py-6 border rounded-[1.5rem] flex items-center justify-center gap-4 transition-all uppercase text-xs font-black tracking-[0.3em] ${itemType === ItemType.INSTANT ? 'border-[#3ccfdc]/60 bg-[#3ccfdc]/15 text-white shadow-[0_0_25px_rgba(60,207,220,0.15)]' : 'border-neutral-800 text-neutral-600 hover:bg-neutral-900/40'}`}>
                      <FileText size={24} /> Static Sync
                    </button>
                    <button type="button" onClick={() => setItemType(ItemType.SEQUENTIAL)} className={`flex-1 py-6 border rounded-[1.5rem] flex items-center justify-center gap-4 transition-all uppercase text-xs font-black tracking-[0.3em] ${itemType === ItemType.SEQUENTIAL ? 'border-[#3ccfdc]/60 bg-[#3ccfdc]/15 text-white shadow-[0_0_25px_rgba(60,207,220,0.15)]' : 'border-neutral-800 text-neutral-600 hover:bg-neutral-900/40'}`}>
                      <Layers size={24} /> Queue Stack
                    </button>
                  </div>
                </div>

                {itemType === ItemType.INSTANT ? (
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600 ml-8">Payload Content</label>
                    <textarea value={itemContent} onChange={e => setItemContent(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-8 rounded-[2.5rem] font-mono text-sm h-56 resize-none leading-relaxed shadow-inner outline-none focus:border-[#3ccfdc]/40 transition-all" placeholder="Data delivered upon clearance..." required={itemType === ItemType.INSTANT} />
                  </div>
                ) : (
                  <div className="space-y-10 bg-neutral-900/10 p-10 rounded-[3rem] border border-neutral-800/40">
                    <div className="flex justify-between items-center px-6">
                      <label className="text-[11px] uppercase font-black tracking-[0.4em] text-neutral-600">Distribution Stacks</label>
                      <button type="button" onClick={() => setSeqPages([...seqPages, ''])} className="text-[11px] uppercase tracking-widest text-white border border-neutral-700 px-8 py-3 rounded-full hover:border-[#3ccfdc]/60 transition-all bg-black/60 font-black">Add Stack</button>
                    </div>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-6 scrollbar-thin">
                      {seqPages.map((page, idx) => (
                        <div key={idx} className="flex gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-xs font-black rounded-2xl shadow-inner">{idx + 1}</div>
                          <input value={page} onChange={e => {
                            const newPages = [...seqPages];
                            newPages[idx] = e.target.value;
                            setSeqPages(newPages);
                          }} className="flex-grow bg-neutral-950 border border-neutral-800 px-6 rounded-2xl text-sm focus:border-[#3ccfdc]/40 transition-all outline-none shadow-inner" placeholder={`Payload Stack #${idx + 1}...`} />
                          <button type="button" onClick={() => setSeqPages(seqPages.filter((_, i) => i !== idx))} className="p-4 text-red-900 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-full flex-shrink-0"><Trash2 size={24} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-8 pt-12 border-t border-neutral-800/60">
                  <button type="submit" className="flex-grow primary-button py-6 text-sm font-black uppercase tracking-[0.5em] shadow-2xl">
                    {editingItem ? 'Save Protocol' : 'Finalize Deployment'}
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); resetForm(); }} className="px-16 py-6 border border-neutral-800 text-neutral-600 rounded-full hover:text-white hover:bg-neutral-900 transition-all uppercase text-xs font-black tracking-[0.3em]">Abort</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {items.map(item => (
              <div key={item.id} className="bg-neutral-900/20 border border-neutral-800/60 p-12 rounded-[3.5rem] group hover:border-[#3ccfdc]/50 transition-all duration-700 shadow-xl">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-20 h-20 bg-black border border-neutral-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} className="w-full h-full object-cover" alt="item" />
                    ) : (
                      <Package size={32} className="text-neutral-800" />
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => startEdit(item)} className="text-neutral-600 hover:text-[#3ccfdc] transition-all p-3 hover:bg-[#3ccfdc]/10 rounded-full">
                      <Edit2 size={22} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-neutral-600 hover:text-red-600 transition-all p-3 hover:bg-red-900/10 rounded-full">
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tighter text-neutral-100">{item.name}</h3>
                <div className="text-4xl font-black mb-10 tracking-tighter group-hover:text-white transition-all">{item.price} <span className="text-xs text-neutral-700 font-black ml-1 uppercase tracking-[0.4em]">Credits</span></div>
                <div className="space-y-3 text-[11px] text-neutral-600 uppercase tracking-[0.4em] font-black">
                  {item.type === ItemType.INSTANT ? (
                    <div className="flex items-center gap-3 text-[#3ccfdc]/80">
                      <div className="w-2 h-2 rounded-full bg-[#3ccfdc]"></div>
                      Stable Synced
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
                      Stock: {item.deliveredCount} / {item.sequentialItems?.length || 0}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'codes' && (
        <div className="space-y-12">
          <div className="flex justify-between items-center bg-neutral-900/10 p-10 rounded-[3rem] border border-neutral-800/40">
            <h2 className="text-3xl font-bold flex items-center gap-6 tracking-tight"><Key size={32} className="text-[#3ccfdc]/60" /> Voucher Repository</h2>
            {!isCreatingCode && (
              <button onClick={() => setIsCreatingCode(true)} className="primary-button flex items-center gap-4 px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                <Plus size={20} /> Mint Voucher
              </button>
            )}
          </div>

          {isCreatingCode && (
            <div className="bg-black/40 backdrop-blur-md border border-neutral-800/60 p-16 rounded-[4rem] animate-in zoom-in-95 duration-500 shadow-2xl">
              <form onSubmit={handleCreateCustomCode} className="space-y-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <h3 className="text-3xl font-black tracking-tighter mb-4">Voucher Protocol Initiation</h3>
                  <p className="text-neutral-500 text-xs uppercase tracking-[0.4em] font-black">Assign specific credit valuation</p>
                </div>
                
                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase font-black tracking-[0.5em] text-neutral-600 ml-10 flex items-center gap-4">
                      <Sparkles size={16} /> Key String
                    </label>
                    <div className="relative group">
                      <input 
                        value={customCode} 
                        onChange={e => setCustomCode(e.target.value.toUpperCase())} 
                        className="w-full bg-neutral-950 border border-neutral-800 py-6 px-10 rounded-[2rem] text-xl font-mono text-center tracking-widest shadow-inner outline-none focus:border-[#3ccfdc]/60 transition-all uppercase" 
                        placeholder="SUMMER-CLEARANCE" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={generateRandomCode}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-600 hover:text-white transition-colors uppercase tracking-[0.3em]"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase font-black tracking-[0.5em] text-neutral-600 ml-10 flex items-center gap-4">
                      <Coins size={16} /> Credit Reward
                    </label>
                    <input 
                      type="number" 
                      value={customAmount} 
                      onChange={e => setCustomAmount(parseInt(e.target.value) || 0)} 
                      className="w-full bg-neutral-950 border border-neutral-800 py-6 px-10 rounded-[2rem] text-2xl font-black text-center focus:border-[#3ccfdc]/60 transition-all outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex gap-8 pt-6">
                  <button type="submit" className="flex-grow primary-button py-6 text-sm font-black uppercase tracking-[0.5em] shadow-2xl">
                    Authorize Key Mint
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingCode(false)} 
                    className="px-16 py-6 border border-neutral-800 rounded-full text-neutral-600 hover:text-white hover:bg-neutral-900 transition-all uppercase text-xs font-black tracking-[0.3em]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {codes.length > 0 ? codes.map(c => (
              <div key={c.id} className={`p-12 border rounded-[3.5rem] flex flex-col justify-between transition-all duration-700 ${c.isUsed ? 'bg-black/20 border-neutral-900 opacity-20 grayscale' : 'bg-neutral-900/40 border-neutral-800 hover:border-[#3ccfdc]/60 hover:shadow-[0_0_50px_rgba(60,207,220,0.15)] shadow-xl'}`}>
                <div className="font-mono font-black text-2xl mb-8 text-neutral-100 tracking-tighter text-center">{c.code}</div>
                <div className="space-y-3 mb-8">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-700 font-black">Issued: {new Date(c.createdAt).toLocaleDateString()}</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-700 font-black">Origin: {c.createdBy.split('@')[0]}</div>
                </div>
                <div className="flex justify-between items-center border-t border-neutral-800/60 pt-8">
                  <span className="text-xl font-black tracking-tighter text-[#3ccfdc]">{c.amount} <span className="text-[10px] uppercase tracking-widest text-neutral-700">CR</span></span>
                  <span className={`text-[10px] font-black uppercase px-5 py-2 rounded-full tracking-widest border ${c.isUsed ? 'bg-neutral-800 border-neutral-700 text-neutral-600' : 'bg-[#3ccfdc]/15 border-[#3ccfdc]/40 text-[#3ccfdc]'}`}>
                    {c.isUsed ? 'Depleted' : 'Active'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center text-neutral-800 uppercase tracking-[0.6em] font-black italic opacity-30">Voucher Void</div>
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-12">
          <h2 className="text-3xl font-bold flex items-center gap-6 tracking-tight"><Users size={32} className="text-[#3ccfdc]/60" /> System Registry</h2>
          <div className="border border-neutral-800/60 rounded-[3.5rem] overflow-hidden bg-neutral-900/10 shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950 text-neutral-600 border-b border-neutral-800/60 uppercase tracking-[0.5em] font-black">
                <tr>
                  <th className="px-12 py-8">Identity</th>
                  <th className="px-12 py-8">Clearance</th>
                  <th className="px-12 py-8 text-right">Balance Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-900/30 transition-all">
                    <td className="px-12 py-8 font-bold tracking-tight text-neutral-300">{u.email}</td>
                    <td className="px-12 py-8">
                       <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${u.role === UserRole.ADMIN ? 'bg-[#3ccfdc]/15 border-[#3ccfdc]/40 text-[#3ccfdc]' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}>
                        {u.role}
                       </span>
                    </td>
                    <td className="px-12 py-8 text-right text-[#3ccfdc] font-black tracking-tighter text-2xl">{u.credits} <span className="text-xs text-neutral-700 ml-1 uppercase tracking-widest">CR</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
