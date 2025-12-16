import React, { useState } from 'react';
import { CloudRain, AlertTriangle, ArrowRight, Shield, ChevronRight, Activity, BellRing, Heart, Zap, Navigation, MapPin, Droplets, Wind, Target, TreePine, GraduationCap, HandCoins, Megaphone, ChevronDown, ChevronUp, CheckCircle, TrendingUp, Leaf, Users, Sun, Recycle, Sprout, PawPrint } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AppView, User } from '../types';

interface HomeViewProps {
  onNavigate: (view: AppView, subView?: string) => void;
  user: User;
  t: (key: string) => string;
  recentDonations: any[];
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, user, t, recentDonations }) => {
  const [isVisionExpanded, setIsVisionExpanded] = useState(false);

  // 1. Data Visi & Misi
  const missions = [
    { id: 1, text: "Mengintegrasikan data berbasis bukti untuk mitigasi bencana presisi.", icon: Activity },
    { id: 2, text: "Mempercepat transisi energi bersih di tingkat komunitas lokal.", icon: Zap },
    { id: 3, text: "Membangun ekosistem digital untuk edukasi iklim yang inklusif.", icon: GraduationCap },
    { id: 4, text: "Menggalang solidaritas sosial dalam pemulihan pasca-bencana.", icon: Heart },
    { id: 5, text: "Mendorong inovasi teknologi hijau untuk pemulihan lingkungan.", icon: TreePine },
  ];

  // 2. Data Iklan Slide (Campaigns) - Diupdate menjadi 10 konten visual
  const promoSlides = [
    { 
      id: 1, 
      title: "Siaga Banjir Bandang", 
      desc: "Panduan evakuasi dini & tas siaga bencana.", 
      image: "https://bpbd.tasikmalayakota.go.id/wp-content/uploads/2018/02/05122017-siaga-bencana-banjir-1.jpg",
      icon: AlertTriangle,
      color: "bg-red-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_LEARN')
    },
    { 
      id: 2, 
      title: "Aksi Bersih Sungai", 
      desc: "Gabung relawan minggu ini di Ciliwung!", 
      image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=600",
      icon: Leaf,
      color: "bg-emerald-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_REPORT')
    },
    { 
      id: 3, 
      title: "Adopsi 1 Pohon", 
      desc: "Donasi Rp 50rb untuk hutan Kalimantan.", 
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
      icon: TreePine,
      color: "bg-green-600",
      action: () => onNavigate(AppView.POST_DISASTER, 'DONATE')
    },
    { 
      id: 4, 
      title: "Energi Matahari", 
      desc: "Workshop panel surya hemat biaya untuk desa.", 
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600",
      icon: Sun,
      color: "bg-yellow-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_LEARN')
    },
    { 
      id: 5, 
      title: "Stop Plastik Sekali Pakai", 
      desc: "Tantangan 30 hari tanpa sedotan plastik.", 
      image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
      icon: Recycle,
      color: "bg-blue-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_GRAM')
    },
    { 
      id: 6, 
      title: "Jadi Relawan Bencana", 
      desc: "Daftarkan dirimu untuk tim gerak cepat.", 
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=600",
      icon: Users,
      color: "bg-orange-500",
      action: () => onNavigate(AppView.POST_DISASTER, 'VOLUNTEER')
    },
    { 
      id: 7, 
      title: "Urban Farming", 
      desc: "Menanam sayur di lahan sempit perkotaan.", 
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600",
      icon: Sprout,
      color: "bg-lime-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_LEARN')
    },
    { 
      id: 8, 
      title: "Selamatkan Penyu", 
      desc: "Kampanye pelestarian habitat pesisir.", 
      image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=600",
      icon: PawPrint,
      color: "bg-teal-500",
      action: () => onNavigate(AppView.POST_DISASTER, 'DONATE')
    },
    { 
      id: 9, 
      title: "Jejak Karbonmu", 
      desc: "Hitung dan kurangi emisi harianmu di sini.", 
      image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&q=80&w=600",
      icon: Activity,
      color: "bg-purple-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_LEARN')
    },
    { 
      id: 10, 
      title: "Konservasi Air", 
      desc: "Teknologi panen hujan untuk musim kemarau.", 
      image: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80&w=600",
      icon: Droplets,
      color: "bg-cyan-500",
      action: () => onNavigate(AppView.PRE_DISASTER, 'ECO_LEARN')
    },
  ];

  // --- RENDER SECTIONS ---

  const renderVisionMission = () => (
    <div className="mb-6 animate-in slide-in-from-top duration-500">
      <GlassCard className="p-0 overflow-hidden border-yellow-400/30 relative">
        {/* Decorative Gold Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300"></div>
        
        <div className="p-4 cursor-pointer" onClick={() => setIsVisionExpanded(!isVisionExpanded)}>
          <div className="flex justify-between items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0 border border-yellow-200">
              <Target size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-1">Visi Indonesia Emas 2045</h3>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                “Strategi Transisi Rendah Karbon dan Adaptasi Iklim Berbasis Bukti untuk Memperkuat Ketahanan Ekologi.”
              </p>
            </div>
            <div className="text-slate-400">
              {isVisionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* Expandable Missions */}
        {isVisionExpanded && (
          <div className="px-4 pb-4 pt-0 bg-yellow-50/30 border-t border-yellow-100/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mt-3 mb-2 ml-1">5 Misi Utama:</h4>
            <div className="space-y-2">
              {missions.map((m) => (
                <div key={m.id} className="flex gap-3 items-center bg-white/60 p-2 rounded-lg border border-white/50">
                  <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
                    <m.icon size={12} />
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-tight">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );

  const renderPromoSlider = () => (
    <div className="mb-6">
      <h3 className="font-bold text-slate-800 mb-3 px-1 flex items-center gap-2">
        <Megaphone size={16} className="text-emerald-600"/> Kabar & Aksi
      </h3>
      <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
        {promoSlides.map((slide) => (
          <div 
            key={slide.id} 
            onClick={slide.action}
            className="snap-center flex-shrink-0 w-[85%] h-44 rounded-2xl relative overflow-hidden shadow-lg group active:scale-95 transition-transform cursor-pointer"
          >
            {/* Background Image */}
            <img src={slide.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg backdrop-blur-md ${slide.color} bg-opacity-80`}>
                  <slide.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">Featured</span>
              </div>
              
              <div>
                <h4 className="font-black text-xl leading-tight mb-1 shadow-black drop-shadow-md">{slide.title}</h4>
                <p className="text-xs font-medium opacity-90 line-clamp-2 text-slate-200">{slide.desc}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                    Lihat Detail <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatusWidget = () => (
    <GlassCard className="p-5 mb-6 relative overflow-hidden bg-gradient-to-br from-white/90 to-white/60 border-white/60 shadow-lg">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <MapPin size={12} className="text-red-500" /> {user.location}
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">28°C</h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-700 text-[10px] font-bold">
               <CloudRain size={12} /> Hujan
             </div>
             <div className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded text-cyan-700 text-[10px] font-bold">
               <Droplets size={12} /> 82%
             </div>
             <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-600 text-[10px] font-bold">
               <Wind size={12} /> 12km/h
             </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm border border-emerald-200">
            <Shield size={12} fill="currentColor" /> AMAN
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">Updated: Live</p>
        </div>
      </div>
    </GlassCard>
  );

  const renderDonationTransparency = () => (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-3 px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600"/> Transparansi Donasi
        </h3>
        <span className="text-[10px] text-slate-400 flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Updates</span>
      </div>
      
      <div className="bg-slate-100/50 p-1 rounded-2xl">
        <div className="flex overflow-x-auto gap-3 p-2 no-scrollbar snap-x">
          {recentDonations.slice(0, 5).map((item) => (
            <div key={item.id} className="snap-center flex-shrink-0 w-64 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                {item.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.user}</p>
                  {item.verified && <CheckCircle size={10} className="text-blue-500" fill="currentColor" color="white" />}
                </div>
                <p className="text-xs font-bold text-emerald-600">{item.amount}</p>
                <p className="text-[9px] text-slate-400 truncate">u/ {item.target} • {item.time}</p>
              </div>
            </div>
          ))}
          
          {/* Card 'Lihat Semua' mengarah ke Riwayat Donatur */}
          <div className="snap-center flex-shrink-0 w-24 bg-slate-200/50 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer active:scale-95 transition-transform" onClick={() => onNavigate(AppView.POST_DISASTER, 'DONOR_HISTORY')}>
             <ArrowRight size={20} />
             <span className="text-[10px] font-bold mt-1">Lihat Semua</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-24 h-full overflow-y-auto no-scrollbar pt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-slate-500 text-xs font-medium mb-0.5">{t('welcome')},</p>
          <h1 className="text-2xl font-black text-slate-800">{user.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 relative shadow-sm">
             <BellRing size={18} />
             <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
           </div>
           <div 
             className="w-10 h-10 rounded-full p-0.5 border-2 border-emerald-500 cursor-pointer"
             onClick={() => onNavigate(AppView.PROFILE)}
           >
             <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
           </div>
        </div>
      </div>

      {/* 1. Widget Cuaca Paling Atas */}
      {renderStatusWidget()}

      {/* 2. Kabar & Aksi (Visual Ads) */}
      {renderPromoSlider()}

      {/* 3. Transparansi Donasi (Tampil di atas Visi Misi) */}
      {renderDonationTransparency()}

      {/* 4. Visi & Misi (Paling Bawah) */}
      {renderVisionMission()}

      {/* Banner dihapus sesuai permintaan */}
    </div>
  );
};