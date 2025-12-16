import React, { useState, useRef } from 'react';
import { Settings, Shield, Award, Leaf, MapPin, Coins, HandHeart, ArrowLeft, Check, Lock, Gift, Zap, TreeDeciduous, Camera, LogOut, Moon, Bell, Globe, Loader2, CheckCircle, X, Download, Edit2, User as UserIcon, Sprout } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { User, Language } from '../types';

const data = [
  { name: 'Reports', value: 10, color: '#34D399' },
  { name: 'Donations', value: 5, color: '#A3E635' },
  { name: 'Volunteer', value: 20, color: '#60A5FA' },
];

interface ProfileViewProps {
  onLogout?: () => void;
  user: User;
  onUpdateUser: (u: User) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
}

type ModalType = 'NONE' | 'GAMIFICATION' | 'REDEEM' | 'SETTINGS' | 'VERIFICATION' | 'EDIT_PROFILE';

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogout, user, onUpdateUser, language, setLanguage, t }) => {
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  
  // --- STATE INTERAKTIF ---
  const [userPoints, setUserPoints] = useState(user.points);
  
  // State for Edit Profile
  const [editForm, setEditForm] = useState({
      name: user.name,
      location: user.location,
      avatar: user.avatar
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk Daily Check-in
  const [dailyData, setDailyData] = useState([
    { day: 1, reward: 50, status: 'claimed' },
    { day: 2, reward: 50, status: 'claimed' },
    { day: 3, reward: 100, status: 'today' }, // Target simulasi
    { day: 4, reward: 50, status: 'locked' },
    { day: 5, reward: 50, status: 'locked' },
    { day: 6, reward: 100, status: 'locked' },
    { day: 7, reward: 500, status: 'locked', big: true },
  ]);
  const [isClaiming, setIsClaiming] = useState(false);

  // State untuk Redeem Shop
  const [redeemProcess, setRedeemProcess] = useState<{status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'SAVING', item: any | null}>({
      status: 'IDLE',
      item: null
  });

  // 7 Tier Badges
  const badges = [
    { id: 1, name: "Calon Penjaga", level: 1, icon: Sprout, unlocked: true, color: "text-emerald-400", bg: "bg-emerald-50" },
    { id: 2, name: "Pemerhati", level: 2, icon: Leaf, unlocked: true, color: "text-emerald-500", bg: "bg-emerald-100" },
    { id: 3, name: "Pelapor Aktif", level: 3, icon: MapPin, unlocked: true, color: "text-blue-500", bg: "bg-blue-100" },
    { id: 4, name: "Tanggap Darurat", level: 4, icon: Zap, unlocked: true, color: "text-yellow-500", bg: "bg-yellow-100" },
    { id: 5, name: "Penjaga Alam", level: 5, icon: TreeDeciduous, unlocked: true, color: "text-green-600", bg: "bg-green-100" },
    { id: 6, name: "Pahlawan Lingkungan", level: 6, icon: Shield, unlocked: false, color: "text-slate-400", bg: "bg-slate-100" },
    { id: 7, name: "Legenda Bumi", level: 7, icon: Globe, unlocked: false, color: "text-slate-400", bg: "bg-slate-100" },
  ];

  // Redeem Shop Items
  const shopItems = [
    { id: 1, name: "Voucher GoPay 20k", price: 2000, img: "https://images.unsplash.com/photo-1626125345510-4703ee923869?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Eco Totebag", price: 3500, img: "https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Donasi Pohon (Sertifikat)", price: 5000, img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200" },
    { id: 4, name: "T-Shirt Relawan", price: 6000, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200" },
    { id: 5, name: "Tumbler Stainless", price: 4500, img: "https://images.unsplash.com/photo-1602143407151-011141920038?auto=format&fit=crop&q=80&w=200" },
    { id: 6, name: "Topi EchoGuard", price: 3000, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200" },
  ];

  // --- LOGIC ---

  const handleClaimDaily = (dayIndex: number, reward: number) => {
      setIsClaiming(true);
      setTimeout(() => {
          const newData = [...dailyData];
          newData[dayIndex].status = 'claimed';
          setDailyData(newData);
          setUserPoints(prev => prev + reward);
          setIsClaiming(false);
          if(dayIndex + 1 < newData.length) {
              newData[dayIndex + 1].status = 'today';
              setDailyData([...newData]);
          }
      }, 1000);
  };

  const handleRedeemItem = (item: any) => {
      if (userPoints < item.price) {
          alert("Poin Anda tidak mencukupi!");
          return;
      }
      setRedeemProcess({ status: 'PROCESSING', item: item });
      setTimeout(() => {
          setUserPoints(prev => prev - item.price);
          setRedeemProcess({ status: 'SUCCESS', item: item });
      }, 2000);
  };

  const closeRedeemSuccess = () => {
      setRedeemProcess(prev => ({ ...prev, status: 'SAVING' }));
      setTimeout(() => {
          setRedeemProcess({ status: 'IDLE', item: null });
      }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const url = URL.createObjectURL(file);
          setEditForm(prev => ({ ...prev, avatar: url }));
      }
  };

  const handleSaveProfile = () => {
      setIsSavingProfile(true);
      setTimeout(() => {
          onUpdateUser({
              ...user,
              name: editForm.name,
              location: editForm.location,
              avatar: editForm.avatar
          });
          setIsSavingProfile(false);
          setActiveModal('NONE');
      }, 1500);
  };

  const renderGamification = () => (
    <div className="pb-24 animate-in slide-in-from-right duration-300 h-full overflow-y-auto bg-white/50">
        <div className="flex items-center gap-3 p-4 sticky top-0 bg-white/80 backdrop-blur-md z-20 shadow-sm">
            <button onClick={() => setActiveModal('NONE')} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Eco Rewards</h2>
            <div className="ml-auto flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 shadow-sm transition-all duration-300 transform key={userPoints}">
                <Coins size={14} className="text-yellow-600" />
                <span className="text-xs font-bold text-yellow-700">{userPoints.toLocaleString()}</span>
            </div>
        </div>
        <div className="px-4 space-y-6 pt-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <TreeDeciduous size={32} className="text-emerald-100" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{user.badges[0]}</h3>
                        <p className="text-xs text-emerald-100 mb-2">350 XP lagi menuju Level 6</p>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 w-[75%] shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Check size={18} className="text-blue-500" /> Absen Harian
                </h3>
                <GlassCard className="p-4 overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 min-w-max">
                        {dailyData.map((item, index) => (
                            <div key={item.day} className={`flex flex-col items-center gap-2 p-2 rounded-xl border min-w-[60px] transition-all duration-300 ${item.status === 'today' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 scale-105' : 'bg-white border-slate-100'}`}>
                                <span className="text-[10px] font-bold text-slate-400">Hari {item.day}</span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${item.status === 'claimed' ? 'bg-emerald-100' : item.big ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                    {item.status === 'claimed' ? <Check size={16} className="text-emerald-600 animate-in zoom-in duration-300" /> : 
                                     item.big ? <Gift size={20} className="text-yellow-600 animate-bounce" /> :
                                     <Coins size={16} className="text-blue-600" />
                                    }
                                </div>
                                <span className={`text-[10px] font-bold ${item.status === 'claimed' ? 'text-emerald-600' : 'text-slate-800'}`}>+{item.reward}</span>
                                {item.status === 'today' && (
                                    <button onClick={() => handleClaimDaily(index, item.reward)} disabled={isClaiming} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center justify-center min-w-[50px] active:scale-95 transition-transform">
                                        {isClaiming ? <Loader2 size={10} className="animate-spin" /> : 'Klaim'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Award size={18} className="text-purple-500" /> Koleksi Lencana (7 Tingkat)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge) => (
                        <GlassCard key={badge.id} className={`p-3 flex items-center gap-3 ${!badge.unlocked && 'opacity-60 grayscale'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.bg}`}>
                                <badge.icon size={24} className={badge.color} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-slate-800">{badge.name}</h4>
                                <p className="text-[10px] text-slate-500">{badge.unlocked ? `Level ${badge.level} • Aktif` : `Terkunci (Lvl ${badge.level})`}</p>
                            </div>
                            {!badge.unlocked && <Lock size={12} className="ml-auto text-slate-400" />}
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  const renderRedeemShop = () => (
      <div className="pb-24 animate-in slide-in-from-bottom duration-300 h-full overflow-y-auto bg-slate-50 relative">
          {(redeemProcess.status === 'SUCCESS' || redeemProcess.status === 'SAVING') && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                  <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"></div>
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 relative">
                          <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
                          <CheckCircle size={40} className="text-emerald-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 mb-2">Berhasil Ditukar!</h2>
                      <p className="text-sm text-slate-500 mb-6">Selamat! Anda berhasil menukar <br/><span className="font-bold text-slate-800">{redeemProcess.item?.name}</span></p>
                      <button onClick={closeRedeemSuccess} disabled={redeemProcess.status === 'SAVING'} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-80">
                          {redeemProcess.status === 'SAVING' ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Download size={18} /> Simpan Voucher</>}
                      </button>
                  </div>
              </div>
          )}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveModal('GAMIFICATION')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
              <h2 className="font-bold text-lg text-slate-800">Tukar Poin</h2>
              <div className="ml-auto flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full"><Coins size={14} className="text-yellow-600" /><span className="text-xs font-bold text-yellow-700">{userPoints.toLocaleString()}</span></div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
              {shopItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col active:scale-[0.98] transition-transform relative group">
                      {redeemProcess.status === 'PROCESSING' && redeemProcess.item?.id === item.id && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center"><Loader2 size={32} className="text-emerald-600 animate-spin mb-2" /><span className="text-[10px] font-bold text-emerald-700 animate-pulse">Memproses...</span></div>
                      )}
                      <div className="h-32 bg-slate-100 relative"><img src={item.img} className="w-full h-full object-cover" /></div>
                      <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-bold text-sm text-slate-800 mb-1 leading-tight">{item.name}</h4>
                          <div className="mt-auto flex justify-between items-center">
                              <span className={`text-xs font-bold flex items-center gap-1 ${userPoints >= item.price ? 'text-orange-500' : 'text-slate-400'}`}><Coins size={12}/> {item.price.toLocaleString()}</span>
                              <button onClick={() => handleRedeemItem(item)} disabled={userPoints < item.price || redeemProcess.status === 'PROCESSING'} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${userPoints >= item.price ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Tukar</button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderEditProfile = () => (
      <div className="pb-24 animate-in slide-in-from-bottom duration-300 h-full overflow-y-auto bg-slate-50 relative z-50">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <button onClick={() => { setActiveModal('SETTINGS'); setEditForm({name: user.name, location: user.location, avatar: user.avatar}); }} className="p-2 rounded-full hover:bg-slate-100"><X size={20}/></button>
                  <h2 className="font-bold text-lg text-slate-800">{t('editProfile')}</h2>
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full"
              >
                  {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : t('save')}
              </button>
          </div>
          
          <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
                          <img src={editForm.avatar} className="w-full h-full object-cover" />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white active:scale-95 transition-transform"
                      >
                          <Camera size={20} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{t('changePhoto')}</p>
              </div>

              <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">{t('name')}</label>
                      <div className="flex items-center gap-3">
                          <UserIcon size={20} className="text-slate-400" />
                          <input 
                            type="text" 
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="flex-1 text-sm font-bold text-slate-800 outline-none placeholder-slate-300"
                          />
                      </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">{t('location')}</label>
                      <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-slate-400" />
                          <input 
                            type="text" 
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="flex-1 text-sm font-bold text-slate-800 outline-none placeholder-slate-300"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="pb-24 animate-in slide-in-from-right duration-300 h-full overflow-y-auto bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveModal('NONE')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
              <h2 className="font-bold text-lg text-slate-800">{t('settings')}</h2>
          </div>
          <div className="p-4 space-y-4">
               {/* Edit Profile Link */}
               <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setActiveModal('EDIT_PROFILE')}>
                   <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                       <img src={user.avatar} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                       <h3 className="font-bold text-slate-800">{user.name}</h3>
                       <p className="text-xs text-emerald-700 font-medium">{t('editProfile')}</p>
                   </div>
                   <div className="bg-white p-2 rounded-full text-emerald-600 shadow-sm"><Edit2 size={16} /></div>
               </div>

               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                       <Globe size={20} className="text-slate-600" />
                       <span className="text-sm font-medium">{t('language')}</span>
                   </div>
                   <select 
                     value={language}
                     onChange={(e) => setLanguage(e.target.value as Language)}
                     className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                   >
                       <option value="id">🇮🇩 Indonesia</option>
                       <option value="en">🇺🇸 English</option>
                       <option value="ar">🇸🇦 العربية</option>
                       <option value="zh">🇨🇳 中文</option>
                   </select>
               </div>

               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                       <Moon size={20} className="text-slate-600" />
                       <span className="text-sm font-medium">Mode Gelap</span>
                   </div>
                   <div className="w-10 h-6 bg-slate-300 rounded-full p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
               </div>
               
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                       <Bell size={20} className="text-slate-600" />
                       <span className="text-sm font-medium">Notifikasi Bencana</span>
                   </div>
                   <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 flex justify-end"><div className="w-4 h-4 bg-white rounded-full"></div></div>
               </div>
          </div>
      </div>
  );

  const renderVerification = () => (
      <div className="pb-24 animate-in slide-in-from-right duration-300 h-full overflow-y-auto bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveModal('NONE')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
              <h2 className="font-bold text-lg text-slate-800">Verifikasi Akun</h2>
          </div>
          <div className="p-6 text-center">
               <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                   <Camera size={32} className="text-slate-400" />
               </div>
               <h3 className="font-bold text-slate-800 mb-2">Foto e-KTP</h3>
               <p className="text-sm text-slate-500 mb-6">Unggah foto KTP untuk verifikasi identitas sebagai relawan resmi.</p>
               <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mb-3">Ambil Foto</button>
               <button className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Upload dari Galeri</button>
          </div>
      </div>
  );

  // --- MAIN PROFILE VIEW ---
  if (activeModal === 'GAMIFICATION') return renderGamification();
  if (activeModal === 'REDEEM') return renderRedeemShop();
  if (activeModal === 'SETTINGS') return renderSettings();
  if (activeModal === 'VERIFICATION') return renderVerification();
  if (activeModal === 'EDIT_PROFILE') return renderEditProfile();

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center pt-6 pb-6">
        <div className="relative">
           <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-lime-300">
             <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full border-4 border-white object-cover" />
           </div>
           <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 border-2 border-white rounded-full text-white">
             <Shield size={12} fill="currentColor" />
           </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mt-3">{user.name}</h2>
        <p className="text-sm text-slate-500">{user.location}</p>
        
        <button 
            onClick={() => setActiveModal('GAMIFICATION')}
            className="flex items-center gap-1 mt-2 px-4 py-1.5 bg-white rounded-full border border-emerald-200 shadow-sm active:scale-95 transition-transform"
        >
           <Leaf size={14} className="text-emerald-600" />
           <span className="text-xs font-bold text-emerald-800">{user.badges[0]}</span>
           <div className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1 animate-pulse"></div>
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-2 gap-4 mb-6">
         <GlassCard className="p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1.5 bg-red-100 rounded-full text-red-500 animate-bounce delay-700">
              <MapPin size={14} />
            </div>
            <span className="text-3xl font-black text-slate-800">12</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Laporan</span>
         </GlassCard>

         <GlassCard className="p-4 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute top-2 right-2 p-1.5 bg-yellow-100 rounded-full text-yellow-600 animate-pulse">
               <Coins size={14} />
             </div>
             <span className="text-3xl font-black text-slate-800">{userPoints > 1000 ? (userPoints/1000).toFixed(1) + 'k' : userPoints}</span>
             <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Poin</span>
         </GlassCard>
         
         <GlassCard className="p-4 flex flex-col items-center justify-center relative overflow-hidden group col-span-2">
             <div className="absolute top-3 right-3 p-1.5 bg-blue-100 rounded-full text-blue-600 animate-pulse">
               <HandHeart size={16} />
             </div>
             <div className="flex items-center gap-4">
                 <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} innerRadius={15} outerRadius={30} dataKey="value" stroke="none">
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div>
                     <span className="text-3xl font-black text-slate-800 block">35 Jam</span>
                     <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Volunteer</span>
                 </div>
             </div>
         </GlassCard>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-2">
         <h3 className="text-sm font-bold text-slate-400 ml-1 mb-2 uppercase">General</h3>
         
         <GlassCard className="p-4 flex items-center justify-between active:scale-[0.98] cursor-pointer" onClick={() => setActiveModal('GAMIFICATION')}>
             <div className="flex items-center gap-3">
               <div className="text-yellow-500"><Award size={20} /></div>
               <div>
                   <span className="text-sm font-bold text-slate-700 block">Pencapaian Saya</span>
                   <span className="text-[10px] text-slate-400">Cek badges & rewards harian</span>
               </div>
             </div>
             <div className="flex items-center gap-2">
                 <span className="text-[10px] bg-red-500 text-white px-1.5 rounded-sm font-bold">NEW</span>
                 <div className="w-2 h-2 rounded-full bg-slate-300"></div>
             </div>
         </GlassCard>

         <GlassCard className="p-4 flex items-center justify-between active:scale-[0.98] cursor-pointer" onClick={() => setActiveModal('VERIFICATION')}>
             <div className="flex items-center gap-3">
               <div className="text-slate-500"><Shield size={20} /></div>
               <span className="text-sm font-medium text-slate-700">Verifikasi Akun</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
         </GlassCard>

         <GlassCard className="p-4 flex items-center justify-between active:scale-[0.98] cursor-pointer" onClick={() => setActiveModal('SETTINGS')}>
             <div className="flex items-center gap-3">
               <div className="text-slate-500"><Settings size={20} /></div>
               <span className="text-sm font-medium text-slate-700">{t('settings')}</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
         </GlassCard>
      </div>
      
      <div className="px-4 mt-6">
         <button onClick={onLogout} className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 active:scale-95">
           <LogOut size={16} /> {t('logout')}
         </button>
      </div>

    </div>
  );
};