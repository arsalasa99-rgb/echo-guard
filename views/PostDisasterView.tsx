import React, { useState, useEffect, useRef } from 'react';
import { Heart, Users, Smile, ArrowLeft, CheckCircle, CreditCard, Hand, ShieldCheck, Wallet, Banknote, Smartphone, X, Send, Video, Loader2, HandHeart, MapPin, Award, FileCheck, BrainCircuit, Mic, MicOff, VideoOff, PhoneOff, Upload, Repeat, ShoppingBag, ArrowLeftRight, History } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GoogleGenAI } from "@google/genai";

type SubView = 'MENU' | 'DONATE' | 'VOLUNTEER' | 'MIND_CARE' | 'DONOR_HISTORY';

interface PostDisasterViewProps {
  onToggleNav?: (visible: boolean) => void;
  onDonationSuccess?: (donor: string, amount: string, campaign: string) => void;
  initialSubView?: SubView;
  recentDonations?: any[];
}

export const PostDisasterView: React.FC<PostDisasterViewProps> = ({ onToggleNav, onDonationSuccess, initialSubView = 'MENU', recentDonations = [] }) => {
  const [subView, setSubView] = useState<SubView>(initialSubView);

  // Set subview if prop changes
  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);
  
  // -- DONATION STATE --
  const [activeDonation, setActiveDonation] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<0 | 1 | 2>(0); // 0: Select, 1: Processing, 2: Success
  const [donationAmount, setDonationAmount] = useState('50000');
  const [donorName, setDonorName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const donations = [
      { id: 1, title: "Bantuan Banjir Bandang Garut", gathered: "450jt", goal: "500jt", progress: 90, img: "https://images.unsplash.com/photo-1547683905-f686c993aee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "Raffi Ahmad" },
      { id: 2, title: "Rekonstruksi Sekolah Cianjur", gathered: "120jt", goal: "300jt", progress: 40, img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "Deddy Corbuzier" },
      { id: 3, title: "Makanan Darurat Semeru", gathered: "80jt", goal: "100jt", progress: 80, img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: false, influencer: null },
      { id: 4, title: "Air Bersih untuk NTT", gathered: "200jt", goal: "200jt", progress: 100, img: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "KitaBisa" },
      { id: 5, title: "Obat-obatan Gempa Mamuju", gathered: "50jt", goal: "150jt", progress: 33, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "IDI" },
      { id: 6, title: "Shelter Hewan Terdampak", gathered: "15jt", goal: "50jt", progress: 30, img: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: false, influencer: null },
      { id: 7, title: "Pendidikan Anak Pengungsi", gathered: "90jt", goal: "200jt", progress: 45, img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "RuangGuru" },
      { id: 8, title: "Dapur Umum Jakarta", gathered: "30jt", goal: "30jt", progress: 100, img: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "Chef Juna" },
      { id: 9, title: "Perahu Karet Evakuasi", gathered: "45jt", goal: "60jt", progress: 75, img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: true, influencer: "Basarnas" },
      { id: 10, title: "Selimut & Pakaian Bayi", gathered: "10jt", goal: "25jt", progress: 40, img: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", verified: false, influencer: null },
  ];

  // -- VOLUNTEER STATE --
  // 0: Dashboard (Positions & Leaderboard), 1: Form, 2: Sending, 3: Success
  const [volStep, setVolStep] = useState<0 | 1 | 2 | 3>(0); 
  const [selectedRole, setSelectedRole] = useState<any>(null);
  
  // Real Upload Simulation State
  const certInputRef = useRef<HTMLInputElement>(null);
  const [certFile, setCertFile] = useState<{name: string, size: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const volunteerPositions = [
    { id: 1, role: "Tim Medis Darurat", region: "Cianjur", quota: 5, filled: 3, cert: "STR Dokter/Perawat", urgency: "High" },
    { id: 2, role: "Logistik & Dapur", region: "Demak", quota: 20, filled: 12, cert: "Sertifikat Halal (Opsional)", urgency: "Medium" },
    { id: 3, role: "Trauma Healing", region: "Malang", quota: 8, filled: 7, cert: "Psikolog Klinis", urgency: "High" },
    { id: 4, role: "SAR & Evakuasi", region: "Padang", quota: 15, filled: 0, cert: "Basarnas Basic", urgency: "Critical" },
  ];

  const aiLeaderboard = [
    { name: "Dr. Sarah", role: "Medis", score: 98, status: "Verified Jury" },
    { name: "Budi Santoso", role: "SAR", score: 95, status: "Verified Jury" },
    { name: "Siti Aminah", role: "Dapur", score: 92, status: "AI Passed" },
  ];
  
  // -- MIND CARE STATE --
  const [mindChatOpen, setMindChatOpen] = useState(false);
  const [liveConsultOpen, setLiveConsultOpen] = useState(false); // New State for Live Video Call
  const [consultStatus, setConsultStatus] = useState<'CONNECTING' | 'WAITING' | 'CONNECTED'>('CONNECTING');
  
  const [chatMessages, setChatMessages] = useState<{sender: 'user'|'ai', text: string}[]>([
      {sender: 'ai', text: "Halo, saya asisten psikologi EchoGuard. Saya siap mendengarkan cerita Anda dengan sepenuh hati. Bagaimana perasaan Anda saat ini?"}
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const articles = [
      { id: 1, title: "Mengatasi Kecemasan Pasca Bencana", author: "Dr. Seto Mulyadi", img: "https://images.unsplash.com/photo-1499209971180-41def05018b7?auto=format&fit=crop&q=80" },
      { id: 2, title: "Trauma Healing untuk Anak", author: "Kak Seto", img: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80" },
      { id: 3, title: "Teknik Pernapasan untuk Tenang", author: "Psikolog Klinis", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80" },
      { id: 4, title: "Membangun Harapan Kembali", author: "Motivator", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80" },
      { id: 5, title: "Pentingnya Tidur Cukup", author: "Dr. Tirta", img: "https://images.unsplash.com/photo-1541781777631-fa182f3a4b78?auto=format&fit=crop&q=80" },
      { id: 6, title: "Nutrisi untuk Kesehatan Mental", author: "Ahli Gizi", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80" },
      { id: 7, title: "Support Group: Berbagi Cerita", author: "Komunitas", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80" },
      { id: 8, title: "Seni sebagai Terapi", author: "Art Therapist", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80" },
      { id: 9, title: "Menghadapi Kehilangan", author: "Psikolog Duka", img: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80" },
      { id: 10, title: "Kapan Harus ke Profesional?", author: "RSJ Indonesia", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80" },
  ];

  // Toggle navigation based on subview
  useEffect(() => {
    if (onToggleNav) {
      onToggleNav(subView === 'MENU');
    }
  }, [subView, onToggleNav]);

  // --- HANDLERS ---
  const handlePayment = () => {
      if (!selectedPaymentMethod) {
          alert('Pilih metode pembayaran terlebih dahulu');
          return;
      }

      setPaymentStep(1); // Processing
      setTimeout(() => {
          setPaymentStep(2); // Success
          
          if (onDonationSuccess && activeDonation) {
             const finalName = donorName.trim() || 'Hamba Allah';
             const finalAmount = donationAmount || '50000'; 
             // Format amount to Rp
             const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseInt(finalAmount));
             onDonationSuccess(finalName, formattedAmount, activeDonation.title);
          }
      }, 2000);
  };

  const resetPayment = () => {
      setPaymentStep(0);
      setShowPaymentModal(false);
      setActiveDonation(null);
      setDonationAmount('50000');
      setDonorName('');
      setSelectedPaymentMethod('');
  };

  const handleApplyVolunteer = (role: any) => {
      setSelectedRole(role);
      setCertFile(null);
      setUploadProgress(0);
      setVolStep(1); // Move to Form
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setCertFile({
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          });
          
          // Simulate Upload Progress
          setUploadProgress(0);
          const interval = setInterval(() => {
              setUploadProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      return 100;
                  }
                  return prev + 10; // Increment
              });
          }, 200);
      }
  };

  const handleVolunteerSubmit = () => {
      setVolStep(2); // Sending
      setTimeout(() => {
          setVolStep(3); // Success/Processing
          // Simulate AI Verification
      }, 2000);
  };

  const handleAiChat = async () => {
      if (!userInput.trim()) return;
      
      const newHistory = [...chatMessages, { sender: 'user', text: userInput }];
      setChatMessages(newHistory as any);
      setUserInput("");
      setIsAiTyping(true);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userInput,
            config: {
                systemInstruction: "Anda adalah 'EchoGuard Care', seorang psikolog profesional yang sangat empatik, sabar, dan menenangkan. Tugas Anda adalah memberikan dukungan emosional awal bagi korban bencana. Gunakan bahasa Indonesia yang hangat dan suportif. Jangan memberikan diagnosa medis, tapi validasi perasaan mereka. Jika situasi gawat darurat mental, sarankan bantuan profesional segera."
            }
          });
          
          if (response.text) {
              setChatMessages([...newHistory, { sender: 'ai', text: response.text }] as any);
          }
      } catch (e) {
          console.error(e);
          setChatMessages([...newHistory, { sender: 'ai', text: "Maaf, koneksi saya sedang tidak stabil. Tapi saya di sini bersama Anda." }] as any);
      } finally {
          setIsAiTyping(false);
      }
  };

  const startLiveConsult = () => {
      setLiveConsultOpen(true);
      setConsultStatus('CONNECTING');
      
      // Simulate Connection Flow
      setTimeout(() => setConsultStatus('WAITING'), 2000);
      setTimeout(() => setConsultStatus('CONNECTED'), 5000);
  };

  // --- RENDERERS ---

  const renderMenu = () => (
    <div className="px-2 pt-2">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-600 to-emerald-800 text-white p-6 shadow-xl mb-6">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <HandHeart size={16} className="text-lime-100" />
             </div>
             <span className="text-xs font-bold tracking-wider text-lime-100 uppercase">Fase Pasca-Bencana</span>
           </div>
           <h1 className="text-2xl font-black mb-2 leading-tight">Bangkit Bersama</h1>
           <p className="text-lime-100 text-sm leading-relaxed mb-4">
             Fokus pada pemulihan infrastruktur dan kesehatan mental. Mari saling bantu untuk pulih lebih cepat.
           </p>
           
           <div className="flex gap-3">
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold text-white">88%</p>
                <p className="text-[10px] opacity-80 text-lime-100">Target Donasi</p>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold text-white">450</p>
                <p className="text-[10px] opacity-80 text-lime-100">Relawan Baru</p>
             </div>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2 active:scale-[0.98] h-32" onClick={() => setSubView('DONATE')}>
             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                 <Heart size={24} />
             </div>
             <div className="text-center">
                 <h3 className="text-sm font-bold text-slate-800">EcoDonate</h3>
                 <p className="text-[9px] text-slate-500">Donasi</p>
             </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2 active:scale-[0.98] h-32" onClick={() => setSubView('VOLUNTEER')}>
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                 <Users size={24} />
             </div>
             <div className="text-center">
                 <h3 className="text-sm font-bold text-slate-800">Volunteer</h3>
                 <p className="text-[9px] text-slate-500">Relawan</p>
             </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2 active:scale-[0.98] h-32" onClick={() => setSubView('MIND_CARE')}>
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                 <Smile size={24} />
             </div>
             <div className="text-center">
                 <h3 className="text-sm font-bold text-slate-800">MindCare</h3>
                 <p className="text-[9px] text-slate-500">Healing</p>
             </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderDonate = () => (
      <div className="px-2 animate-in slide-in-from-right h-full overflow-y-auto pt-4 pb-20">
          <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 py-2">
            <button onClick={() => setSubView('MENU')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Donasi Terbuka ({donations.length})</h2>
          </div>

          <div className="grid gap-4">
              {donations.map((don) => (
                  <GlassCard key={don.id} className="p-0 overflow-hidden">
                      <div className="h-32 bg-slate-300 relative">
                          <img src={don.img} className="w-full h-full object-cover" alt={don.title} />
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                              <h3 className="text-white font-bold text-md leading-tight">{don.title}</h3>
                          </div>
                      </div>
                      <div className="p-3">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Terkumpul</span>
                              <span className="font-bold text-emerald-600">{don.gathered}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-emerald-500" style={{width: `${don.progress}%`}}></div>
                          </div>
                          <div className="flex justify-between items-center">
                               {don.influencer && (
                                   <div className="flex items-center gap-1">
                                       <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${don.title}`} /></div>
                                       <p className="text-[10px] text-slate-500">by <span className="font-bold text-slate-700">{don.influencer}</span></p>
                                       {don.verified && <ShieldCheck size={12} className="text-blue-500" fill="currentColor" color="white" />}
                                   </div>
                               )}
                               <button 
                                  onClick={() => { setActiveDonation(don); setShowPaymentModal(true); setDonationAmount('50000'); }}
                                  className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
                               >
                                   Donasi
                               </button>
                          </div>
                      </div>
                  </GlassCard>
              ))}
          </div>
      </div>
  );

  const renderDonorHistory = () => (
      <div className="px-2 animate-in slide-in-from-right h-full overflow-y-auto pt-4 pb-20">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 py-2">
            <div className="flex items-center gap-3">
                <button onClick={() => setSubView('MENU')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Riwayat Donatur</h2>
            </div>
            <button onClick={() => setSubView('DONATE')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                + Donasi Baru
            </button>
          </div>

          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 min-h-[50vh]">
              {recentDonations.length > 0 ? (
                  recentDonations.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border-b border-slate-50 last:border-none">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {item.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.user}</p>
                          {item.verified && <CheckCircle size={12} className="text-blue-500" fill="currentColor" color="white" />}
                        </div>
                        <p className="text-xs font-bold text-emerald-600">{item.amount}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">Untuk: {item.target}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                    </div>
                  ))
              ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <History size={32} className="mb-2 opacity-50"/>
                      <p>Belum ada data donasi.</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderPaymentModal = () => (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-in slide-in-from-bottom duration-300 relative overflow-hidden overflow-y-auto max-h-[90vh]">
             
             {paymentStep === 1 && (
                 <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
                     <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                     <p className="text-slate-500 font-bold animate-pulse">Memproses Pembayaran...</p>
                 </div>
             )}

             {paymentStep === 2 ? (
                 <div className="flex flex-col items-center py-8 animate-in zoom-in">
                     <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 relative">
                         <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                         <CheckCircle size={48} className="text-green-600" />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-800">Terima Kasih!</h2>
                     <p className="text-slate-500 text-center mb-6">
                        Donasi dari <b>{donorName || "Hamba Allah"}</b> sebesar <br/>
                        <span className="text-emerald-600 font-bold text-xl">Rp {parseInt(donationAmount).toLocaleString('id-ID')}</span> <br/>
                        telah berhasil disalurkan.
                     </p>
                     <div className="w-full bg-slate-50 p-4 rounded-xl text-center mb-4">
                         <p className="text-xs text-slate-400 uppercase tracking-wide">Metode Pembayaran</p>
                         <p className="font-bold text-slate-700">{selectedPaymentMethod}</p>
                     </div>
                     <button onClick={resetPayment} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">Tutup</button>
                 </div>
             ) : (
                 <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Detail Donasi</h3>
                        <button onClick={() => setShowPaymentModal(false)}><X size={20} /></button>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl mb-4 flex gap-3">
                        <img src={activeDonation?.img} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                            <p className="text-xs text-slate-500">Donasi untuk</p>
                            <p className="font-bold text-sm leading-tight line-clamp-2">{activeDonation?.title}</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">Nominal Donasi (Rp)</label>
                            <input 
                                type="number" 
                                value={donationAmount} 
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-emerald-600 text-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                            />
                            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                                {['10000', '20000', '50000', '100000'].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setDonationAmount(amt)}
                                        className={`px-3 py-1 text-xs rounded-full border ${donationAmount === amt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        {new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(Number(amt))}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">Nama Donatur (Opsional)</label>
                            <input 
                                type="text" 
                                value={donorName} 
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="Hamba Allah"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            />
                        </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-600 mb-3">Pilih Metode Pembayaran</h4>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {['GoPay', 'OVO', 'Dana', 'Shopee', 'BCA', 'Mandiri', 'BNI', 'QRIS'].map((method) => (
                            <button 
                                key={method} 
                                onClick={() => setSelectedPaymentMethod(method)}
                                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all active:scale-95 ${selectedPaymentMethod === method ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'hover:border-emerald-500 hover:bg-emerald-50'}`}
                            >
                                <Wallet size={20} className={`mb-1 ${selectedPaymentMethod === method ? 'text-emerald-600' : 'text-slate-600'}`} />
                                <span className={`text-[10px] font-bold ${selectedPaymentMethod === method ? 'text-emerald-700' : 'text-slate-700'}`}>{method}</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handlePayment} 
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform"
                    >
                        Bayar Sekarang
                    </button>
                 </>
             )}
          </div>
      </div>
  );

  const renderVolunteer = () => (
    <div className="px-2 animate-in slide-in-from-right h-full overflow-y-auto pt-4 pb-24">
         <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 py-2">
            <button onClick={() => {
                if(volStep > 0) setVolStep(0); // Back to list if in form
                else setSubView('MENU'); // Back to menu if in list
            }} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
                {volStep === 0 ? "Lowongan Relawan" : "Formulir Seleksi"}
            </h2>
         </div>

         {volStep === 0 && (
             <div className="space-y-6">
                 {/* Vacancies List */}
                 <div>
                     <h3 className="text-sm font-bold text-slate-600 mb-3 px-1 flex items-center gap-2">
                         <MapPin size={16}/> Wilayah Membutuhkan
                     </h3>
                     <div className="grid gap-3">
                         {volunteerPositions.map((pos) => (
                             <GlassCard key={pos.id} className="p-4" onClick={() => handleApplyVolunteer(pos)}>
                                 <div className="flex justify-between items-start mb-2">
                                     <div>
                                         <h4 className="font-bold text-slate-800">{pos.role}</h4>
                                         <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                             <MapPin size={10} /> {pos.region}
                                         </p>
                                     </div>
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${pos.urgency === 'Critical' ? 'bg-red-100 text-red-600' : pos.urgency === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {pos.urgency} Priority
                                     </span>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                                     <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                         <Users size={12} /> Quota: {pos.filled}/{pos.quota}
                                     </div>
                                     <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                         <FileCheck size={12} /> {pos.cert}
                                     </div>
                                 </div>
                                 <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md">
                                     Daftar Sekarang
                                 </button>
                             </GlassCard>
                         ))}
                     </div>
                 </div>

                 {/* Leaderboard */}
                 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                     <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                         <Award size={16} /> Lolos Seleksi AI & Juri
                     </h3>
                     <div className="space-y-3">
                         {aiLeaderboard.map((person, idx) => (
                             <div key={idx} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                         {idx + 1}
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold text-slate-800">{person.name}</p>
                                         <p className="text-[10px] text-slate-500">{person.role}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="flex items-center gap-1 justify-end text-emerald-600 font-bold text-xs">
                                         <BrainCircuit size={12} /> {person.score}% Match
                                     </div>
                                     <p className="text-[9px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                                         <ShieldCheck size={8} /> {person.status}
                                     </p>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <p className="text-[10px] text-indigo-400 mt-3 text-center">
                         *Seleksi diawasi ketat oleh tim ahli & sistem AI EchoGuard.
                     </p>
                 </div>
             </div>
         )}

         {volStep > 0 && (
             <div className="h-full flex flex-col pt-4">
                 {/* Success Animation */}
                 {volStep === 3 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
                              <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                              <CheckCircle size={48} className="text-green-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Terkirim!</h2>
                          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                              Sistem AI sedang menganalisis kecocokan profil Anda dengan kebutuhan di <b>{selectedRole?.region}</b>. Hasil akan muncul di Leaderboard dalam 24 jam.
                          </p>
                          <button onClick={() => setVolStep(0)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm">
                              Kembali ke Lowongan
                          </button>
                     </div>
                 ) : volStep === 2 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                         <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                         <h3 className="font-bold text-lg text-slate-700">Mengunggah Dokumen...</h3>
                         <p className="text-xs text-slate-400">Verifikasi sertifikat keahlian</p>
                     </div>
                 ) : (
                    <GlassCard className="p-5 space-y-4 animate-in slide-in-from-right">
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-2">
                            <p className="text-xs text-blue-800 font-bold">Mendaftar untuk: {selectedRole?.role} - {selectedRole?.region}</p>
                            <p className="text-[10px] text-blue-600 mt-1">Syarat Wajib: {selectedRole?.cert}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Data Diri Lengkap</label>
                            <input type="text" className="w-full p-3 rounded-xl bg-white/50 border border-white mb-2 text-sm" placeholder="Nama Lengkap (Sesuai KTP)" />
                            <input type="text" className="w-full p-3 rounded-xl bg-white/50 border border-white mb-2 text-sm" placeholder="NIK" />
                            <div className="flex gap-2">
                                 <input type="text" className="flex-1 p-3 rounded-xl bg-white/50 border border-white text-sm" placeholder="Gol. Darah" />
                                 <input type="text" className="flex-1 p-3 rounded-xl bg-white/50 border border-white text-sm" placeholder="Usia" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Upload Sertifikasi ({selectedRole?.cert})</label>
                            <input type="file" ref={certInputRef} className="hidden" onChange={handleCertUpload} accept=".pdf,.jpg,.jpeg,.png" />
                            
                            <div 
                                onClick={() => !certFile && certInputRef.current?.click()}
                                className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${certFile ? 'bg-emerald-50 border-emerald-300' : 'border-slate-300 bg-white/30 hover:bg-white/50 cursor-pointer'}`}
                            >
                                {certFile ? (
                                    <div className="w-full px-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <FileCheck size={20} className="text-emerald-600" />
                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{certFile.name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500">{certFile.size}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                                        </div>
                                        {uploadProgress < 100 && <p className="text-[9px] text-right mt-1 text-emerald-600 font-bold">Uploading {uploadProgress}%...</p>}
                                        {uploadProgress === 100 && (
                                            <button onClick={(e) => { e.stopPropagation(); setCertFile(null); }} className="text-[10px] text-red-500 font-bold mt-1 hover:underline">
                                                Hapus & Upload Ulang
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-slate-400 mb-1" />
                                        <span className="text-xs font-bold text-slate-600">Tap untuk Upload Dokumen</span>
                                        <span className="text-[9px] text-slate-400">PDF/JPG (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Ketersediaan & Kontak</label>
                            <select className="w-full p-3 rounded-xl bg-white/50 border border-white mb-2 text-sm text-slate-600">
                                <option>Siap Ditempatkan Dimana Saja</option>
                                <option>Hanya Area Jabodetabek</option>
                                <option>Hanya Akhir Pekan</option>
                            </select>
                            <input type="text" className="w-full p-3 rounded-xl bg-white/50 border border-white text-sm" placeholder="Kontak Darurat (Keluarga)" />
                        </div>

                        <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-2">
                            <CheckCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">Data Anda akan diverifikasi oleh AI dan Juri Ahli sebelum penugasan.</p>
                        </div>

                        <button onClick={handleVolunteerSubmit} disabled={!certFile || uploadProgress < 100} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                            Kirim Pendaftaran
                        </button>
                    </GlassCard>
                 )}
             </div>
         )}
    </div>
  );

  const renderLiveConsultModal = () => (
      <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top bg-gradient-to-b from-black/60 to-transparent z-20 flex justify-between items-start">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                 </div>
                 <div>
                     <h3 className="font-bold text-white text-sm shadow-black drop-shadow-md">Dr. Karina, M.Psi</h3>
                     <p className="text-white/80 text-xs flex items-center gap-1">
                         {consultStatus === 'CONNECTED' ? <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> : <Loader2 size={10} className="animate-spin" />}
                         {consultStatus === 'CONNECTED' ? '00:45' : consultStatus === 'WAITING' ? 'Menunggu...' : 'Menghubungkan...'}
                     </p>
                 </div>
             </div>
             <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold border border-white/10">
                 LIVE
             </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 relative bg-slate-800 flex items-center justify-center overflow-hidden">
             {consultStatus === 'CONNECTED' ? (
                 <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-90" />
             ) : (
                 <div className="flex flex-col items-center justify-center p-8 text-center">
                     <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 relative">
                         <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                         <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80" className="w-20 h-20 rounded-full object-cover opacity-50" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">
                         {consultStatus === 'WAITING' ? "Menunggu Dr. Karina..." : "Menghubungkan..."}
                     </h3>
                     <p className="text-slate-400 text-sm">
                         {consultStatus === 'WAITING' ? "Anda berada di antrian nomor 1" : "Mempersiapkan sesi aman terenkripsi"}
                     </p>
                 </div>
             )}
             
             {/* Self View */}
             <div className="absolute bottom-24 right-4 w-28 h-40 bg-black/50 rounded-xl border border-white/20 overflow-hidden shadow-xl z-20">
                 <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" />
                 <div className="absolute bottom-1 right-1">
                     <MicOff size={12} className="text-red-500" />
                 </div>
             </div>
          </div>

          {/* Controls */}
          <div className="p-6 pb-8 bg-slate-900 flex justify-center items-center gap-6">
              <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  <VideoOff size={24} />
              </button>
              <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  <Mic size={24} />
              </button>
              <button onClick={() => { setLiveConsultOpen(false); setConsultStatus('CONNECTING'); }} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/50 active:scale-95">
                  <PhoneOff size={32} />
              </button>
          </div>
      </div>
  );

  const renderMindCare = () => (
      <div className="px-2 animate-in slide-in-from-right h-full overflow-y-auto pt-4 pb-20">
         <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSubView('MENU')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">MindCare</h2>
         </div>

         <div className="space-y-4 pb-10">
             {/* AI Chat Entry */}
             <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl text-white shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-transform" onClick={() => setMindChatOpen(true)}>
                 <div className="relative z-10">
                     <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Smile /> Teman Cerita AI</h3>
                     <p className="text-purple-100 text-xs leading-relaxed max-w-[80%]">
                         Merasa cemas atau takut? Ceritakan pada asisten psikolog AI kami yang siap mendengar 24/7.
                     </p>
                     <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold border border-white/30 hover:bg-white/30 transition-colors">Mulai Chat</button>
                 </div>
                 <div className="absolute right-[-20px] bottom-[-20px] opacity-20"><Smile size={120} /></div>
             </div>

             {/* Live Psychologist Simulation */}
             <div className="p-4 bg-white border border-purple-100 rounded-2xl flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                         <Video size={20} className="text-green-600" />
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-800 text-sm">Konseling Live</h3>
                         <p className="text-[10px] text-slate-500">Dr. Karina (Online) • Antrian: 2</p>
                     </div>
                 </div>
                 <button onClick={startLiveConsult} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors active:scale-95">
                     Gabung
                 </button>
             </div>

             <h3 className="font-bold text-slate-700 mt-2 text-sm">Artikel Pemulihan ({articles.length})</h3>
             {articles.map((item) => (
                 <GlassCard key={item.id} className="p-3 flex gap-3 active:scale-[0.99]" onClick={() => setActiveArticle(item)}>
                     <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0 overflow-hidden">
                         <img src={item.img} className="w-full h-full object-cover"/>
                     </div>
                     <div>
                         <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                         <p className="text-[10px] text-slate-500 mt-1">{item.author} • 5 Min Baca</p>
                         <span className="text-[10px] text-purple-600 font-bold mt-1 block">Baca Selengkapnya</span>
                     </div>
                 </GlassCard>
             ))}
         </div>
      </div>
  );

  const renderAiChatModal = () => (
      <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 bg-purple-600 text-white flex items-center justify-between pt-safe-top">
              <div className="flex items-center gap-3">
                  <button onClick={() => setMindChatOpen(false)}><ArrowLeft /></button>
                  <div>
                      <h3 className="font-bold">Psikolog AI</h3>
                      <p className="text-xs text-purple-200">Selalu ada untuk Anda</p>
                  </div>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white shadow-sm text-slate-800 rounded-tl-none'}`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isAiTyping && <div className="text-xs text-slate-400 ml-4 animate-pulse">Sedang mengetik...</div>}
          </div>
          <div className="p-3 bg-white border-t flex gap-2 mb-safe-bottom">
              <input 
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                 placeholder="Ceritakan apa yang Anda rasakan..." 
                 className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 border border-slate-200" 
              />
              <button onClick={handleAiChat} className="p-2 bg-purple-600 rounded-full text-white active:scale-95 transition-transform"><Send size={18} /></button>
          </div>
      </div>
  );

  const renderArticleModal = () => (
      <div className="fixed inset-0 z-[70] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
           <div className="relative h-64">
               <img src={activeArticle.img} className="w-full h-full object-cover" />
               <button onClick={() => setActiveArticle(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white"><ArrowLeft /></button>
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent pt-20"></div>
           </div>
           <div className="px-6 pb-20 -mt-8 relative z-10">
               <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full mb-2 inline-block">Mental Health</span>
               <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{activeArticle.title}</h1>
               <div className="flex items-center gap-2 mb-6">
                   <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${activeArticle.author}`} /></div>
                   <p className="text-xs text-slate-500 font-bold">{activeArticle.author}</p>
               </div>
               
               <div className="prose prose-sm text-slate-600 leading-relaxed">
                   <p className="mb-4 font-medium text-lg">Bencana alam tidak hanya meninggalkan kerusakan fisik, tetapi juga luka batin yang mendalam. Berikut adalah cara untuk mulai pulih.</p>
                   <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                   <h3 className="font-bold text-slate-900 text-lg mb-2">1. Validasi Perasaan Anda</h3>
                   <p className="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                   <p>Jika perasaan cemas berlanjut lebih dari 2 minggu dan mengganggu aktivitas, segera hubungi profesional.</p>
                   
                   <h3 className="font-bold text-slate-900 text-lg mb-2 mt-6">2. Cari Dukungan Sosial</h3>
                   <p className="mb-4">Jangan mengisolasi diri. Berbicara dengan orang lain yang mengalami hal serupa dapat membantu Anda merasa tidak sendirian.</p>
               </div>
           </div>
      </div>
  );

  return (
    <div className="pb-24 h-full">
       {showPaymentModal && renderPaymentModal()}
       {mindChatOpen && renderAiChatModal()}
       {liveConsultOpen && renderLiveConsultModal()}
       {activeArticle && renderArticleModal()}
       
       {subView === 'MENU' && renderMenu()}
       {subView === 'DONATE' && renderDonate()}
       {subView === 'VOLUNTEER' && renderVolunteer()}
       {subView === 'MIND_CARE' && renderMindCare()}
       {subView === 'DONOR_HISTORY' && renderDonorHistory()}
    </div>
  );
};