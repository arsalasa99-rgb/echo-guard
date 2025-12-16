import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Tag, UploadCloud, Book, Info, ArrowLeft, Share2, Heart, MessageCircle, Bookmark, MoreHorizontal, ShieldAlert, Leaf, X, Send, Play, Wand2, User, Mic, Volume2, Check, Loader2, StopCircle, CheckCircle as CheckCircleIcon, ImagePlus, Image as ImageIcon, Paintbrush, Plus, Search, TrendingUp, Repeat, Video as VideoIcon, Film, Trash2, History, Clock, Filter, Copy, Facebook, Twitter, Instagram, Link2, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GoogleGenAI, Modality } from "@google/genai";

type SubView = 'MENU' | 'ECO_REPORT' | 'ECO_LEARN' | 'ECO_GRAM' | 'REPORT_HISTORY';

interface PreDisasterViewProps {
  initialSubView?: SubView;
  onToggleNav?: (visible: boolean) => void;
}

export const PreDisasterView: React.FC<PreDisasterViewProps> = ({ initialSubView = 'MENU', onToggleNav }) => {
  const [subView, setSubView] = useState<SubView>(initialSubView);
  
  // Set subview if prop changes
  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  // Toggle navigation based on subview
  useEffect(() => {
    if (onToggleNav) {
      onToggleNav(subView === 'MENU');
    }
  }, [subView, onToggleNav]);

  // --- ECO REPORT STATE ---
  const [submissionStep, setSubmissionStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const isSubmitting = submissionStep > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [reportForm, setReportForm] = useState({
    description: '',
    location: '',
    category: 'Penebangan Liar',
    details: '',
    image: null as string | null
  });
  
  const [reportHistory, setReportHistory] = useState([
    { id: 101, category: 'Sampah Ilegal', location: 'Jl. Merdeka No. 10', date: '2 hari lalu', status: 'Resolved', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=200' },
    { id: 102, category: 'Penebangan Liar', location: 'Hutan Mangrove PIK', date: '5 hari lalu', status: 'Verified', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200' },
  ]);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Map Simulation State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'EXTRACTING' | 'LOCKED'>('IDLE');

  // --- ECO GRAM STATE ---
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // New Post State
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [newPostMediaType, setNewPostMediaType] = useState<'image' | 'video' | null>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const postVideoInputRef = useRef<HTMLInputElement>(null);

  // Image Generation State (Keeping existing logic)
  const [genPrompt, setGenPrompt] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  // Interactions State
  const [activeChat, setActiveChat] = useState<any>(null);
  const [activeComments, setActiveComments] = useState<any>(null); 
  const [commentInput, setCommentInput] = useState('');
  const [commentsRegistry, setCommentsRegistry] = useState<Record<number, any[]>>({});
  const [openMenuPostId, setOpenMenuPostId] = useState<number | null>(null); 

  // FEED STATE - Populated with 10 relevant posts with Visuals
  const [feed, setFeed] = useState<any[]>([
    { 
      id: 1, 
      type: 'Banjir', 
      status: 'Urgent',
      user: "BPBD DKI Jakarta", 
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100", 
      location: "Manggarai, Jakarta Selatan", 
      image: "https://ichef.bbci.co.uk/live-experience/cps/1024/cpsprodpb/EFFA/production/_104943416_gettyimages-1074741484.jpg", 
      likes: 2450, 
      caption: "🚨 Peringatan Dini: Kondisi terkini pasca banjir bandang. Tim evakuasi sedang menyisir area terdampak.", 
      comments: 340, 
      time: "15m", 
      isVerified: true, 
      isLiked: false 
    },
    { 
      id: 2, 
      type: 'Banjir', 
      status: 'Urgent',
      user: "Info Jakarta", 
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100", 
      location: "Bundaran HI, Jakarta", 
      image: "https://asset.kompas.com/crops/UVzNSThO4XHyZ0MidayW1eZALrQ=/0x0:0x0/1200x800/data/photo/2013/01/18/1101093-set-kawasan-bundaran-hotel-indonesia-dan-jalan-mh-thamrin-jakarta-terendam-banjir-p.jpg", 
      likes: 15400, 
      caption: "Banjir besar melumpuhkan aktivitas di pusat kota. Harap hindari ruas jalan protokol.", 
      comments: 2100, 
      time: "1j", 
      isVerified: true, 
      isLiked: true 
    },
    { 
      id: 3, 
      type: 'Gunung Api', 
      status: 'Urgent',
      user: "PVMBG", 
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100", 
      location: "Kabupaten Karo, Sumut", 
      image: "https://4.bp.blogspot.com/-ed2YZfrNxOw/XAu6mUOVzbI/AAAAAAAABRk/r0VqGYvGP8kZ0orSNxxx8H9sNDIytI0_wCLcBGAs/w1200-h630-p-k-no-nu/b8f878c5-akibat-gunung-sinabung-meletus.jpg", 
      likes: 890, 
      caption: "Erupsi Gunung Sinabung kembali terjadi pagi ini. Zona merah diperluas hingga radius 5km.", 
      comments: 120, 
      time: "2j", 
      isVerified: true, 
      isLiked: false 
    },
    { 
      id: 4, 
      type: 'Banjir', 
      status: 'Open',
      user: "Warga Sekitar", 
      avatar: "https://i.pravatar.cc/150?img=11", 
      location: "Pemukiman Warga", 
      image: "https://img.okezone.com/content/2020/06/30/337/2239141/1-549-bencana-alam-terjadi-di-indonesia-hingga-akhir-juni-2020-t6EChmSJcq.jpg", 
      likes: 120, 
      caption: "Air mulai naik setinggi lutut orang dewasa. Mohon bantuan perahu karet untuk evakuasi lansia.", 
      comments: 45, 
      time: "3j", 
      isVerified: false, 
      isLiked: true 
    },
    { 
      id: 5, 
      type: 'Banjir', 
      status: 'Resolved',
      user: "Relawan Bengkulu", 
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100", 
      location: "Bengkulu", 
      image: "https://asset.kompas.com/crop/0x12:946x643/750x500/data/photo/2019/04/28/2665968412.jpg", 
      likes: 3400, 
      caption: "Distribusi logistik ke area terisolir berhasil dilakukan. Terima kasih para donatur!", 
      comments: 156, 
      time: "4j", 
      isVerified: false, 
      isLiked: true 
    },
    { 
      id: 6, 
      type: 'Gempa', 
      status: 'Urgent',
      user: "Arsip Bencana", 
      avatar: "https://i.pravatar.cc/150?img=5", 
      location: "Aceh", 
      image: "https://cdn.idntimes.com/content-images/community/2017/12/25008703-315856725594153-745518022352961536-n-f41345404283b786a67d9902f30191f3_600x400.jpg", 
      likes: 5600, 
      caption: "Mengenang dahsyatnya Tsunami Aceh. Mari terus tingkatkan kesiapsiagaan bencana.", 
      comments: 890, 
      time: "5j", 
      isVerified: true, 
      isLiked: true 
    },
    { 
      id: 7, 
      type: 'Longsor', 
      status: 'Urgent',
      user: "SAR Jawa Tengah", 
      avatar: "https://i.pravatar.cc/150?img=8", 
      location: "Banjarnegara", 
      image: "https://asset-2.tstatic.net/jateng/foto/bank/images/Kondisi-banjir-bandang-dan-tanah-longsor-d.jpg", 
      likes: 450, 
      caption: "Tanah longsor menutup akses jalan utama. Alat berat sedang dikerahkan.", 
      comments: 67, 
      time: "6j", 
      isVerified: true, 
      isLiked: false 
    },
    { 
      id: 8, 
      type: 'Banjir', 
      status: 'Open',
      user: "Info Kaltim", 
      avatar: "https://i.pravatar.cc/150?img=12", 
      location: "Samarinda", 
      image: "https://kaltimtoday.co/wp-content/uploads/2020/06/shns.jpg", 
      likes: 230, 
      caption: "Hujan deras sejak semalam menyebabkan banjir merendam beberapa ruas jalan di Samarinda.", 
      comments: 34, 
      time: "7j", 
      isVerified: false, 
      isLiked: false 
    },
    { 
      id: 9, 
      type: 'Kerusakan', 
      status: 'Open',
      user: "Laporan Warga", 
      avatar: "https://i.pravatar.cc/150?img=15", 
      location: "Desa Sukamaju", 
      image: "https://lh7-us.googleusercontent.com/docsz/AD_4nXe8auxPzhzPQXZ_QjJ9e6tKhdjjfw4t6dq0YxilOmVD3OCiMnnjGGaJ-wM-guHSBCJew79DwfdmeTWclRFa1Z1Dr9Wt5AEMNwZeordm-1ERYoBGQ7_bPfqvXe0TSLhPjBz5nMIV68Ee45XQuSWQm0nbv9rx?key=0v0Df8gcJsXwhuTTREuWPQ", 
      likes: 120, 
      caption: "Jembatan penghubung desa putus diterjang arus sungai. Mohon segera diperbaiki.", 
      comments: 22, 
      time: "8j", 
      isVerified: false, 
      isLiked: false 
    },
    { 
      id: 10, 
      type: 'Gempa', 
      status: 'Resolved',
      user: "Sejarah Bencana", 
      avatar: "https://i.pravatar.cc/150?img=20", 
      location: "Palu", 
      image: "https://yoexplore.co.id/wp-content/uploads/2019/02/bencana-alam-terbesar-di-Indonesia-yoexplore-tribunbali-e1551163308469.jpg", 
      likes: 3200, 
      caption: "Refleksi bencana gempa Palu. Pentingnya konstruksi tahan gempa.", 
      comments: 450, 
      time: "9j", 
      isVerified: true, 
      isLiked: true 
    },
  ]);
  
  // --- ECO LEARN STATE ---
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [learnTab, setLearnTab] = useState<'ALL' | 'MUST' | 'REC' | 'OPT'>('ALL');

  const learningModules = [
      // --- WAJIB DIKETAHUI (CRITICAL) ---
      { id: 1, title: "Mitigasi Gempa Bumi", priority: 'MUST', category: "Dasar", duration: "10:25", thumbnail: "https://i.ytimg.com/vi/vbxA4dhqdWE/maxresdefault.jpg", views: "12k" },
      { id: 3, title: "P3K Dasar Bencana", priority: 'MUST', category: "Kesehatan", duration: "08:45", thumbnail: "https://tse1.mm.bing.net/th/id/OIP.dAna4R9qdJfF2i7RA4eYFQHaGN?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3", views: "20k" },
      { id: 4, title: "Mengenal Tanda Tsunami", priority: 'MUST', category: "Maritim", duration: "12:10", thumbnail: "https://asset.kompas.com/crops/pZOjFSSYn72S8Urz5hVcLmzZYM0=/17x0:1880x1242/750x500/data/photo/2019/09/29/5d9066af46ff5.jpg", views: "45k" },
      { id: 5, title: "Teknik Evakuasi Banjir", priority: 'MUST', category: "Hidrologi", duration: "09:30", thumbnail: "https://i.ytimg.com/vi/EB59prLcjQU/maxresdefault.jpg", views: "5k" },
      { id: 11, title: "RJP / CPR Jantung", priority: 'MUST', category: "Medis", duration: "15:00", thumbnail: "https://img.youtube.com/vi/8Y_Wn_i5t2c/maxresdefault.jpg", views: "8k" },
      { id: 12, title: "Listrik Saat Banjir", priority: 'MUST', category: "Keselamatan", duration: "05:20", thumbnail: "https://img.youtube.com/vi/a1b2c3d4e5f/maxresdefault.jpg", views: "15k" },
      { id: 13, title: "Cara Pakai APAR", priority: 'MUST', category: "Kebakaran", duration: "06:10", thumbnail: "https://img.youtube.com/vi/gH1j2k3l4m5/maxresdefault.jpg", views: "22k" },
      { id: 14, title: "Tas Siaga Bencana", priority: 'MUST', category: "Persiapan", duration: "11:45", thumbnail: "https://img.youtube.com/vi/n0p1q2r3s4t/maxresdefault.jpg", views: "30k" },

      // --- DISARANKAN TAHU (RECOMMENDED) ---
      { id: 2, title: "Pengelolaan Sampah 3R", priority: 'REC', category: "Lingkungan", duration: "15:00", thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400", views: "8.5k" },
      { id: 15, title: "Filter Air Sederhana", priority: 'REC', category: "Survival", duration: "08:15", thumbnail: "https://img.youtube.com/vi/u1v2w3x4y5z/maxresdefault.jpg", views: "4k" },
      { id: 16, title: "Pertolongan Hipotermia", priority: 'REC', category: "Medis", duration: "10:00", thumbnail: "https://img.youtube.com/vi/7a8b9c0d1e2/maxresdefault.jpg", views: "3.2k" },
      { id: 17, title: "Evakuasi Hewan Peliharaan", priority: 'REC', category: "Logistik", duration: "07:30", thumbnail: "https://img.youtube.com/vi/4f5g6h7i8j9/maxresdefault.jpg", views: "6k" },
      { id: 18, title: "Kenali Tanda Longsor", priority: 'REC', category: "Geologi", duration: "06:45", thumbnail: "https://img.youtube.com/vi/1a2b3c4d5e6/maxresdefault.jpg", views: "9k" },
      { id: 19, title: "Komunikasi Darurat (HT)", priority: 'REC', category: "Teknis", duration: "12:20", thumbnail: "https://img.youtube.com/vi/2b3c4d5e6f7/maxresdefault.jpg", views: "2.5k" },
      { id: 20, title: "Simpul Tali Temali Dasar", priority: 'REC', category: "Survival", duration: "14:10", thumbnail: "https://img.youtube.com/vi/3c4d5e6f7g8/maxresdefault.jpg", views: "11k" },
      { id: 21, title: "Menanam Mangrove", priority: 'REC', category: "Ekologi", duration: "09:50", thumbnail: "https://img.youtube.com/vi/4d5e6f7g8h9/maxresdefault.jpg", views: "7k" },
      { id: 22, title: "Pemadam Dapur (Minyak)", priority: 'REC', category: "Rumah Tangga", duration: "05:55", thumbnail: "https://img.youtube.com/vi/5e6f7g8h9i0/maxresdefault.jpg", views: "18k" },

      // --- BISA TAHU (OPTIONAL) ---
      { id: 23, title: "Perubahan Iklim 101", priority: 'OPT', category: "Wawasan", duration: "20:00", thumbnail: "https://img.youtube.com/vi/6f7g8h9i0j1/maxresdefault.jpg", views: "2k" },
      { id: 24, title: "Urban Farming Pemula", priority: 'OPT', category: "Hobi", duration: "10:30", thumbnail: "https://img.youtube.com/vi/7g8h9i0j1k2/maxresdefault.jpg", views: "5.5k" },
      { id: 25, title: "Membuat Kompos Rumah", priority: 'OPT', category: "Lingkungan", duration: "12:15", thumbnail: "https://img.youtube.com/vi/8h9i0j1k2l3/maxresdefault.jpg", views: "3k" },
      { id: 26, title: "Panen Air Hujan", priority: 'OPT', category: "Konservasi", duration: "08:40", thumbnail: "https://img.youtube.com/vi/9i0j1k2l3m4/maxresdefault.jpg", views: "1.2k" },
      { id: 27, title: "Energi Surya Rumahan", priority: 'OPT', category: "Teknologi", duration: "18:00", thumbnail: "https://img.youtube.com/vi/0j1k2l3m4n5/maxresdefault.jpg", views: "4.5k" },
      { id: 28, title: "Fashion Berkelanjutan", priority: 'OPT', category: "Lifestyle", duration: "11:20", thumbnail: "https://img.youtube.com/vi/1k2l3m4n5o6/maxresdefault.jpg", views: "2.8k" },
      { id: 29, title: "Daur Ulang Minyak Jelantah", priority: 'OPT', category: "DIY", duration: "07:10", thumbnail: "https://img.youtube.com/vi/2l3m4n5o6p7/maxresdefault.jpg", views: "6.2k" },
      { id: 30, title: "Menjaga Terumbu Karang", priority: 'OPT', category: "Ekologi", duration: "13:45", thumbnail: "https://img.youtube.com/vi/3m4n5o6p7q8/maxresdefault.jpg", views: "1.5k" },
  ];

  const filteredModules = learnTab === 'ALL' 
    ? learningModules 
    : learningModules.filter(m => m.priority === learnTab);

  // --- ACTIONS ---

  const handleAiImprove = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perbaiki dan pertajam laporan bencana berikut agar terdengar formal, detail, mendesak, dan mudah dipahami oleh pemerintah atau dinas terkait. Tambahkan estimasi dampak jika tidak ditangani. Gunakan Bahasa Indonesia yang baik. Isi laporan awal: "${reportForm.description || 'Ada sampah numpuk di kali'}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
          setReportForm(prev => ({ ...prev, description: response.text }));
      }
    } catch (e) {
      console.error("AI Error", e);
      setReportForm(prev => ({ 
          ...prev, 
          description: "Laporan: Ditemukan penumpukan limbah padat di aliran sungai yang menghambat debit air secara signifikan. Kondisi ini berpotensi menyebabkan luapan banjir setinggi 50-100cm ke pemukiman warga jika curah hujan tinggi. Mohon Dinas Lingkungan Hidup dan SDA segera melakukan pengerukan dan pengangkutan." 
      }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateImage = async () => {
      if (!genPrompt) return;
      setIsGeneratingImg(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: genPrompt }]
              },
              config: {
                  imageConfig: {
                      aspectRatio: "1:1",
                  }
              }
          });
          
          const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (imagePart?.inlineData?.data) {
              const base64EncodeString = imagePart.inlineData.data;
              const imageUrl = `data:image/png;base64,${base64EncodeString}`;
              setGeneratedImg(imageUrl);
              setNewPostMedia(imageUrl);
              setNewPostMediaType('image');
          } else {
              alert("Gagal membuat gambar. Coba lagi.");
          }
      } catch (e: any) {
          console.error("Img Gen Error", e);
          if (e.message?.includes('403') || e.status === 403) {
              alert("Izin Ditolak (403): API Key Anda mungkin tidak memiliki akses untuk model 'gemini-2.5-flash-image'. Pastikan API Key Anda mendukung Generative AI.");
          } else {
              alert("Gagal membuat gambar. Pastikan API key valid.");
          }
      } finally {
          setIsGeneratingImg(false);
      }
  };

  const handleTextToSpeech = async () => {
    if (!reportForm.description) return;
    setIsSpeaking(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: reportForm.description }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioData = atob(base64Audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        }
    } catch (e) {
        console.error("TTS Error", e);
    } finally {
        setTimeout(() => setIsSpeaking(false), 2000); // Reset state
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Browser tidak mendukung input suara.");
        return;
    }
    
    setIsListening(true);
    setTimeout(() => {
        setIsListening(false);
        setReportForm(prev => ({...prev, description: prev.description + " Terlihat tumpukan sampah plastik yang menyumbat aliran sungai di sektor selatan. Baunya sangat menyengat."}));
    }, 2000);
  };

  // Real Camera / File Input Trigger
  const triggerCameraInput = () => {
    fileInputRef.current?.click();
  };

  const triggerGalleryInput = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        const file = e.target.files?.[0];
        if (file) {
          // Use URL.createObjectURL instead of FileReader (Base64) to prevent memory crashes on mobile
          const objectUrl = URL.createObjectURL(file);
          setReportForm(prev => ({ ...prev, image: objectUrl }));
          
          // Realistic GPS Extraction Simulation
          setGpsStatus('EXTRACTING');
          setTimeout(() => {
               setGpsStatus('LOCKED');
               setReportForm(prev => ({ ...prev, location: "Detected: -6.2088, 106.8456 (Verified)" }));
          }, 2000);
        }
    } catch (error) {
        console.error("File upload error:", error);
        alert("Gagal memuat foto. Coba resolusi yang lebih rendah.");
    }
  };

  // --- NEW POST MEDIA HANDLERS ---
  const handlePostMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setNewPostMedia(url);
          setNewPostMediaType(type);
      }
  };

  const handleCreatePost = () => {
      if (!newPostCaption && !newPostMedia) return;

      const newPost = {
          id: Date.now(),
          type: 'Warga',
          status: 'Open',
          user: 'Anda',
          avatar: 'https://i.pravatar.cc/150?img=11',
          location: 'Lokasi Anda',
          image: newPostMediaType === 'image' ? newPostMedia : null,
          video: newPostMediaType === 'video' ? newPostMedia : null,
          caption: newPostCaption,
          likes: 0,
          comments: 0,
          time: 'Baru saja',
          isVerified: false,
          isLiked: false
      };

      setFeed(prev => [newPost, ...prev]);
      
      // Reset
      setShowCreatePost(false);
      setNewPostCaption('');
      setNewPostMedia(null);
      setNewPostMediaType(null);
      setGeneratedImg(null);
  };

  const handleMapLocation = () => {
      setIsMapOpen(true);
      // Simulate location pick
      setTimeout(() => {
          setReportForm(prev => ({...prev, location: "Jl. Sudirman No. 45, Jakarta Pusat (-6.2088, 106.8456)"}));
          setIsMapOpen(false);
      }, 2000);
  };

  const handleReportSubmit = () => {
      setSubmissionStep(1); // Uploading
      setTimeout(() => {
          setSubmissionStep(2); // AI Verification
          setTimeout(() => {
              setSubmissionStep(3); // Geo Locking
              setTimeout(() => {
                   // Add to history
                  const newReport = {
                      id: Date.now(),
                      category: reportForm.category,
                      location: reportForm.location || "Lokasi Terkunci",
                      date: "Baru saja",
                      status: "Pending",
                      image: reportForm.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'
                  };
                  setReportHistory(prev => [newReport, ...prev]);

                  setSubmissionStep(4); // Success
              }, 1500);
          }, 2000);
      }, 1500);
  };

  const toggleLike = (id: number) => {
    setFeed(prev => prev.map(item => 
      item.id === id ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 } : item
    ));
  };
  
  // --- REAL COMMENTS & DELETE LOGIC ---
  const handleConfirmDelete = () => {
      if (deleteConfirmId) {
          setFeed(prev => prev.filter(p => p.id !== deleteConfirmId));
          setDeleteConfirmId(null);
          setOpenMenuPostId(null);
      }
  };

  const handleShare = () => {
    setShowShareSheet(false);
    setOpenMenuPostId(null);
    // Could add a visual feedback like a checkmark here
  };

  const handleTrendingClick = (tag: string) => {
      setIsTrendingLoading(tag);
      setTimeout(() => {
          setIsTrendingLoading(null);
          // Just simulate "refresh" for now as we don't have real API
          // Ideally this would fetch posts by tag
          setActiveFilter('Semua'); // Reset filter to show "results"
      }, 1500);
  };

  const getComments = (postId: number) => {
      // Lazy load some mock comments if empty
      if (!commentsRegistry[postId]) {
          const randomComments = Array.from({ length: Math.floor(Math.random() * 4) }).map((_, i) => ({
              id: Date.now() + i,
              user: `User${Math.floor(Math.random() * 999)}`,
              avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              text: ["Semoga cepat membaik", "Terima kasih infonya", "Stay safe kak!", "Wah parah banget"][Math.floor(Math.random() * 4)],
              time: `${Math.floor(Math.random() * 59) + 1}m`
          }));
          
          setCommentsRegistry(prev => ({
              ...prev,
              [postId]: randomComments
          }));
          return randomComments;
      }
      return commentsRegistry[postId];
  };

  const handlePostComment = (postId: number) => {
      if (!commentInput.trim()) return;
      
      const newComment = {
          id: Date.now(),
          user: "Anda",
          avatar: "https://i.pravatar.cc/150?img=11",
          text: commentInput,
          time: "Baru saja"
      };

      setCommentsRegistry(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
      }));

      // Update feed comment count
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
      setCommentInput('');
  };

  const filteredFeed = activeFilter === 'Semua' 
    ? feed 
    : feed.filter(item => {
        if (activeFilter === 'Resolved') return item.status === 'Resolved';
        if (activeFilter === 'Urgent') return item.status === 'Urgent';
        // Filter by disaster types
        return item.type === activeFilter;
    });

  // --- RENDERERS ---

  const renderSubmissionOverlay = () => (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
       <div className="w-full max-w-sm flex flex-col items-center relative">
          
          {/* Success Map Visualization */}
          {submissionStep === 4 && (
             <div className="absolute inset-0 bg-slate-100 rounded-3xl overflow-hidden animate-in zoom-in duration-500 opacity-50 -z-10">
                <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>
             </div>
          )}

          {/* Steps Visualization */}
          <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
             {/* Ping rings */}
             {submissionStep < 4 && <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>}
             {submissionStep < 4 && <div className="absolute inset-0 border-4 border-emerald-400/20 rounded-full animate-ping delay-300"></div>}
             
             <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10 transition-colors duration-500 ${submissionStep === 4 ? 'bg-white' : 'bg-emerald-100'}`}>
                 {submissionStep === 1 && <UploadCloud size={32} className="text-emerald-600 animate-bounce" />}
                 {submissionStep === 2 && <Wand2 size={32} className="text-purple-600 animate-pulse" />}
                 {submissionStep === 3 && <MapPin size={32} className="text-red-500 animate-bounce" />}
                 {submissionStep === 4 && <Check size={40} className="text-emerald-600 animate-in zoom-in duration-300" strokeWidth={4} />}
             </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">
             {submissionStep === 1 && "Mengunggah Data..."}
             {submissionStep === 2 && "Analisis AI..."}
             {submissionStep === 3 && "Verifikasi Lokasi..."}
             {submissionStep === 4 && "Laporan Terkirim!"}
          </h2>
          
          <p className="text-emerald-200/80 text-center text-sm mb-8 h-6">
             {submissionStep === 1 && "Mengenkripsi data laporan anda"}
             {submissionStep === 2 && "Mendeteksi tingkat keparahan visual"}
             {submissionStep === 3 && "Mengunci koordinat satelit presisi"}
             {submissionStep === 4 && "ID Tiket: #EC-2024-8821"}
          </p>

          {/* Progress Bar Simulation */}
          {submissionStep < 4 && (
             <div className="w-64 h-2 bg-emerald-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 animate-progress-indeterminate"></div>
             </div>
          )}

          {submissionStep === 4 && (
             <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 animate-in slide-in-from-bottom-4 fade-in">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                       <MapPin className="text-red-400" size={20} />
                    </div>
                    <div>
                       <p className="text-white font-bold text-sm">Lokasi Terverifikasi</p>
                       <p className="text-emerald-200 text-xs">-6.2088, 106.8456</p>
                    </div>
                 </div>
                 <button onClick={closeSuccess} className="w-full py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                     Kembali ke Menu
                 </button>
             </div>
          )}
       </div>
    </div>
  );

  const closeSuccess = () => {
    setSubmissionStep(0);
    setSubView('MENU');
    setReportForm({ description: '', location: '', category: '', details: '', image: null });
    setGpsStatus('IDLE');
  };

  const renderMapSimulation = () => (
      <div className="fixed inset-0 z-[70] bg-slate-100 flex flex-col">
          <div className="flex-1 relative bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-50">
               <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin size={48} className="text-red-600 animate-bounce drop-shadow-xl" fill="currentColor" />
                    <div className="absolute mt-16 bg-white px-3 py-1 rounded-full shadow-lg text-xs font-bold animate-pulse">Locking GPS...</div>
               </div>
          </div>
      </div>
  );

  const renderVideoOverlay = () => {
      if (!activeVideo) return null;
      return (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-300">
              <div className="absolute top-4 left-4 z-20">
                  <button onClick={() => setActiveVideo(null)} className="p-2 bg-black/50 rounded-full text-white">
                      <ArrowLeft />
                  </button>
              </div>
              <div className="flex-1 flex items-center justify-center bg-black relative">
                  <img src={activeVideo.thumbnail} className="w-full h-auto opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                          <Play size={32} fill="white" className="text-white ml-1" />
                      </div>
                  </div>
                  {/* Fake Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div className="w-1/3 h-full bg-red-600"></div>
                  </div>
              </div>
              <div className="p-6 bg-slate-900 text-white">
                  <h2 className="text-xl font-bold mb-2">{activeVideo.title}</h2>
                  <div className="flex gap-4 text-sm text-slate-400">
                      <span>{activeVideo.category}</span>
                      <span>{activeVideo.views} views</span>
                      <span>{activeVideo.duration}</span>
                  </div>
                  <div className="mt-4 flex justify-between">
                      <button className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold mr-2">Download Modul</button>
                      <button className="flex-1 py-3 bg-slate-800 rounded-xl font-bold">Share</button>
                  </div>
              </div>
          </div>
      )
  };

  const renderChatOverlay = () => {
      if (!activeChat) return null;
      return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b flex items-center gap-3 pt-safe-top">
                <button onClick={() => setActiveChat(null)}><ArrowLeft /></button>
                <div className="flex items-center gap-2">
                    <img src={activeChat.avatar} className="w-8 h-8 rounded-full" />
                    <span className="font-bold">{activeChat.user}</span>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[80%] text-sm">
                        Halo, terima kasih telah membagikan informasi ini. Apakah kami bisa bantu viralkan ke media lokal?
                    </div>
                </div>
                <div className="flex justify-end">
                     <div className="bg-emerald-600 text-white p-3 rounded-xl rounded-tr-none shadow-sm max-w-[80%] text-sm">
                        Tentu saja, mohon bantuannya agar segera ditindaklanjuti.
                    </div>
                </div>
            </div>
            <div className="p-3 border-t bg-white flex gap-2 mb-safe-bottom">
                <input type="text" placeholder="Tulis pesan..." className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none" />
                <button className="p-2 bg-emerald-600 rounded-full text-white"><Send size={18} /></button>
            </div>
        </div>
      )
  };

  const renderCommentsOverlay = () => {
    if (!activeComments) return null;
    const comments = getComments(activeComments.id);

    return (
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in">
         <div className="w-full h-2/3 mt-auto bg-white rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
             <div className="p-4 border-b flex justify-between items-center">
                 <h3 className="font-bold">Komentar</h3>
                 <button onClick={() => setActiveComments(null)}><X size={20}/></button>
             </div>
             
             {/* List of Comments */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments && comments.length > 0 ? (
                    comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3">
                            <img src={comment.avatar} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">{comment.user} <span className="font-normal text-slate-500 ml-2">{comment.time}</span></p>
                                <p className="text-sm text-slate-700">{comment.text}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold cursor-pointer hover:text-slate-600">Balas</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                        <MessageCircle size={32} className="mb-2 opacity-50" />
                        Belum ada komentar. Jadilah yang pertama!
                    </div>
                )}
             </div>

             {/* Input Area */}
             <div className="p-3 border-t bg-white flex gap-2 mb-safe-bottom">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover"/>
                </div>
                <input 
                    type="text" 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment(activeComments.id)}
                    placeholder="Tambahkan komentar..." 
                    className="flex-1 text-sm outline-none" 
                />
                <button 
                    onClick={() => handlePostComment(activeComments.id)}
                    disabled={!commentInput.trim()}
                    className="text-emerald-600 font-bold text-sm disabled:opacity-50"
                >
                    Post
                </button>
            </div>
         </div>
      </div>
    );
  };

  const renderCreatePostModal = () => (
      <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 flex items-center justify-between border-b pt-safe-top">
              <div className="flex items-center gap-3">
                  <button onClick={() => {setShowCreatePost(false); setNewPostMedia(null); setGeneratedImg(null);}}><ArrowLeft /></button>
                  <h3 className="font-bold text-lg">Buat Postingan</h3>
              </div>
              <button 
                className={`font-bold text-sm px-4 py-1.5 rounded-full transition-all ${newPostCaption || newPostMedia ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`} 
                onClick={handleCreatePost}
                disabled={!newPostCaption && !newPostMedia}
              >
                  Bagikan
              </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover"/></div>
                  <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">Anda</p>
                      <textarea 
                        value={newPostCaption}
                        onChange={(e) => setNewPostCaption(e.target.value)}
                        placeholder="Apa yang terjadi di sekitar Anda?" 
                        className="w-full mt-2 text-sm outline-none resize-none h-20 placeholder-slate-400"
                      />
                  </div>
              </div>

              {/* Media Preview Area */}
              {newPostMedia && (
                  <div className="relative rounded-2xl overflow-hidden mb-6 border border-slate-100 shadow-sm max-h-80 bg-black">
                      <button onClick={() => setNewPostMedia(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white z-10 hover:bg-black/70"><X size={16}/></button>
                      
                      {newPostMediaType === 'image' ? (
                          <img src={newPostMedia} className="w-full h-full object-contain" />
                      ) : (
                          <video src={newPostMedia} controls className="w-full h-full object-contain" />
                      )}
                  </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                  <input type="file" ref={postImageInputRef} accept="image/*" className="hidden" onChange={(e) => handlePostMediaChange(e, 'image')} />
                  <input type="file" ref={postVideoInputRef} accept="video/*" className="hidden" onChange={(e) => handlePostMediaChange(e, 'video')} />
                  
                  <button onClick={() => postImageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-xs flex-shrink-0 active:scale-95 transition-transform">
                      <Camera size={18} /> Foto/Kamera
                  </button>
                  <button onClick={() => postVideoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl border border-red-100 font-bold text-xs flex-shrink-0 active:scale-95 transition-transform">
                      <VideoIcon size={18} /> Video
                  </button>
                  <button onClick={() => postImageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-xs flex-shrink-0 active:scale-95 transition-transform">
                      <ImageIcon size={18} /> Galeri
                  </button>
              </div>

              {/* AI Image Generation Area */}
              <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><Paintbrush size={14} className="text-purple-500"/> Buat Poster Kampanye (AI)</h4>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                      <input 
                        value={genPrompt}
                        onChange={(e) => setGenPrompt(e.target.value)}
                        placeholder="Deskripsi poster (misal: Hutan hijau yang indah)" 
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-purple-300"
                      />
                      <button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImg || !genPrompt}
                        className="bg-purple-600 text-white px-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                      >
                          {isGeneratingImg ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>}
                      </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Powered by Gemini 2.5 Flash Image</p>
              </div>
          </div>
      </div>
  );

  const renderShareSheet = () => (
      <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Bagikan ke</h3>
                  <button onClick={() => setShowShareSheet(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                  {[
                      { name: "WhatsApp", icon: MessageCircle, color: "bg-green-500" },
                      { name: "Twitter", icon: Twitter, color: "bg-blue-400" },
                      { name: "Instagram", icon: Instagram, color: "bg-pink-500" },
                      { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
                  ].map((item, idx) => (
                      <button key={idx} onClick={handleShare} className="flex flex-col items-center gap-2 group">
                          <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform`}>
                              <item.icon size={24} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{item.name}</span>
                      </button>
                  ))}
                  <button onClick={handleShare} className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-active:scale-95 transition-transform">
                          <Copy size={24} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">Salin Link</span>
                  </button>
                  <button onClick={handleShare} className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-active:scale-95 transition-transform">
                          <Link2 size={24} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">Lainnya</span>
                  </button>
              </div>
          </div>
      </div>
  );

  const renderDeleteConfirmation = () => (
      <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 animate-in zoom-in-95 shadow-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Hapus Postingan?</h3>
              <p className="text-center text-slate-500 text-sm mb-6">
                  Postingan ini akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                      Batal
                  </button>
                  <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors">
                      Hapus
                  </button>
              </div>
          </div>
      </div>
  );

  // --- SUB-VIEW COMPONENTS ---

  const renderMenu = () => (
    <div className="space-y-4 px-2 pt-2 pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 shadow-xl mb-6">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <ShieldAlert size={16} className="text-emerald-100" />
             </div>
             <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">Fase Pra-Bencana</span>
           </div>
           <h1 className="text-2xl font-black mb-2 leading-tight">Pencegahan Adalah Kunci</h1>
           <p className="text-emerald-100 text-sm leading-relaxed mb-4">
             Laporkan potensi bahaya sebelum menjadi bencana. Partisipasi Anda menyelamatkan nyawa dan lingkungan.
           </p>
           
           <div className="flex gap-3">
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold">12.5k</p>
                <p className="text-[10px] opacity-80">Laporan Teratasi</p>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold">85%</p>
                <p className="text-[10px] opacity-80">Mitigasi Sukses</p>
             </div>
           </div>
         </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 px-1">Menu Utama</h3>
      <div className="grid gap-4">
        <GlassCard className="p-6 flex items-start gap-4 group active:scale-[0.98] relative overflow-hidden" onClick={() => setSubView('ECO_REPORT')}>
           <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 flex items-center justify-center shadow-inner relative z-10">
             <ShieldAlert size={28} />
           </div>
           <div className="flex-1 relative z-10">
             <h3 className="font-bold text-slate-800 text-lg">EcoReport</h3>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">
               Laman pelaporan terintegrasi pemerintah. Lengkap dengan AI enhancer untuk laporan yang lebih akurat.
             </p>
           </div>
           <div className="self-center bg-slate-100 p-2 rounded-full text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors z-10">
             <ArrowLeft size={16} className="rotate-180" />
           </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-start gap-4 group active:scale-[0.98] relative overflow-hidden" onClick={() => setSubView('ECO_LEARN')}>
           <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-2xl transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center shadow-inner relative z-10">
             <Book size={28} />
           </div>
           <div className="flex-1 relative z-10">
             <h3 className="font-bold text-slate-800 text-lg">EcoLearn</h3>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">
               Modul video edukasi interaktif seputar pelestarian alam dan mitigasi bencana berbasis data lokal.
             </p>
           </div>
           <div className="self-center bg-slate-100 p-2 rounded-full text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors z-10">
             <ArrowLeft size={16} className="rotate-180" />
           </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-start gap-4 group active:scale-[0.98] relative overflow-hidden" onClick={() => setSubView('ECO_GRAM')}>
           <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-red-100 rounded-full opacity-50 blur-2xl transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 text-red-600 flex items-center justify-center shadow-inner relative z-10">
             <Share2 size={28} />
           </div>
           <div className="flex-1 relative z-10">
             <h3 className="font-bold text-slate-800 text-lg">EcoGram</h3>
             <p className="text-xs text-slate-500 mt-1 leading-relaxed">
               Media sosial lingkungan. Viral-kan laporan yang macet agar segera mendapat atensi publik.
             </p>
           </div>
           <div className="self-center bg-slate-100 p-2 rounded-full text-slate-400 group-hover:bg-red-500 group-hover:text-white transition-colors z-10">
             <ArrowLeft size={16} className="rotate-180" />
           </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderEcoReport = () => (
    <div className="px-2 space-y-4 animate-in slide-in-from-right duration-300 pb-24 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pt-4">
            <div className="flex items-center gap-3">
                <button onClick={() => setSubView('MENU')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Buat Laporan Detail</h2>
            </div>
            <button 
                onClick={() => setSubView('REPORT_HISTORY')} 
                className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full shadow-sm text-xs font-bold text-slate-600 active:scale-95 transition-transform"
            >
                <History size={16} /> Riwayat
            </button>
        </div>
        <GlassCard className="p-5 space-y-4" variant="light">
          
          {/* Photo Upload Area */}
          <div className="w-full h-48 rounded-2xl bg-emerald-50/50 flex items-center justify-center relative overflow-hidden group">
             {/* Hidden Inputs */}
             <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
             />
             <input 
                type="file" 
                accept="image/*"
                ref={galleryInputRef}
                className="hidden"
                onChange={handleFileChange}
             />

             {reportForm.image ? (
                <>
                  <img src={reportForm.image} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                      {gpsStatus === 'EXTRACTING' ? <Loader2 size={10} className="animate-spin" /> : <CheckCircleIcon size={10} />} 
                      {gpsStatus === 'EXTRACTING' ? 'Mengambil Data GPS...' : gpsStatus === 'LOCKED' ? 'GPS Terkunci' : 'Menunggu Lokasi'}
                  </div>
                  {/* Option to retake */}
                  <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => setReportForm({...reportForm, image: null})} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
                          <X size={14} />
                      </button>
                  </div>
                </>
             ) : (
                <div className="flex gap-4">
                    {/* Camera Button */}
                    <button 
                        onClick={triggerCameraInput}
                        className="flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-emerald-300 shadow-sm active:scale-95 transition-transform"
                    >
                        <Camera size={28} className="text-emerald-500 mb-1" />
                        <span className="text-[10px] font-bold text-emerald-700">Ambil Foto</span>
                    </button>

                    {/* Gallery Button */}
                    <button 
                        onClick={triggerGalleryInput}
                        className="flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-emerald-300 shadow-sm active:scale-95 transition-transform"
                    >
                        <ImageIcon size={28} className="text-blue-500 mb-1" />
                        <span className="text-[10px] font-bold text-blue-700">Galeri</span>
                    </button>
                </div>
             )}
          </div>

          {/* Location with Map Integration */}
          <div 
            onClick={handleMapLocation}
            className="flex items-center space-x-3 bg-white/40 p-3 rounded-xl border border-white/50 cursor-pointer active:bg-white/60"
          >
             <MapPin className="text-emerald-600" size={20} />
             <div className="flex-1 pointer-events-none">
               <p className="text-xs text-slate-500">Titik Koordinat (Tap untuk Peta)</p>
               <input 
                  type="text" 
                  value={reportForm.location || "Menunggu data GPS dari foto..."}
                  readOnly
                  className="text-sm font-semibold text-slate-800 bg-transparent w-full outline-none"
               />
             </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
              <Tag size={12} /> Kategori Pelanggaran
            </label>
            <div className="flex flex-wrap gap-2">
              {['Penebangan Liar', 'Sampah Ilegal', 'Pencemaran Air', 'Pembakaran', 'Longsor'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setReportForm({...reportForm, category: tag})}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${reportForm.category === tag ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/50 border-emerald-200 text-emerald-800'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Details with AI & Voice Input */}
          <div className="relative">
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-600">Detail Laporan</label>
                <div className="flex gap-2">
                    <button 
                        onClick={handleTextToSpeech}
                        disabled={!reportForm.description}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm transition-colors ${isSpeaking ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                        <Volume2 size={10} /> {isSpeaking ? 'Membaca...' : 'Bacakan'}
                    </button>
                    <button 
                        onClick={handleAiImprove}
                        disabled={isAiLoading || !reportForm.description}
                        className="flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded-full shadow-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {isAiLoading ? <div className="animate-spin w-3 h-3 border-2 border-white rounded-full border-t-transparent"></div> : <Wand2 size={10} />} 
                        Perbaiki dengan AI
                    </button>
                </div>
             </div>
             <textarea 
                className="w-full bg-white/40 border border-white/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 min-h-[120px]"
                rows={5}
                value={reportForm.description}
                onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                placeholder="Contoh: Ada tumpukan sampah di kali yang bikin mampet..."
             />
             <button 
               onClick={handleVoiceInput}
               className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-emerald-600'}`}
             >
                <Mic size={18} />
             </button>
          </div>

          {/* Details Extra */}
           <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Dampak / Kerugian (Opsional)</label>
            <input 
                type="text" 
                className="w-full bg-white/40 border border-white/50 rounded-xl p-3 text-sm outline-none" 
                placeholder="Misal: 50 KK terancam banjir"
                value={reportForm.details}
                onChange={(e) => setReportForm({...reportForm, details: e.target.value})}
            />
          </div>

          <button onClick={handleReportSubmit} disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed">
             <UploadCloud size={18} /> Kirim Laporan Resmi
          </button>
        </GlassCard>
    </div>
  );
  
  const renderReportHistory = () => (
      <div className="px-2 space-y-4 animate-in slide-in-from-right duration-300 pb-24 h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 pt-4">
              <button onClick={() => setSubView('ECO_REPORT')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                  <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800">Riwayat Laporan</h2>
          </div>
          
          <div className="space-y-3">
              {reportHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <History size={48} className="mb-4 opacity-50"/>
                      <p>Belum ada riwayat laporan.</p>
                  </div>
              ) : (
                  reportHistory.map((item: any) => (
                      <GlassCard key={item.id} className="p-3 flex gap-3 active:scale-[0.99]" variant="light">
                          <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                              <img src={item.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{item.category}</h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                      item.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                                      'bg-yellow-100 text-yellow-700'
                                  }`}>
                                      {item.status}
                                  </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mb-1 flex items-center gap-1">
                                  <MapPin size={10} /> {item.location}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock size={10} /> {item.date}
                              </p>
                          </div>
                      </GlassCard>
                  ))
              )}
          </div>
      </div>
  );

  const renderEcoLearn = () => (
      <div className="px-2 space-y-4 animate-in slide-in-from-right duration-300 pb-24 h-full overflow-y-auto">
        {/* Header and Filter Tab */}
        <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setSubView('MENU')} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Modul Edukasi ({filteredModules.length})</h2>
            </div>
            
            {/* Custom Tab Switcher */}
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar gap-1">
                {[
                    { id: 'ALL', label: 'Semua', icon: Book },
                    { id: 'MUST', label: 'Wajib', icon: AlertTriangle, color: 'text-red-500' },
                    { id: 'REC', label: 'Saran', icon: BookOpen, color: 'text-blue-500' },
                    { id: 'OPT', label: 'Opsional', icon: Lightbulb, color: 'text-green-500' },
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setLearnTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                            learnTab === tab.id 
                            ? 'bg-slate-800 text-white shadow-md' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon size={14} className={learnTab === tab.id ? 'text-white' : tab.color || 'text-slate-400'} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pb-20">
            {filteredModules.map((mod) => (
                <div 
                    key={mod.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer group"
                    onClick={() => setActiveVideo(mod)}
                >
                    <div className="h-32 bg-slate-200 relative">
                        <img src={mod.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                <Play size={20} fill="white" className="text-white ml-1" />
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold">{mod.duration}</div>
                        
                        {/* Priority Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-sm flex items-center gap-1 ${
                            mod.priority === 'MUST' ? 'bg-red-500' : 
                            mod.priority === 'REC' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                            {mod.priority === 'MUST' ? <AlertTriangle size={8} fill="currentColor"/> : 
                             mod.priority === 'REC' ? <CheckCircleIcon size={8} /> : <Leaf size={8} />}
                            {mod.priority === 'MUST' ? 'WAJIB' : mod.priority === 'REC' ? 'SARAN' : 'INFO'}
                        </div>
                    </div>
                    <div className="p-3">
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">{mod.category}</span>
                        <h3 className="font-bold text-slate-800 text-sm mt-1 leading-tight line-clamp-2 min-h-[2.5em]">{mod.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <User size={10}/> {mod.views} viewers
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );

  const renderEcoGram = () => (
    // Fixed position to ensure it covers the screen without layout conflicts
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Sticky Header & Search */}
        <div className="bg-white z-20 shadow-sm border-b border-slate-100 pt-safe-top">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSubView('MENU')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} className="text-slate-700" />
                    </button>
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
                        E
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">EcoGram</h2>
                </div>
                <button onClick={() => setShowCreatePost(true)} className="bg-slate-900 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform">
                    <Plus size={20} />
                </button>
            </div>
            
            {/* Search Bar */}
            <div className="px-4 pb-3">
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Cari isu lingkungan, relawan, atau lokasi..." 
                        className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50" onClick={() => setOpenMenuPostId(null)}>
            
            {/* Trending Slides - Separated Section */}
            <div className="py-4 bg-white border-b border-slate-100 mb-2 shadow-sm">
                <div className="px-4 flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800">Sedang Hangat</h3>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2 snap-x">
                    {[
                        { tag: "#BanjirDemak", posts: "12.5k Post", color: "from-blue-500 to-blue-600" },
                        { tag: "#DaruratSampah", posts: "8.2k Post", color: "from-red-500 to-orange-500" },
                        { tag: "#HutanKita", posts: "5.1k Post", color: "from-emerald-500 to-teal-600" },
                        { tag: "#RelawanSiaga", posts: "3.4k Post", color: "from-purple-500 to-indigo-600" },
                    ].map((topic, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleTrendingClick(topic.tag)}
                            className="snap-start flex-shrink-0 w-44 h-24 rounded-2xl relative overflow-hidden group cursor-pointer active:scale-95 transition-transform shadow-sm text-left"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            
                            {isTrendingLoading === topic.tag ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                    <Loader2 className="text-white animate-spin" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                                    <span className="text-[10px] font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">Trending #{i+1}</span>
                                    <div>
                                        <p className="font-bold text-sm leading-tight mb-0.5">{topic.tag}</p>
                                        <p className="text-[10px] opacity-80">{topic.posts}</p>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Tabs - Sticky Header with Solid Background */}
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 shadow-sm">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['Semua', 'Banjir', 'Kebakaran', 'Sampah', 'Polusi', 'Urgent', 'Resolved'].map((filter, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Twitter-like Feed - Spaced out properly */}
            <div className="pb-24 pt-2 space-y-3 px-2 min-h-[300px]">
              {filteredFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                          <Share2 size={28} className="text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-600">Belum ada postingan</p>
                      <p className="text-xs text-slate-500 max-w-[200px]">Coba ubah filter atau jadilah yang pertama berbagi informasi.</p>
                      <button onClick={() => setShowCreatePost(true)} className="mt-4 text-emerald-600 font-bold text-sm">Buat Postingan</button>
                  </div>
              ) : (
                  filteredFeed.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm active:scale-[0.99] transition-transform cursor-pointer" onClick={() => setActiveChat(post)}>
                       <div className="flex gap-3">
                           {/* Avatar */}
                           <div className="flex-shrink-0">
                               <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                                   <img src={post.avatar} className="w-full h-full object-cover" />
                               </div>
                           </div>

                           {/* Content */}
                           <div className="flex-1 min-w-0">
                               {/* Header */}
                               <div className="flex items-center justify-between mb-1 relative">
                                   <div className="flex items-center gap-1.5 overflow-hidden">
                                       <span className="font-bold text-slate-900 text-sm truncate">{post.user}</span>
                                       {post.isVerified && <CheckCircle size={12} className="text-blue-500 flex-shrink-0" fill="currentColor" color="white"/>}
                                       <span className="text-slate-500 text-xs truncate">@{post.user.replace(/\s+/g, '').toLowerCase()}</span>
                                       <span className="text-slate-400 text-[10px]">• {post.time}</span>
                                   </div>
                                   
                                   {/* Options Menu Button & Dropdown */}
                                   <div className="relative">
                                       <button 
                                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                                          onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setOpenMenuPostId(openMenuPostId === post.id ? null : post.id); 
                                          }}
                                       >
                                           <MoreHorizontal size={16} />
                                       </button>
                                       
                                       {openMenuPostId === post.id && (
                                           <div className="absolute right-0 top-6 bg-white shadow-xl rounded-xl border border-slate-100 z-20 overflow-hidden w-36 animate-in fade-in zoom-in-95 origin-top-right">
                                               <button 
                                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(post.id); }} 
                                                  className="w-full text-left px-4 py-2.5 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center gap-2 transition-colors border-b border-slate-50"
                                               >
                                                   <Trash2 size={14} /> Hapus
                                               </button>
                                               <button 
                                                  onClick={(e) => { e.stopPropagation(); setShowShareSheet(true); }} 
                                                  className="w-full text-left px-4 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                               >
                                                   <Share2 size={14} /> Bagikan
                                               </button>
                                           </div>
                                       )}
                                   </div>
                               </div>

                               {/* Body Text */}
                               <p className="text-slate-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                                   {post.caption}
                               </p>

                               {/* Media Attachment (Rounded) */}
                               {(post.image || post.video) && (
                                   <div className="mb-3 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group w-full" onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}>
                                       {post.video ? (
                                           <video src={post.video} controls className="w-full h-auto max-h-80 bg-black" />
                                       ) : (
                                           <img src={post.image} className="w-full h-auto object-cover max-h-80" loading="lazy" />
                                       )}
                                       
                                       {/* Status Badge */}
                                       <div className="absolute top-3 left-3 px-2 py-1 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 z-10 transition-colors bg-black/40">
                                            {post.status === 'Urgent' ? (
                                                <span className="flex items-center gap-1 text-red-100"><ShieldAlert size={10} className="text-red-400" fill="currentColor"/> URGENT</span>
                                            ) : post.status === 'Resolved' ? (
                                                <span className="flex items-center gap-1 text-emerald-100"><CheckCircle size={10} className="text-emerald-400" fill="currentColor"/> SELESAI</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-blue-100"><Info size={10} className="text-blue-400" /> INFO</span>
                                            )}
                                       </div>
                                        
                                        {/* Like Animation Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-active:opacity-100 transition-opacity duration-200">
                                            <Heart size={80} className="text-white fill-white drop-shadow-lg scale-110" />
                                        </div>
                                   </div>
                               )}

                               {/* Action Bar */}
                               <div className="flex items-center justify-between pr-4 max-w-md">
                                   <button className="flex items-center gap-1.5 group text-slate-500 hover:text-blue-500 transition-colors" onClick={(e) => { e.stopPropagation(); setActiveComments(post); }}>
                                       <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                                           <MessageCircle size={18} />
                                       </div>
                                       <span className="text-xs font-medium">{post.comments}</span>
                                   </button>

                                   <button className="flex items-center gap-1.5 group text-slate-500 hover:text-green-500 transition-colors">
                                       <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors">
                                           <Repeat size={18} />
                                       </div>
                                       <span className="text-xs font-medium">{Math.floor(post.likes / 5)}</span>
                                   </button>

                                   <button 
                                      className={`flex items-center gap-1.5 group transition-colors ${post.isLiked ? 'text-pink-600' : 'text-slate-500 hover:text-pink-600'}`} 
                                      onClick={(e) => { 
                                          e.stopPropagation(); 
                                          toggleLike(post.id); 
                                      }}
                                   >
                                       <div className={`p-1.5 rounded-full transition-all duration-300 ${post.isLiked ? 'bg-pink-50 scale-110' : 'group-hover:bg-pink-50'}`}>
                                           <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "animate-[heartbeat_0.3s_ease-in-out]" : ""} />
                                       </div>
                                       <span className="text-xs font-medium">{post.likes}</span>
                                   </button>

                                   <button className="flex items-center gap-1.5 group text-slate-500 hover:text-blue-500 transition-colors" onClick={(e) => { e.stopPropagation(); setShowShareSheet(true); }}>
                                       <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                                           <Share2 size={18} />
                                       </div>
                                   </button>
                               </div>
                           </div>
                       </div>
                    </div>
                  ))
              )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="pb-24 h-full">
      {submissionStep > 0 && renderSubmissionOverlay()}
      {isMapOpen && renderMapSimulation()}

      {activeVideo && renderVideoOverlay()}
      {activeChat && renderChatOverlay()}
      {activeComments && renderCommentsOverlay()}
      {showCreatePost && renderCreatePostModal()}
      
      {showShareSheet && renderShareSheet()}
      {deleteConfirmId && renderDeleteConfirmation()}
      
      {subView === 'MENU' && renderMenu()}
      {subView === 'ECO_REPORT' && renderEcoReport()}
      {subView === 'REPORT_HISTORY' && renderReportHistory()}
      {subView === 'ECO_LEARN' && renderEcoLearn()}
      {subView === 'ECO_GRAM' && renderEcoGram()}
    </div>
  );
};

// Helper for check circle icon
const CheckCircle = ({size, fill, color}: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" fill={fill} stroke={fill}/>
    <path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);