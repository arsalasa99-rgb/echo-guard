import React, { useState, useEffect } from 'react';
import { AppView, User, Language } from './types';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { PreDisasterView } from './views/PreDisasterView';
import { DuringDisasterView } from './views/DuringDisasterView';
import { PostDisasterView } from './views/PostDisasterView';
import { ProfileView } from './views/ProfileView';
import { ArrowRight, Leaf, Shield, Heart, Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from './components/Logo';

// --- TRANSLATION DICTIONARY ---
const translations = {
  id: {
    welcome: "Selamat Pagi",
    home: "Beranda",
    pre: "Pra",
    during: "Saat",
    post: "Pasca",
    profile: "Profil",
    quickAction: "Aksi Cepat",
    report: "Lapor",
    emergency: "Darurat",
    volunteer: "Relawan",
    education: "Edukasi",
    news: "Kabar & Aksi",
    donors: "Donatur Pahlawan",
    vision: "Visi & Misi",
    priority: "Prioritas Penanganan",
    settings: "Pengaturan",
    editProfile: "Edit Profil",
    language: "Bahasa",
    save: "Simpan",
    cancel: "Batal",
    changePhoto: "Ubah Foto",
    name: "Nama Lengkap",
    location: "Lokasi",
    logout: "Keluar"
  },
  en: {
    welcome: "Good Morning",
    home: "Home",
    pre: "Pre",
    during: "During",
    post: "Post",
    profile: "Profile",
    quickAction: "Quick Actions",
    report: "Report",
    emergency: "Emergency",
    volunteer: "Volunteer",
    education: "Education",
    news: "News & Action",
    donors: "Hero Donors",
    vision: "Vision & Mission",
    priority: "Priority Response",
    settings: "Settings",
    editProfile: "Edit Profile",
    language: "Language",
    save: "Save",
    cancel: "Cancel",
    changePhoto: "Change Photo",
    name: "Full Name",
    location: "Location",
    logout: "Log Out"
  },
  ar: {
    welcome: "صباح الخير",
    home: "الرئيسية",
    pre: "قبل",
    during: "أثناء",
    post: "بعد",
    profile: "الملف",
    quickAction: "إجراءات سريعة",
    report: "إبلاغ",
    emergency: "طوارئ",
    volunteer: "تطوع",
    education: "تعليم",
    news: "أخبار وعمل",
    donors: "الجهات المانحة",
    vision: "الرؤية والرسالة",
    priority: "أولوية الاستجابة",
    settings: "الإعدادات",
    editProfile: "تعديل الملف",
    language: "اللغة",
    save: "حفظ",
    cancel: "إلغاء",
    changePhoto: "تغيير الصورة",
    name: "الاسم الكامل",
    location: "الموقع",
    logout: "خروج"
  },
  zh: {
    welcome: "早上好",
    home: "首页",
    pre: "灾前",
    during: "灾中",
    post: "灾后",
    profile: "我的",
    quickAction: "快速行动",
    report: "报告",
    emergency: "紧急",
    volunteer: "志愿者",
    education: "教育",
    news: "新闻与行动",
    donors: "爱心捐赠",
    vision: "愿景与使命",
    priority: "优先响应",
    settings: "设置",
    editProfile: "编辑资料",
    language: "语言",
    save: "保存",
    cancel: "取消",
    changePhoto: "更改照片",
    name: "全名",
    location: "位置",
    logout: "登出"
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  
  // --- GLOBAL STATE ---
  const [language, setLanguage] = useState<Language>('id');
  const [user, setUser] = useState<User>({
    id: 'user-123',
    name: 'Rian Santoso',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
    location: 'Jakarta, Indonesia',
    role: 'User',
    points: 2450,
    badges: ['EcoGuardian Lvl 5']
  });

  // Global Donation History State (Synced between Home & PostDisaster)
  const [recentDonations, setRecentDonations] = useState([
    { id: 1, user: "Hamba Allah", amount: "Rp 500.000", target: "Korban Banjir Demak", time: "2m lalu", verified: true },
    { id: 2, user: "Budi Santoso", amount: "Rp 100.000", target: "Reboisasi Hutan", time: "5m lalu", verified: true },
    { id: 3, user: "Siti Aminah", amount: "Rp 250.000", target: "Dapur Umum", time: "12m lalu", verified: true },
    { id: 4, user: "PT. Sinergi", amount: "Rp 10.000.000", target: "Infrastruktur Jembatan", time: "1j lalu", verified: true },
    { id: 5, user: "Andi Wijaya", amount: "Rp 50.000", target: "Makanan Darurat", time: "2j lalu", verified: true },
    { id: 6, user: "Citra Lestari", amount: "Rp 1.000.000", target: "Air Bersih NTT", time: "3j lalu", verified: true },
    { id: 7, user: "Hamba Allah", amount: "Rp 200.000", target: "Obat-obatan", time: "5j lalu", verified: true },
  ]);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Navigation State
  const [preDisasterInitialTab, setPreDisasterInitialTab] = useState<'MENU' | 'ECO_REPORT' | 'ECO_LEARN' | 'ECO_GRAM'>('MENU');
  const [postDisasterInitialTab, setPostDisasterInitialTab] = useState<'MENU' | 'DONATE' | 'VOLUNTEER' | 'MIND_CARE' | 'DONOR_HISTORY'>('MENU');

  // Translation Helper
  const t = (key: keyof typeof translations['id']) => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('echoguard_session');
      if (session) {
        // In a real app, we would fetch fresh user data here
        setCurrentView(AppView.HOME);
      } else {
        setCurrentView(AppView.ONBOARDING);
      }
    };

    let timer: ReturnType<typeof setTimeout>;
    if (currentView === AppView.SPLASH) {
      timer = setTimeout(() => {
        checkSession();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [currentView]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!email || !password) {
        setAuthError('Email dan Kata Sandi wajib diisi.');
        return;
    }
    setIsAuthLoading(true);
    
    setTimeout(() => {
      setIsAuthLoading(false);
      localStorage.setItem('echoguard_session', 'token-123');
      setCurrentView(AppView.HOME);
    }, 1500); 
  };

  const handleLogout = () => {
    localStorage.removeItem('echoguard_session');
    setEmail('');
    setPassword('');
    setPreDisasterInitialTab('MENU');
    setPostDisasterInitialTab('MENU');
    setCurrentView(AppView.SPLASH);
  };

  const handleHomeNavigate = (view: AppView, subView?: string) => {
    setPreDisasterInitialTab('MENU');
    setPostDisasterInitialTab('MENU');

    if (view === AppView.PRE_DISASTER && subView) {
      setPreDisasterInitialTab(subView as any);
    }
    if (view === AppView.POST_DISASTER && subView) {
      setPostDisasterInitialTab(subView as any);
    }
    setCurrentView(view);
  };

  const handleBottomNav = (view: AppView) => {
    setPreDisasterInitialTab('MENU');
    setPostDisasterInitialTab('MENU');
    setCurrentView(view);
    setIsNavVisible(true);
  };

  const handleDonationSuccess = (donor: string, amount: string, campaign: string) => {
    // Add new donation to the global list
    const newDonation = { 
      id: Date.now(), 
      user: donor, 
      amount: amount, 
      target: campaign, 
      time: "Baru saja", 
      verified: true 
    };
    setRecentDonations(prev => [newDonation, ...prev]);
  };

  const getBackgroundGradient = () => {
    switch (currentView) {
      case AppView.DURING_DISASTER: return 'bg-gradient-to-br from-slate-100 via-red-50 to-orange-50';
      case AppView.POST_DISASTER: return 'bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-50';
      case AppView.AUTH: return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100';
      default: return 'bg-gradient-to-br from-[#C9F0C0] via-[#A4E4A0] to-[#5BB674]';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.SPLASH:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-emerald-500/30 animate-ripple"></div>
              <div className="absolute w-32 h-32 rounded-full border border-emerald-400/20 animate-ripple-delay"></div>
            </div>
            <div className="mb-8 relative z-10"><Logo size={120} className="drop-shadow-2xl" /></div>
            <h1 className="text-5xl font-black text-emerald-900 mb-2 tracking-tight z-10">EchoGuard</h1>
            <p className="text-emerald-800/80 font-medium tracking-wide z-10">Community Resilience Platform</p>
          </div>
        );
      case AppView.ONBOARDING:
        const slides = [
            { title: "Belajar dari Sejarah", desc: "Mengingat kembali dahsyatnya bencana masa lalu untuk membangun masa depan yang lebih waspada dan tangguh.", image: "https://image2url.com/images/1765785854601-a86907c4-9dd0-4278-8e6b-298d29e622c4.png" },
            { title: "Solidaritas Tanpa Batas", desc: "Ketika bencana melanda, kekuatan komunitas adalah pertahanan terbaik kita. Bersama kita saling menguatkan.", image: "https://image2url.com/images/1765786197086-ea1b8494-50c7-4472-94a4-058220d6c311.png" },
            { title: "Akses & Mitigasi", desc: "Informasi jalur evakuasi dan peringatan dini real-time untuk meminimalisir risiko saat alam tak bersahabat.", image: "https://image2url.com/images/1765786457235-e89c6898-ab1b-4213-80a3-f888c68db2d6.png" }
        ];
        return (
          <div className="h-full flex flex-col justify-between pt-0 animate-in slide-in-from-right duration-500 relative overflow-hidden bg-black">
             <div className="absolute inset-0 z-0"><img src={slides[onboardingStep].image} alt="Slide Background" className="w-full h-full object-cover opacity-80 transition-opacity duration-700"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div></div>
             <div className="relative z-10 flex flex-col h-full justify-end p-8 pb-12">
                <div className="mb-6">
                  <div className="inline-block p-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl mb-4"><Logo size={40} /></div>
                  <h2 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-md">{slides[onboardingStep].title}</h2>
                  <p className="text-slate-200 text-lg leading-relaxed drop-shadow-sm">{slides[onboardingStep].desc}</p>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex space-x-2 mb-4">{slides.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardingStep ? 'w-12 bg-emerald-500' : 'w-3 bg-white/30'}`} />))}</div>
                    <div className="flex justify-between items-center">
                        <button onClick={() => setCurrentView(AppView.AUTH)} className="text-white/70 font-bold text-sm px-4 py-2 hover:text-white transition-colors">Lewati</button>
                        <button onClick={() => { if (onboardingStep < slides.length - 1) setOnboardingStep(prev => prev + 1); else setCurrentView(AppView.AUTH); }} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-transform flex items-center gap-2 hover:bg-emerald-50">{onboardingStep === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'} <ArrowRight size={18} /></button>
                    </div>
                </div>
             </div>
          </div>
        );
      case AppView.AUTH:
        if (isAuthLoading) { return (<div className="h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl animate-in fade-in duration-300"><div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200"><Leaf size={48} className="text-emerald-600 animate-grow" fill="currentColor" fillOpacity={0.2} /></div><p className="text-emerald-800 font-bold animate-pulse">Menyiapkan akun Anda...</p></div>) }
        return (
           <div className="h-full flex flex-col justify-center p-6 animate-in zoom-in-95 duration-500 overflow-y-auto">
              <div className="mb-6 flex justify-center"><Logo size={80} /></div>
              <div className="glass-panel p-8 rounded-[2rem] shadow-2xl">
                 <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Selamat Datang</h2>
                 <p className="text-center text-slate-500 text-sm mb-6">Masuk untuk melanjutkan misi #JagaAlam</p>
                 <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-600 ml-1">Email</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/></div></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-600 ml-1">Kata Sandi</label><div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                    {authError && (<div className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{authError}</div>)}
                    <div className="flex justify-end"><button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Lupa Kata Sandi?</button></div>
                    <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95">Masuk</button>
                 </form>
                 <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300/50"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-transparent text-slate-500 backdrop-blur-md rounded">atau masuk dengan</span></div></div>
                 <div className="grid grid-cols-2 gap-3 mb-4"><button className="py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 flex justify-center items-center gap-2 shadow-sm hover:bg-slate-50 active:scale-95 transition-transform text-sm"><img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google</button><button className="py-2.5 bg-black text-white rounded-xl font-medium flex justify-center items-center gap-2 shadow-lg hover:bg-gray-800 active:scale-95 transition-transform text-sm">Apple</button></div>
                 <button onClick={() => { localStorage.setItem('echoguard_session', JSON.stringify({ name: 'Tamu', role: 'Guest' })); setCurrentView(AppView.HOME); }} className="w-full py-3 bg-transparent text-emerald-700 text-sm font-bold hover:bg-emerald-50 rounded-xl transition-colors">Masuk sebagai Tamu</button>
              </div>
           </div>
        );
      case AppView.HOME: 
        return (
          <HomeView 
            onNavigate={handleHomeNavigate} 
            user={user} 
            t={t} 
            recentDonations={recentDonations}
          />
        );
      case AppView.PRE_DISASTER: 
        return <PreDisasterView initialSubView={preDisasterInitialTab} onToggleNav={setIsNavVisible} />;
      case AppView.DURING_DISASTER: 
        return <DuringDisasterView onToggleNav={setIsNavVisible} />;
      case AppView.POST_DISASTER: 
        return (
          <PostDisasterView 
            initialSubView={postDisasterInitialTab} 
            onToggleNav={setIsNavVisible} 
            onDonationSuccess={handleDonationSuccess} 
            recentDonations={recentDonations}
          />
        );
      case AppView.PROFILE: 
        return (
          <ProfileView 
            user={user} 
            onUpdateUser={setUser} 
            language={language} 
            setLanguage={setLanguage} 
            t={t} 
            onLogout={handleLogout} 
          />
        );
      default: return <div>Not Found</div>;
    }
  };

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'} 
      className={`w-full h-screen overflow-hidden relative ${getBackgroundGradient()} transition-colors duration-1000`}
    >
      <style>{`
        @keyframes ripple-out { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(3); opacity: 0; } }
        .animate-ripple-out { animation: ripple-out 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes pulse-fast { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
      `}</style>

      {currentView !== AppView.ONBOARDING && (
        <>
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/20 rounded-full blur-[100px] animate-float pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-400/10 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />
        </>
      )}
      
      <div className="h-full w-full max-w-md mx-auto relative flex flex-col pt-safe-top pb-safe-bottom overflow-y-auto no-scrollbar">
         {currentView !== AppView.ONBOARDING && <div className="h-2 w-full flex-shrink-0" />}
         <div className="flex-1 relative z-10">
            {renderContent()}
         </div>
      </div>

      {isNavVisible && [AppView.SPLASH, AppView.ONBOARDING, AppView.AUTH].indexOf(currentView) === -1 && (
        <Navigation currentView={currentView} onNavigate={handleBottomNav} t={t} />
      )}
    </div>
  );
};

export default App;