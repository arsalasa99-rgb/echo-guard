import React, { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Radio, AlertOctagon, ArrowLeft, Wifi, Signal, Battery, Navigation, Hospital, Package, Triangle, ShieldAlert, Send, RefreshCw, X, CornerUpRight, Clock, Map, Zap, Volume2, Speaker, Lightbulb, MessageSquare, WifiOff, Search, Users, Mail, Loader2, Pause, Play, BriefcaseMedical, Heart, Thermometer, Bone, Activity, Stethoscope, AlertTriangle, PlayCircle, StopCircle, ArrowRight, Hand, Check, Fingerprint, Siren, Satellite, Smartphone, Wind } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GoogleGenAI } from "@google/genai";

// Hardcoded offline data to prevent JSON import issues in browser environments
const radioDataRaw = [
  {
    "city": "Jakarta",
    "station": "RRI Pro 3",
    "frequency": "88.8 FM",
    "type": "National Emergency"
  },
  {
    "city": "Jakarta",
    "station": "Elshinta Radio",
    "frequency": "90.0 FM",
    "type": "Disaster News"
  },
  {
    "city": "Jakarta",
    "station": "RRI Jakarta Pro 1",
    "frequency": "91.2 FM",
    "type": "Local Info"
  },
  {
    "city": "Jakarta",
    "station": "Radio Kepolisian",
    "frequency": "91.1 FM",
    "type": "Traffic/Safety"
  },
  {
    "city": "Padang",
    "station": "RRI Padang Pro 1",
    "frequency": "97.5 FM",
    "type": "Local Info"
  },
  {
    "city": "Padang",
    "station": "Classy FM",
    "frequency": "103.4 FM",
    "type": "Disaster News"
  },
  {
    "city": "Palu",
    "station": "RRI Palu Pro 1",
    "frequency": "90.8 FM",
    "type": "Local Info"
  },
  {
    "city": "Palu",
    "station": "Radio Nebula",
    "frequency": "101.0 FM",
    "type": "Emergency"
  },
  {
    "city": "Yogyakarta",
    "station": "RRI Jogja Pro 1",
    "frequency": "91.1 FM",
    "type": "Merapi Monitor"
  },
  {
    "city": "Surabaya",
    "station": "Suara Surabaya",
    "frequency": "100.0 FM",
    "type": "Disaster News"
  }
];

type SubView = 'MENU' | 'SOS' | 'SAFE_ZONE' | 'ECHO_SMS' | 'SOS_TOOLKIT' | 'RADIO_FINDER' | 'SAKU_SELAMAT';
type NavMode = 'IDLE' | 'LIST' | 'NAVIGATING';

// --- SAKU SELAMAT TYPES ---
type MedicalScenario = 'CPR' | 'BLEEDING' | 'FRACTURE' | 'HYPOTHERMIA' | 'CRUSH' | null;
type TriageStep = 'CONSCIOUSNESS' | 'BREATHING' | 'SELECT_INJURY' | 'GUIDE';

interface StepInstruction {
    text: string;
    audio: string;
    visual: 'CPR' | 'PRESS' | 'WRAP' | 'WARM' | 'WAIT';
    tool?: 'METRONOME' | 'TIMER';
}

interface MedicalGuide {
    id: string;
    title: string;
    steps: StepInstruction[];
    warning?: string;
}

const MEDICAL_GUIDES: Record<string, MedicalGuide> = {
    CPR: {
        id: 'CPR',
        title: 'POMPA JANTUNG (RJP)',
        steps: [
            { text: "Baringkan korban di tempat rata & keras.", audio: "Baringkan korban di tempat rata dan keras. Jangan di kasur.", visual: 'WAIT' },
            { text: "Letakkan tumit tangan di tengah dada.", audio: "Letakkan tumit tangan di tengah dada, di antara dua puting.", visual: 'CPR' },
            { text: "Tekan Cepat & Dalam (5cm). Ikuti Irama.", audio: "Tekan dada sedalam 5 senti meter. Ikuti bunyi beep. Jangan berhenti.", visual: 'CPR', tool: 'METRONOME' },
            { text: "Cek napas setiap 2 menit.", audio: "Cek napas setiap 2 menit. Jika belum sadar, lanjutkan pompa.", visual: 'WAIT' }
        ]
    },
    BLEEDING: {
        id: 'BLEEDING',
        title: 'PENDARAHAN HEBAT',
        steps: [
            { text: "Cari sumber darah yang memancar.", audio: "Cari sumber darah. Gunting pakaian jika perlu.", visual: 'PRESS' },
            { text: "TEKAN LUKA dengan kain tebal.", audio: "Ambil kain tebal. Tekan luka sekuat tenaga. Jangan dilepas.", visual: 'PRESS' },
            { text: "Jika darah tembus, tumpuk kain lagi.", audio: "Jangan buka kain pertama. Tumpuk kain baru di atasnya jika darah tembus.", visual: 'PRESS' },
            { text: "Ikat kencang & posisikan luka lebih tinggi.", audio: "Ikat kencang kain penahan. Angkat bagian luka lebih tinggi dari jantung.", visual: 'WRAP' }
        ]
    },
    CRUSH: {
        id: 'CRUSH',
        title: 'TERTIMPA RERUNTUHAN',
        warning: "BAHAYA RACUN OTOT! Jangan angkat beban jika tertindih > 15 menit tanpa medis.",
        steps: [
            { text: "Cek durasi tertindih.", audio: "Sudah berapa lama tertindih? Jika lebih dari 15 menit, jangan angkat beban sendiri.", visual: 'WAIT' },
            { text: "Beri minum jika sadar.", audio: "Berikan air minum jika korban sadar untuk mencegah gagal ginjal.", visual: 'WAIT' },
            { text: "Tunggu Tim Medis.", audio: "Biarkan beban menindih sampai dokter datang. Mengangkat beban bisa mematikan korban.", visual: 'WAIT' }
        ]
    },
    HYPOTHERMIA: {
        id: 'HYPOTHERMIA',
        title: 'KEDINGINAN / HIPOTERMIA',
        steps: [
            { text: "Lepas semua baju basah.", audio: "Buka semua pakaian basah korban secara perlahan.", visual: 'WRAP' },
            { text: "Ganti selimut kering / Jaket.", audio: "Bungkus dengan selimut kering atau jaket tebal.", visual: 'WARM' },
            { text: "Peluk korban (Skin-to-Skin).", audio: "Peluk korban agar panas tubuh anda berpindah. Tempelkan kulit ke kulit.", visual: 'WARM' },
            { text: "Beri minuman hangat manis.", audio: "Berikan teh manis hangat jika korban sadar.", visual: 'WAIT' }
        ]
    },
    FRACTURE: {
        id: 'FRACTURE',
        title: 'PATAH TULANG',
        steps: [
            { text: "JANGAN GERAKKAN bagian sakit.", audio: "Jangan gerakkan atau urut bagian yang sakit.", visual: 'WAIT' },
            { text: "Cari kardus/kayu untuk bidai.", audio: "Cari benda keras lurus seperti kardus, kayu, atau payung.", visual: 'WRAP' },
            { text: "Ikat longgar mengapit sendi.", audio: "Ikat benda keras mengapit bagian yang patah. Jangan terlalu kencang.", visual: 'WRAP' }
        ]
    }
};

interface DuringDisasterViewProps {
  onToggleNav?: (visible: boolean) => void;
}

export const DuringDisasterView: React.FC<DuringDisasterViewProps> = ({ onToggleNav }) => {
  const [subView, setSubView] = useState<SubView>('MENU');
  
  // Toggle navigation based on subview
  useEffect(() => {
    if (onToggleNav) {
      onToggleNav(subView === 'MENU');
    }
  }, [subView, onToggleNav]);

  // SOS State
  const [sosStatus, setSosStatus] = useState<'IDLE' | 'CONNECTING' | 'SENT' | 'SMS_FALLBACK'>('IDLE');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  
  // SOS Auto Countdown State (Click & Count)
  const [sosCountdown, setSosCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const sosTimerRef = useRef<any>(null);
  
  // Safe Zone State
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [isFetchingSafeZones, setIsFetchingSafeZones] = useState(false);
  const [mapStatus, setMapStatus] = useState('Menggunakan data offline...');
  
  // Navigation Simulation State
  const [navMode, setNavMode] = useState<NavMode>('IDLE');
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [navStep, setNavStep] = useState(0); // Simulates moving along route

  // EchoSMS State (Renamed from EchoLink)
  const [messages, setMessages] = useState<{user: string, text: string, time: string, isAi?: boolean}[]>([
      { user: 'System', text: 'Fitur EchoSMS Aktif. Pesan akan dikirim via jaringan seluler biasa (GSM).', time: '10:00', isAi: true },
      { user: 'Ibu', text: 'Kamu dimana nak? Kami cemas.', time: '10:05' }
  ]);
  const [echoInput, setEchoInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Radio Finder State & Audio Engine
  const [radioList, setRadioList] = useState<any[]>([]);
  const [detectedCity, setDetectedCity] = useState<string>('Mencari Lokasi...');
  const [activeStation, setActiveStation] = useState<any>(null);
  const [radioStatus, setRadioStatus] = useState<'OFF' | 'TUNING' | 'PLAYING'>('OFF');
  
  // Refs for Audio Engine
  const radioAudioCtx = useRef<AudioContext | null>(null);
  const radioNoiseNode = useRef<AudioBufferSourceNode | null>(null);
  const radioGainNode = useRef<GainNode | null>(null);
  const radioOscillator = useRef<OscillatorNode | null>(null);

  // --- SOS TOOLKIT STATE ---
  const [isMorseActive, setIsMorseActive] = useState(false);
  const [isWhistleActive, setIsWhistleActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false); // For visual effect
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // --- SAKU SELAMAT STATE ---
  const [triageStep, setTriageStep] = useState<TriageStep>('CONSCIOUSNESS');
  const [activeScenario, setActiveScenario] = useState<MedicalScenario>(null);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeRef = useRef<any>(null);
  const metronomeAudioCtx = useRef<AudioContext | null>(null);

  // Morse Code Logic Effect
  useEffect(() => {
    let interval: any;
    if (isMorseActive) {
        let step = 0;
        // S (...) O (---) S (...) pattern
        const sequence = [
            true, false, true, false, true, false, false, // S
            true, true, true, false, true, true, true, false, true, true, true, false, false, // O
            true, false, true, false, true, false, false, false, false // S + wait
        ];
        
        interval = setInterval(() => {
            setFlashOn(sequence[step % sequence.length]);
            step++;
        }, 200); // 200ms beat
    } else {
        setFlashOn(false);
    }
    return () => clearInterval(interval);
  }, [isMorseActive]);

  // Sonic Whistle Logic
  const toggleWhistle = () => {
      if (isWhistleActive) {
          // Stop
          stopToolkitSounds();
      } else {
          // Start
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) {
              alert("Audio API tidak didukung browser ini");
              return;
          }
          
          const ctx = new AudioContext();
          audioContextRef.current = ctx;
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle'; // Piercing sound
          osc.frequency.setValueAtTime(3000, ctx.currentTime); // 3000Hz (High pitch)
          
          // Modulate frequency slightly for alarm effect (Siren)
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 2; // 2Hz modulation
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 500; // +/- 500Hz
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          
          oscillatorRef.current = osc;
          setIsWhistleActive(true);
      }
  };

  const stopToolkitSounds = () => {
      // Stop Visual
      setIsMorseActive(false);
      setFlashOn(false);

      // Stop Audio
      if (oscillatorRef.current) {
          try {
              oscillatorRef.current.stop();
              oscillatorRef.current.disconnect();
          } catch(e) {
              // Ignore already stopped
          }
          oscillatorRef.current = null;
      }

      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }

      setIsWhistleActive(false);
  };

  // Cleanup Audio on unmount or switch
  useEffect(() => {
      return () => {
          stopRadio();
          stopMetronome();
          stopToolkitSounds();
          window.speechSynthesis.cancel();
          if (sosTimerRef.current) clearInterval(sosTimerRef.current);
      };
  }, []);


  useEffect(() => {
    if (subView === 'ECHO_SMS') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, subView]);

  // Simulate moving navigation
  useEffect(() => {
    let interval: any;
    if (navMode === 'NAVIGATING') {
        interval = setInterval(() => {
            setNavStep((prev) => (prev + 1) % 100);
        }, 1000);
    } else {
        setNavStep(0);
    }
    return () => clearInterval(interval);
  }, [navMode]);

  // --- RADIO FINDER LOGIC ---
  const initRadioFinder = () => {
      setRadioList([]);
      setDetectedCity('Mendeteksi GPS...');
      
      // 1. Simulate getting LastKnownLocation from GPS
      // In a real app, this uses navigator.geolocation or saved state
      setTimeout(() => {
          const simulatedCity = "Jakarta"; // Mock result based on coords
          setDetectedCity(simulatedCity.toUpperCase());
          
          // 2. Filter Local JSON Database (Offline Logic)
          const filtered = radioDataRaw.filter((r: any) => r.city === simulatedCity);
          setRadioList(filtered);
      }, 1500);
  };

  useEffect(() => {
      if (subView === 'RADIO_FINDER') {
          initRadioFinder();
      } else {
          stopRadio(); // Stop playing if leaving the view
      }
  }, [subView]);

  // --- SAKU SELAMAT LOGIC ---
  const resetSakuSelamat = () => {
      setTriageStep('CONSCIOUSNESS');
      setActiveScenario(null);
      setGuideStepIndex(0);
      stopMetronome();
      window.speechSynthesis.cancel();
  };

  const speakInstruction = (text: string) => {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.lang = 'id-ID';
      msg.rate = 1.0;
      msg.volume = 1;
      window.speechSynthesis.speak(msg);
  };

  const startMetronome = () => {
      if (isMetronomeActive) return;
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      metronomeAudioCtx.current = ctx;
      
      setIsMetronomeActive(true);
      
      // 110 BPM = ~545ms interval
      metronomeRef.current = window.setInterval(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = 1000; // 1kHz beep
          osc.type = 'square';
          
          gain.gain.value = 0.5;
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
      }, 545);
  };

  const stopMetronome = () => {
      if (metronomeRef.current) {
          clearInterval(metronomeRef.current);
          metronomeRef.current = null;
      }
      if (metronomeAudioCtx.current) {
          metronomeAudioCtx.current.close();
          metronomeAudioCtx.current = null;
      }
      setIsMetronomeActive(false);
  };

  // Effect to handle audio/tools when step changes in Guide Mode
  useEffect(() => {
      if (subView === 'SAKU_SELAMAT' && triageStep === 'GUIDE' && activeScenario) {
          const currentStep = MEDICAL_GUIDES[activeScenario].steps[guideStepIndex];
          
          // 1. Play Voice
          speakInstruction(currentStep.audio);

          // 2. Handle Tools
          if (currentStep.tool === 'METRONOME') {
              startMetronome();
          } else {
              stopMetronome();
          }
      } else {
          stopMetronome();
          window.speechSynthesis.cancel();
      }
  }, [subView, triageStep, activeScenario, guideStepIndex]);


  // --- RADIO AUDIO SIMULATION ENGINE ---
  const playRadio = (station: any) => {
      // 1. Stop current
      stopRadio();
      setActiveStation(station);
      setRadioStatus('TUNING');

      // 2. Init Audio Context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      radioAudioCtx.current = ctx;

      // 3. Create White Noise (Static)
      const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1; // Random noise
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.8; // High static initially (Tuning)
      
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      radioNoiseNode.current = noise;
      radioGainNode.current = noiseGain;

      // 4. Simulate Tuning -> Locking -> Broadcast
      setTimeout(() => {
          if (!radioAudioCtx.current) return;
          
          setRadioStatus('PLAYING');
          
          // Reduce noise (signal locked)
          noiseGain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1);

          // Alert Tone (Sine Wave)
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1kHz test tone
          oscGain.gain.setValueAtTime(0.1, ctx.currentTime);
          
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          
          // Pulse tone twice
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
          
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1000, ctx.currentTime + 0.6);
          osc2.connect(oscGain);
          osc2.start(ctx.currentTime + 0.6);
          osc2.stop(ctx.currentTime + 1.1);

          // Speech Synthesis (Simulated Broadcast)
          const msg = new SpeechSynthesisUtterance();
          msg.text = `Perhatian. Ini adalah siaran darurat dari ${station.station}. Frekuensi ${station.frequency}. Harap tetap tenang. Tim evakuasi sedang menuju lokasi. Pantau terus frekuensi ini.`;
          msg.lang = 'id-ID';
          msg.rate = 0.9;
          msg.volume = 1;
          window.speechSynthesis.speak(msg);

          // Loop logic for speech (Simulated)
          msg.onend = () => {
             if(radioAudioCtx.current) {
                 setTimeout(() => window.speechSynthesis.speak(msg), 3000);
             }
          };

      }, 1500); // 1.5s Tuning time
  };

  const stopRadio = () => {
      // Stop Web Audio API
      if (radioAudioCtx.current) {
          radioNoiseNode.current?.stop();
          radioOscillator.current?.stop();
          radioAudioCtx.current.close();
          radioAudioCtx.current = null;
      }
      // Stop Speech
      window.speechSynthesis.cancel();
      
      setActiveStation(null);
      setRadioStatus('OFF');
  };


  const handleSOS = () => {
    // 1. Cek Koneksi (Menggunakan toggle simulasi untuk demo)
    const isOffline = isSimulatedOffline || !navigator.onLine;

    if (isOffline) {
        // --- LOGIKA SMS FALLBACK GATEWAY ---
        setSosStatus('SMS_FALLBACK');
        
        // Simulasi Delay Background Service
        setTimeout(() => {
            const userId = "user-123";
            const coords = "-6.2088,106.8456";
            const bloodType = "O+";
            const messageBody = `SOS#${userId}#${coords}#${bloodType}`;
            const recipient = "9110";

            // Trigger Native SMS Intent
            window.open(`sms:${recipient}?body=${encodeURIComponent(messageBody)}`, '_self');
            
            // Update UI
            setSosStatus('SENT');
            setTimeout(() => setSosStatus('IDLE'), 5000);
        }, 1500);

    } else {
        // --- LOGIKA INTERNET BIASA ---
        setSosStatus('CONNECTING');
        setTimeout(() => {
          setSosStatus('SENT');
          setTimeout(() => setSosStatus('IDLE'), 3000);
        }, 2000);
    }
  };

  // SOS Single Tap Handler with Auto Countdown
  const handleSOSClick = () => {
      if (sosStatus !== 'IDLE') return;
      if (isCountingDown) {
          // Cancel if clicking again during countdown
          clearInterval(sosTimerRef.current);
          setIsCountingDown(false);
          setSosCountdown(3);
          return;
      }

      // Start Countdown
      setIsCountingDown(true);
      setSosCountdown(3);
      
      // Haptic feedback start
      if (navigator.vibrate) navigator.vibrate(50);

      sosTimerRef.current = setInterval(() => {
          setSosCountdown(prev => {
              if (prev <= 1) {
                  clearInterval(sosTimerRef.current);
                  setIsCountingDown(false);
                  handleSOS(); // Trigger real SOS
                  if (navigator.vibrate) navigator.vibrate([200, 100, 200]); // Success vibration
                  return 0;
              }
              if (navigator.vibrate) navigator.vibrate(50); // Tick vibration
              return prev - 1;
          });
      }, 1000);
  };

  const fetchSafeZones = async () => {
      setIsFetchingSafeZones(true);
      setMapStatus('Menghubungkan ke satelit Google Maps...');
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: "Find 3 hospitals or evacuation centers near Central Jakarta. Return a simple list with name and type (Hospital/Shelter).",
              config: {
                  tools: [{ googleMaps: {} }],
              }
          });
          
          if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
              setMapStatus('Data Lokasi Live Terupdate');
              
              const text = response.text || "";
              const lines = text.split('\n').filter(l => l.trim().length > 5).slice(0, 3);
              
              const newZones = lines.map((line, i) => ({
                  name: line.replace(/[*#\d.-]/g, '').trim().substring(0, 20),
                  dist: `${(i + 1) * 1.2} km`,
                  type: line.toLowerCase().includes('hospital') || line.toLowerCase().includes('rs') ? 'Hospital' : 'Shelter',
                  capacity: Math.floor(Math.random() * 50) + 10 + ' Bed'
              }));

              if (newZones.length > 0) {
                  setSafeZones(newZones);
              } else {
                  setSafeZones([
                      { name: "RSUD Tarakan", dist: "1.2 km", type: "Hospital", capacity: "12 Bed" },
                      { name: "Posko Monas", dist: "2.5 km", type: "Shelter", capacity: "500 Org" },
                      { name: "RSCM Kencana", dist: "3.1 km", type: "Hospital", capacity: "Full" }
                  ]);
              }
          } else {
              setMapStatus('Mode Offline: Data Cache');
              setSafeZones([
                  { name: "Zona Aman A (Offline)", dist: "500m", type: "Shelter", capacity: "Tersedia" },
                  { name: "Klinik Darurat B", dist: "1.1 km", type: "Hospital", capacity: "Penuh" }
              ]);
          }
      } catch (e) {
          console.error(e);
          setMapStatus('Gagal terhubung. Menggunakan data terakhir.');
          setSafeZones([
              { name: "Zona Aman A (Offline)", dist: "500m", type: "Shelter", capacity: "Tersedia" },
              { name: "Klinik Darurat B", dist: "1.1 km", type: "Hospital", capacity: "Penuh" }
          ]);
      } finally {
          setIsFetchingSafeZones(false);
      }
  };

  useEffect(() => {
      if (subView === 'SAFE_ZONE') {
          fetchSafeZones();
      }
  }, [subView]);

  const startNavigation = (zone?: any) => {
      const target = zone || safeZones[0] || { name: "Zona Aman A", dist: "500m" };
      setActiveRoute({
          target: target.name,
          dist: target.dist,
          eta: '5 min',
          instruction: 'Belok Kiri di Jl. Thamrin'
      });
      setNavMode('NAVIGATING');
  };

  const handleBroadcastSMS = () => {
    // Logic "One Click" tanpa mengetik
    const coords = "-6.2088,106.8456";
    const batt = "15";
    const msg = `Saya dalam bahaya di ${coords}. Baterai ${batt}%. Tolong.`;
    
    // Add to UI log immediately
    setMessages(prev => [...prev, {
      user: 'Anda',
      text: `[SIARAN OTOMATIS]\n${msg}`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);

    setIsAiTyping(true);

    // Simulasi pengiriman ke 5 nomor + posko
    setTimeout(() => {
        setIsAiTyping(false);
        setMessages(prev => [...prev, {
            user: 'System',
            text: '✅ Pesan tersiarkan ke: Ayah, Ibu, Kakak, Adik, Paman, dan Posko SAR Terdekat.',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isAi: true
        }]);
    }, 1500);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMsg = { user: 'Anda', text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newMsg]);
    setEchoInput('');
    setIsAiTyping(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a Rescue Coordinator in an Indonesian disaster zone. User sent: "${text}". Reply in Indonesian. Brief, operational, and reassuring. Under 15 words.`,
        });
        
        setIsAiTyping(false);
        if (response.text) {
             setMessages(prev => [...prev, {
                 user: 'Koordinator SAR',
                 text: response.text,
                 time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                 isAi: true
             }]);
        }
    } catch (e) {
        setIsAiTyping(false);
        setMessages(prev => [...prev, {
             user: 'System',
             text: 'Pesan diterima. Unit terdekat dinotifikasi.',
             time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
             isAi: true
        }]);
    }
  };

  const QuickActions = [
      "Banyak Korban", "Butuh Medis", "Terjebak", "Butuh Makanan", "Deteksi Lokasi Saya"
  ];

  const renderMenu = () => (
    <div className="h-full flex flex-col pt-2 px-2 pb-32">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 to-rose-800 text-white p-6 shadow-xl mb-6">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm animate-pulse">
                <AlertOctagon size={16} className="text-white" />
             </div>
             <span className="text-xs font-bold tracking-wider text-red-100 uppercase">Mode Darurat Aktif</span>
           </div>
           <h1 className="text-2xl font-black mb-2 leading-tight">Tetap Tenang & Waspada</h1>
           <p className="text-red-100 text-sm leading-relaxed mb-4">
             Fokus pada keselamatan diri. Gunakan fitur darurat hemat data dibawah ini untuk bantuan.
           </p>
           
           <div className="flex gap-3">
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold text-white">LIVE</p>
                <p className="text-[10px] opacity-80 text-red-100">Status Jaringan</p>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold text-white">2G/3G</p>
                <p className="text-[10px] opacity-80 text-red-100">Low Bandwidth</p>
             </div>
           </div>
         </div>
      </div>

      <div className="grid gap-4">
        <button 
          onClick={() => setSubView('SOS')}
          className="w-full h-40 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/30 flex flex-col items-center justify-center relative overflow-hidden group active:scale-[0.98] transition-transform"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            {/* Animated Ripple for Menu Button */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-full bg-red-500/30 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <Signal size={48} className="mb-2 animate-pulse" />
            <h3 className="text-2xl font-black tracking-widest relative z-10">TOMBOL DARURAT</h3>
            <p className="text-xs font-medium opacity-90 relative z-10">Low-Bandwidth (2G GSM)</p>
        </button>

        {/* SAKU SELAMAT BUTTON - NEW FEATURE */}
        <button 
          onClick={() => setSubView('SAKU_SELAMAT')}
          className="w-full h-24 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center px-6 relative overflow-hidden group active:scale-[0.98] transition-transform"
        >
            <div className="absolute right-[-15px] bottom-[-15px] w-24 h-24 bg-red-100 rounded-full opacity-50 group-hover:scale-125 transition-transform"></div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4 shadow-sm relative z-10">
                <BriefcaseMedical size={24} />
            </div>
            <div className="text-left relative z-10">
                <h3 className="text-lg font-black text-slate-800 leading-tight">SAKU SELAMAT</h3>
                <p className="text-xs text-slate-500">P3K Darurat (Tanpa Internet)</p>
            </div>
            <ArrowRight size={20} className="ml-auto text-slate-300 relative z-10" />
        </button>

        <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-3 flex flex-col items-center justify-center h-28 active:scale-[0.98]" onClick={() => setSubView('SAFE_ZONE')}>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <MapPin size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">SafeZone</h3>
                <p className="text-[9px] text-slate-500 text-center">Peta Evakuasi</p>
            </GlassCard>

            <GlassCard className="p-3 flex flex-col items-center justify-center h-28 active:scale-[0.98]" onClick={() => setSubView('ECHO_SMS')}>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">EchoSMS</h3>
                <p className="text-[9px] text-slate-500 text-center">SMS Darurat</p>
            </GlassCard>

            <GlassCard className="p-3 flex flex-col items-center justify-center h-28 active:scale-[0.98] border-l-4 border-l-orange-500 relative overflow-hidden" onClick={() => setSubView('SOS_TOOLKIT')}>
                <div className="absolute right-[-10px] top-[-20px] w-24 h-24 bg-orange-200 rounded-full blur-2xl opacity-50"></div>
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2 relative z-10">
                    <Zap size={20} />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-slate-800 text-sm">Toolkit</h3>
                    <p className="text-[9px] text-slate-500 text-center">Senter/Peluit</p>
                </div>
            </GlassCard>

            <GlassCard className="p-3 flex flex-col items-center justify-center h-28 active:scale-[0.98] bg-slate-900 border-none relative overflow-hidden" onClick={() => setSubView('RADIO_FINDER')}>
                <div className="absolute inset-0 bg-yellow-500/10 opacity-50"></div>
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2 relative z-10">
                    <Radio size={20} />
                </div>
                <div className="relative z-10 text-center">
                    <h3 className="font-bold text-white text-sm">Radio Finder</h3>
                    <p className="text-[9px] text-yellow-400 font-bold">100% Offline</p>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );

  const renderSOS = () => {
    // Dynamic styles based on Offline/Online mode
    const isOfflineMode = isSimulatedOffline;
    const themeBg = isOfflineMode ? 'bg-slate-900' : 'bg-slate-50';
    const themeText = isOfflineMode ? 'text-white' : 'text-slate-800';
    const themeCard = isOfflineMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const accentColor = isOfflineMode ? 'text-orange-500' : 'text-emerald-600';
    const accentBg = isOfflineMode ? 'bg-orange-500' : 'bg-emerald-600';

    return (
      <div className={`h-full flex flex-col pt-safe-top pb-safe-bottom animate-in slide-in-from-right relative transition-colors duration-500 ${themeBg}`}>
         {/* Top Bar */}
         <div className="p-4 flex items-center justify-between relative z-10">
             <button onClick={() => setSubView('MENU')} className={`p-2 rounded-full transition-colors border ${isOfflineMode ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' : 'bg-white/50 hover:bg-white border-slate-100 text-slate-600'}`}>
                 <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${isOfflineMode ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}
                 >
                     {isOfflineMode ? <Smartphone size={12}/> : <Satellite size={12}/>}
                     {isOfflineMode ? 'MODE OFFLINE (SMS)' : 'MODE ONLINE (GPS)'}
                 </button>
             </div>
         </div>
  
         <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
             
             {/* Success State */}
             {sosStatus === 'SENT' && (
                 <div className="text-center animate-in zoom-in duration-500">
                     <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 relative ${isOfflineMode ? 'bg-orange-900/20' : 'bg-green-100'}`}>
                         <div className={`absolute inset-0 border-4 rounded-full animate-ping ${isOfflineMode ? 'border-orange-500/30' : 'border-green-500/30'}`}></div>
                         <Check size={64} className={isOfflineMode ? 'text-orange-500' : 'text-green-600'} strokeWidth={3} />
                     </div>
                     <h2 className={`text-3xl font-black mb-2 ${themeText}`}>SOS TERKIRIM</h2>
                     <p className={isOfflineMode ? 'text-slate-400' : 'text-slate-500'}>
                         {isOfflineMode ? 'Pesan SMS darurat telah dikirim ke server gateway.' : 'Sinyal GPS darurat telah diterima pusat komando.'}
                     </p>
                     <div className={`mt-8 p-4 rounded-2xl border shadow-sm ${themeCard} ${themeText}`}>
                         <p className="text-xs opacity-60 uppercase font-bold mb-1">Tiket Bantuan</p>
                         <p className={`font-mono text-lg font-bold ${accentColor}`}>#SOS-{Math.floor(Math.random() * 9000) + 1000}</p>
                     </div>
                     <button onClick={() => setSosStatus('IDLE')} className={`mt-6 text-xs font-bold underline ${isOfflineMode ? 'text-orange-400' : 'text-slate-400'}`}>Reset Status</button>
                 </div>
             )}
  
             {/* Active/Idle State */}
             {sosStatus !== 'SENT' && (
                 <>
                     {/* Main Button Container */}
                     <div className="relative w-72 h-72 flex items-center justify-center">
                         {/* Ripples */}
                         <div className={`absolute inset-0 rounded-full transition-transform duration-1000 ${isCountingDown ? 'animate-ping opacity-30' : 'scale-100 opacity-10'} ${isOfflineMode ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                         
                         {/* SVG Progress Ring (Countdown) */}
                         {isCountingDown && (
                             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20">
                                 <circle cx="144" cy="144" r="136" fill="none" stroke={isOfflineMode ? '#334155' : '#e2e8f0'} strokeWidth="8" />
                                 <circle
                                     cx="144"
                                     cy="144"
                                     r="136"
                                     fill="none"
                                     stroke={isOfflineMode ? '#f97316' : '#ef4444'} 
                                     strokeWidth="8"
                                     strokeDasharray={2 * Math.PI * 136}
                                     strokeDashoffset={2 * Math.PI * 136 * (1 - (3 - sosCountdown) / 3)}
                                     strokeLinecap="round"
                                     className="transition-all duration-1000 ease-linear"
                                 />
                             </svg>
                         )}
  
                         {/* The Button */}
                         <button
                             onClick={handleSOSClick}
                             className={`
                                 relative z-20 w-60 h-60 rounded-full 
                                 flex flex-col items-center justify-center text-white
                                 transition-all duration-200 shadow-2xl
                                 ${isCountingDown ? 'scale-95' : 'scale-100 hover:scale-105'}
                                 ${isOfflineMode 
                                     ? 'bg-gradient-to-b from-orange-600 to-orange-800 shadow-orange-900/50 ring-4 ring-orange-900' 
                                     : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-500/40 ring-4 ring-white'}
                             `}
                         >
                             {/* Shine Effect */}
                             <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                             
                             {sosStatus === 'CONNECTING' ? (
                                 <Loader2 size={64} className="animate-spin" />
                             ) : isCountingDown ? (
                                 <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                     <span className="text-6xl font-black mb-2 font-mono">{Math.ceil(sosCountdown)}</span>
                                     <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                         Ketuk untuk Batal
                                     </span>
                                 </div>
                             ) : (
                                 <>
                                     <Fingerprint size={64} className={`mb-2 opacity-80 ${isOfflineMode ? 'text-orange-100' : 'text-red-100'}`} />
                                     <span className="text-4xl font-black tracking-tighter drop-shadow-md">SOS</span>
                                     <span className="text-[10px] font-bold mt-1 opacity-70 tracking-widest uppercase">
                                         Tekan Sekali
                                     </span>
                                 </>
                             )}
                         </button>
                     </div>
  
                     {/* Info Box */}
                     <div className={`mt-12 w-full max-w-xs backdrop-blur-md rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-4 ${themeCard}`}>
                         {isOfflineMode ? (
                             // Offline Info
                             <div className="flex items-center gap-3 w-full">
                                 <div className="p-2 bg-orange-900/50 rounded-lg text-orange-500"><MessageSquare size={20} /></div>
                                 <div>
                                     <p className="text-xs font-bold text-orange-500 uppercase">Jalur SMS (2G)</p>
                                     <p className="text-[10px] text-slate-400">Lokasi dikirim via teks koordinat.</p>
                                 </div>
                             </div>
                         ) : (
                             // Online Info
                             <div className="flex items-center gap-3 w-full">
                                 <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Satellite size={20} /></div>
                                 <div>
                                     <p className="text-xs font-bold text-emerald-600 uppercase">GPS Tracking Live</p>
                                     <p className="text-[10px] text-slate-500">Akurasi tinggi (4G/LTE)</p>
                                 </div>
                             </div>
                         )}
                     </div>
  
                     <p className={`text-[10px] text-center mt-4 px-4 leading-relaxed max-w-xs ${isOfflineMode ? 'text-slate-500' : 'text-slate-400'}`}>
                         {isOfflineMode 
                             ? "Mode ini aktif otomatis saat tidak ada sinyal internet. Pesan akan dikirim ke gateway SMS darurat."
                             : "Mode ini menggunakan data internet minimal untuk mengirim lokasi real-time dan foto situasi."}
                     </p>
                 </>
             )}
         </div>
      </div>
    );
  };

  const renderSafeZone = () => (
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom bg-slate-50 animate-in slide-in-from-right">
          {navMode === 'NAVIGATING' && activeRoute ? (
             // Navigation UI
             <div className="flex-1 flex flex-col bg-white">
                 <div className="bg-emerald-600 text-white p-6 rounded-b-[2rem] shadow-xl z-10">
                     <div className="flex items-start gap-4">
                         <div className="mt-1"><CornerUpRight size={48} /></div>
                         <div className="flex-1">
                             <h2 className="text-3xl font-bold mb-1">{activeRoute.instruction}</h2>
                             <p className="text-emerald-100 text-lg">Menuju {activeRoute.target}</p>
                         </div>
                     </div>
                     <div className="mt-6 flex justify-between items-end">
                         <div>
                             <p className="text-4xl font-black">{activeRoute.dist}</p>
                             <p className="opacity-80 font-medium">Estimasi {activeRoute.eta}</p>
                         </div>
                         <button onClick={() => setNavMode('IDLE')} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95">Akhiri</button>
                     </div>
                 </div>
                 <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                     {/* Map Placeholder */}
                     <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20"></div>
                     <div className="relative z-10 flex flex-col items-center animate-pulse">
                         <Navigation size={64} className="text-blue-600 mb-4 fill-blue-600" />
                         <p className="font-bold text-slate-500">Simulasi Navigasi...</p>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="absolute bottom-10 left-10 right-10 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                         <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${navStep}%` }}></div>
                     </div>
                 </div>
             </div>
          ) : (
             // List UI
             <>
                <div className="p-4 flex items-center gap-3 bg-white shadow-sm z-10">
                    <button onClick={() => setSubView('MENU')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg">SafeZone</h2>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                           {isFetchingSafeZones ? <Loader2 size={10} className="animate-spin" /> : <Wifi size={10} />}
                           {mapStatus}
                        </p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Simulated Map Preview */}
                    <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4 relative overflow-hidden border border-slate-300">
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-40"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute"></div>
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                        </div>
                        {/* Pins */}
                        <div className="absolute top-1/3 left-1/4 text-red-500"><MapPin size={24} fill="currentColor" /></div>
                        <div className="absolute bottom-1/4 right-1/3 text-green-600"><Hospital size={24} fill="currentColor" /></div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm mb-2">Lokasi Terdekat</h3>
                    {isFetchingSafeZones ? (
                        <div className="text-center py-10">
                            <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-2" />
                            <p className="text-xs text-slate-400">Mencari titik aman...</p>
                        </div>
                    ) : (
                        safeZones.map((zone, idx) => (
                            <GlassCard key={idx} className="p-4 flex items-center gap-4 active:scale-[0.98]" onClick={() => startNavigation(zone)}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${zone.type === 'Hospital' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {zone.type === 'Hospital' ? <Hospital size={24} /> : <ShieldAlert size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{zone.name}</h4>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {zone.dist}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><Users size={10}/> {zone.capacity}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Navigation size={18} />
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
             </>
          )}
      </div>
  );

  const renderEchoSMS = () => (
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom bg-slate-50 animate-in slide-in-from-right">
          <div className="p-4 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                  <button onClick={() => setSubView('MENU')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
                  <div>
                      <h2 className="font-bold text-lg">EchoSMS</h2>
                      <p className="text-[10px] text-green-600 font-bold flex items-center gap-1"><WifiOff size={10}/> Mode Hemat Data</p>
                  </div>
              </div>
              <button onClick={handleBroadcastSMS} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md animate-pulse">
                  Broadcast SOS
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.user === 'Anda' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm relative ${msg.user === 'Anda' ? 'bg-blue-600 text-white rounded-tr-none' : msg.isAi ? 'bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                          {msg.isAi && <div className="text-[9px] font-bold text-emerald-600 mb-1 flex items-center gap-1"><Zap size={10} /> AI ASSISTANT</div>}
                          <p>{msg.text}</p>
                          <span className={`text-[9px] block mt-1 text-right ${msg.user === 'Anda' ? 'text-blue-100' : 'text-slate-400'}`}>{msg.time}</span>
                      </div>
                  </div>
              ))}
              {isAiTyping && (
                  <div className="flex justify-start">
                      <div className="bg-emerald-50 p-3 rounded-xl rounded-tl-none border border-emerald-100 flex gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t flex gap-2">
              <input 
                 value={echoInput}
                 onChange={(e) => setEchoInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(echoInput)}
                 placeholder="Tulis pesan darurat..." 
                 className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 border border-slate-200" 
              />
              <button 
                 onClick={() => handleSendMessage(echoInput)}
                 disabled={!echoInput.trim()}
                 className="p-3 bg-blue-600 rounded-full text-white shadow-lg active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                  <Send size={20} />
              </button>
          </div>
      </div>
  );

  const renderSosToolkit = () => (
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom bg-slate-900 animate-in slide-in-from-right relative overflow-hidden">
          {/* Flash Effect Overlay */}
          <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${flashOn ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className="p-4 flex items-center gap-3 relative z-10">
               <button onClick={() => { stopToolkitSounds(); setSubView('MENU'); }} className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"><ArrowLeft size={20}/></button>
               <h2 className="font-bold text-lg text-white">Survival Toolkit</h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-8 relative z-10 p-6">
               {/* SOS Visualizer */}
               <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${flashOn ? 'bg-white border-white shadow-[0_0_50px_rgba(255,255,255,0.8)]' : 'bg-transparent border-slate-600'}`}>
                   <Zap size={48} className={`transition-colors duration-200 ${flashOn ? 'text-slate-900' : 'text-slate-600'}`} />
               </div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                   <button 
                     onClick={() => setIsMorseActive(!isMorseActive)}
                     className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 border ${isMorseActive ? 'bg-white text-slate-900 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                   >
                       <Lightbulb size={32} />
                       <span className="font-bold">Senter SOS</span>
                       <span className="text-[10px] uppercase font-mono">{isMorseActive ? 'AKTIF' : 'MATI'}</span>
                   </button>

                   <button 
                     onClick={toggleWhistle}
                     className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 border ${isWhistleActive ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                   >
                       <Volume2 size={32} />
                       <span className="font-bold">Peluit Sonic</span>
                       <span className="text-[10px] uppercase font-mono">{isWhistleActive ? 'BUNYI' : 'DIAM'}</span>
                   </button>
               </div>
               
               <div className="bg-slate-800 p-4 rounded-xl text-center max-w-xs">
                   <p className="text-xs text-slate-400">
                       Gunakan Senter SOS untuk memberi sinyal visual jarak jauh. Peluit Sonic menghasilkan frekuensi tinggi (3kHz) yang menembus reruntuhan.
                   </p>
               </div>
          </div>
      </div>
  );

  const renderRadioFinder = () => (
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom bg-slate-100 animate-in slide-in-from-right">
           <div className="p-4 flex items-center gap-3 bg-white shadow-sm z-10">
               <button onClick={() => setSubView('MENU')} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
               <h2 className="font-bold text-lg">Radio Finder</h2>
           </div>

           <div className="bg-slate-800 text-white p-6 relative overflow-hidden shrink-0">
               {/* Frequency Viz */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <p className="text-xs text-slate-400 font-mono mb-1">CURRENT FREQUENCY</p>
                       <h1 className="text-4xl font-black font-mono tracking-wider text-green-400">
                           {activeStation ? activeStation.frequency : '---.- FM'}
                       </h1>
                   </div>
                   <div className={`px-2 py-1 rounded text-[10px] font-bold ${radioStatus === 'PLAYING' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                       {radioStatus === 'PLAYING' ? 'LIVE' : radioStatus === 'TUNING' ? 'TUNING...' : 'OFF'}
                   </div>
               </div>
               
               {/* Location Info */}
               <div className="flex items-center gap-2 text-sm text-slate-300">
                   <MapPin size={14} className="text-blue-400" />
                   <span>{detectedCity}</span>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {radioList.length === 0 && detectedCity.includes('Mencari') ? (
                   <div className="py-10 text-center">
                       <Loader2 size={32} className="mx-auto text-slate-400 animate-spin mb-2" />
                       <p className="text-xs text-slate-500">Memindai frekuensi lokal...</p>
                   </div>
               ) : (
                   radioList.map((station, idx) => (
                       <div 
                         key={idx} 
                         onClick={() => activeStation?.station === station.station ? stopRadio() : playRadio(station)}
                         className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeStation?.station === station.station ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-300' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                       >
                           <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStation?.station === station.station ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                   {activeStation?.station === station.station && radioStatus !== 'OFF' ? (
                                       radioStatus === 'TUNING' ? <Loader2 size={20} className="animate-spin" /> : <Speaker size={20} className="animate-pulse" />
                                   ) : (
                                       <Radio size={20} />
                                   )}
                               </div>
                               <div>
                                   <h4 className={`font-bold ${activeStation?.station === station.station ? 'text-blue-700' : 'text-slate-800'}`}>{station.station}</h4>
                                   <p className="text-xs text-slate-500">{station.frequency} • {station.type}</p>
                               </div>
                           </div>
                           {activeStation?.station === station.station && (
                               <div className="flex gap-1 h-3 items-end">
                                   <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite] h-full"></div>
                                   <div className="w-1 bg-blue-500 animate-[bounce_1.2s_infinite] h-2/3"></div>
                                   <div className="w-1 bg-blue-500 animate-[bounce_0.8s_infinite] h-1/2"></div>
                               </div>
                           )}
                       </div>
                   ))
               )}
           </div>
      </div>
  );

  const renderSakuSelamat = () => {
    const nextGuideStep = () => {
        if (!activeScenario) return;
        if (guideStepIndex < MEDICAL_GUIDES[activeScenario].steps.length - 1) {
            setGuideStepIndex(prev => prev + 1);
        }
    };

    const prevGuideStep = () => {
        if (guideStepIndex > 0) {
            setGuideStepIndex(prev => prev - 1);
        }
    };

    return (
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom bg-slate-50 animate-in slide-in-from-right">
           <div className="p-4 flex items-center gap-3 bg-white shadow-sm z-10">
               <button onClick={() => {
                   if (triageStep === 'CONSCIOUSNESS') {
                       setSubView('MENU');
                   } else {
                       resetSakuSelamat();
                   }
               }} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
               <div>
                   <h2 className="font-bold text-lg text-red-600">Saku Selamat</h2>
                   <p className="text-[10px] text-slate-500 font-bold">P3K Offline Guide</p>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
               {/* TRIAGE STEP 1 */}
               {triageStep === 'CONSCIOUSNESS' && (
                   <div className="w-full max-w-sm flex flex-col gap-6 mt-10 text-center animate-in fade-in">
                       <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                           <Activity size={64} />
                       </div>
                       <div>
                           <h3 className="text-2xl font-black text-slate-800 mb-2">Cek Kesadaran</h3>
                           <p className="text-slate-600">Tepuk bahu korban & panggil dengan keras. Apakah korban merespon?</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4 w-full">
                           <button onClick={() => setTriageStep('SELECT_INJURY')} className="py-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-lg hover:bg-emerald-200">SADAR</button>
                           <button onClick={() => setTriageStep('BREATHING')} className="py-4 bg-red-100 text-red-700 rounded-xl font-bold text-lg hover:bg-red-200">TIDAK SADAR</button>
                       </div>
                   </div>
               )}

               {/* TRIAGE STEP 2 */}
               {triageStep === 'BREATHING' && (
                   <div className="w-full max-w-sm flex flex-col gap-6 mt-10 text-center animate-in fade-in">
                       <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                           <Wind size={64} />
                       </div>
                       <div>
                           <h3 className="text-2xl font-black text-slate-800 mb-2">Cek Pernapasan</h3>
                           <p className="text-slate-600">Dekatkan telinga ke hidung/mulut korban. Lihat pergerakan dada selama 10 detik.</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4 w-full">
                           <button onClick={() => setTriageStep('SELECT_INJURY')} className="py-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-lg hover:bg-emerald-200">BERNAPAS</button>
                           <button onClick={() => { setActiveScenario('CPR'); setTriageStep('GUIDE'); }} className="py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-500/30">TIDAK BERNAPAS</button>
                       </div>
                   </div>
               )}

               {/* TRIAGE STEP 3 */}
               {triageStep === 'SELECT_INJURY' && (
                   <div className="w-full max-w-sm animate-in fade-in">
                       <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">Pilih Kondisi Darurat</h3>
                       <div className="grid gap-3">
                           {Object.entries(MEDICAL_GUIDES).filter(([key]) => key !== 'CPR').map(([key, guide]) => (
                               <GlassCard key={key} className="p-4 flex items-center gap-4 active:scale-[0.98]" onClick={() => { setActiveScenario(key as MedicalScenario); setTriageStep('GUIDE'); }}>
                                   <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                       <BriefcaseMedical size={24} />
                                   </div>
                                   <div className="flex-1">
                                       <h4 className="font-bold text-slate-800">{guide.title}</h4>
                                       <p className="text-xs text-slate-500">{guide.steps.length} Langkah Penanganan</p>
                                   </div>
                                   <ArrowRight size={20} className="text-slate-300" />
                               </GlassCard>
                           ))}
                           {/* CPR Manual Option */}
                           <GlassCard className="p-4 flex items-center gap-4 active:scale-[0.98] border-red-200 bg-red-50" onClick={() => { setActiveScenario('CPR'); setTriageStep('GUIDE'); }}>
                               <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center text-red-700">
                                   <Heart size={24} fill="currentColor" />
                               </div>
                               <div className="flex-1">
                                   <h4 className="font-bold text-red-800">HENTI JANTUNG (CPR)</h4>
                                   <p className="text-xs text-red-600">Lakukan jika tidak bernapas</p>
                               </div>
                               <ArrowRight size={20} className="text-red-300" />
                           </GlassCard>
                       </div>
                   </div>
               )}

               {/* GUIDE MODE */}
               {triageStep === 'GUIDE' && activeScenario && (
                   <div className="w-full h-full flex flex-col justify-between animate-in slide-in-from-right">
                       <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                           {/* Progress Dots */}
                           <div className="flex gap-1 mb-6">
                               {MEDICAL_GUIDES[activeScenario].steps.map((_, idx) => (
                                   <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === guideStepIndex ? 'w-6 bg-red-600' : idx < guideStepIndex ? 'bg-red-200' : 'bg-slate-200'}`}></div>
                               ))}
                           </div>

                           {/* Visual Aid */}
                           <div className="w-64 h-64 bg-slate-100 rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden border border-slate-200">
                                <div className={`absolute inset-0 flex items-center justify-center text-slate-300 transition-transform duration-500 ${isMetronomeActive ? 'scale-110' : 'scale-100'}`}>
                                    {MEDICAL_GUIDES[activeScenario].steps[guideStepIndex].visual === 'CPR' ? <Heart size={120} fill={isMetronomeActive ? "#ef4444" : "#e2e8f0"} className={isMetronomeActive ? "text-red-500" : ""} /> :
                                     MEDICAL_GUIDES[activeScenario].steps[guideStepIndex].visual === 'PRESS' ? <Hand size={120} /> :
                                     <Activity size={120} />
                                    }
                                </div>
                                {isMetronomeActive && (
                                    <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                                )}
                           </div>

                           {/* Warning */}
                           {MEDICAL_GUIDES[activeScenario].warning && guideStepIndex === 0 && (
                               <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-xl text-xs font-bold flex items-start gap-2 text-left animate-bounce">
                                   <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                   {MEDICAL_GUIDES[activeScenario].warning}
                               </div>
                           )}

                           <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">
                               {MEDICAL_GUIDES[activeScenario].steps[guideStepIndex].text}
                           </h2>

                           {/* Audio Control */}
                           <button 
                               onClick={() => speakInstruction(MEDICAL_GUIDES[activeScenario].steps[guideStepIndex].audio)}
                               className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100"
                           >
                               <Volume2 size={16} /> Ulangi Suara
                           </button>
                       </div>

                       {/* Navigation */}
                       <div className="p-4 grid grid-cols-2 gap-4 bg-white border-t border-slate-100">
                           <button 
                               onClick={prevGuideStep}
                               disabled={guideStepIndex === 0}
                               className="py-4 rounded-xl font-bold text-slate-600 bg-slate-100 disabled:opacity-50"
                           >
                               Kembali
                           </button>
                           {guideStepIndex < MEDICAL_GUIDES[activeScenario].steps.length - 1 ? (
                               <button 
                                   onClick={nextGuideStep}
                                   className="py-4 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-500/30 active:scale-95"
                               >
                                   Lanjut
                               </button>
                           ) : (
                               <button 
                                   onClick={resetSakuSelamat}
                                   className="py-4 rounded-xl font-bold text-white bg-emerald-600 shadow-lg shadow-emerald-500/30 active:scale-95"
                               >
                                   Selesai
                               </button>
                           )}
                       </div>
                   </div>
               )}
           </div>
      </div>
    );
  };

  return (
    <div className="h-full pb-20">
      {subView === 'MENU' && renderMenu()}
      {subView === 'SOS' && renderSOS()}
      {subView === 'SAFE_ZONE' && renderSafeZone()}
      {subView === 'ECHO_SMS' && renderEchoSMS()}
      {subView === 'SOS_TOOLKIT' && renderSosToolkit()}
      {subView === 'RADIO_FINDER' && renderRadioFinder()}
      {subView === 'SAKU_SELAMAT' && renderSakuSelamat()}
    </div>
  );
};