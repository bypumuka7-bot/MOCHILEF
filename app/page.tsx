'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Loader2, Trophy, Battery, Sparkles, Lightbulb, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

const playSound = (type: 'send' | 'receive' | 'error') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      
      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3);
      osc2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
      gainNode2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
    
    setTimeout(() => { ctx.close(); }, 1000);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: '¡Hola chiguitos y chiguitas! 🎒✨ Soy Mochil, acabamos de llegar del gimnasio del colegio pero... ¡Oh, no! Me siento un poco vacía porque se me han escapado los saltos y el equilibrio por una cremallera que se quedó abierta. 😢 ¿Me podéis ayudar a recuperarlos?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [isTTSActive, setTTSActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const interactionCount = Math.floor(messages.length / 2);
  const energyLevel = Math.min(100, 20 + interactionCount * 15);
  const possibleStickers = ['👟', '🎈', '⭐', '🧩', '⚽', '🎯', '🏃', '🥇'];
  const unlockedStickers = possibleStickers.map((item, i) => i < interactionCount ? item : '?');
  const pegatinasCount = unlockedStickers.filter(item => item !== '?').length;

  const toggleListening = () => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput((prev) => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const speakMsg = (text: string) => {
    if (!isTTSActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.pitch = 1.3; 
    window.speechSynthesis.speak(utterance);
  };


  // Consejos animado
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const consejos = [
    "💧 Recuerda beber agüita después de moverte",
    "🫁 Si te cansas mucho, ¡respira profundo!",
    "🤸‍♀️ Estira tu cuerpo siempre antes de jugar",
    "🏃‍♂️ ¡Sigue a tu propio ritmo! Lo haces genial"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % consejos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    playSound('send');
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Send only history to the server
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) {
        throw new Error('No se pudo conectar con el servidor.');
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      playSound('receive');
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: data.text };
      setMessages((prev) => [...prev, botMessage]);
      speakMsg(data.text);
    } catch (err: any) {
      console.error(err);
      playSound('error');
      setError('¡Ups! Mis cremalleras se han atascado y hay interferencias en la red temporalmente... ¿Me lo repites, por favor? 🎒🔧');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden z-10 max-w-7xl mx-auto">
      
      {/* Fondo de Deportes Animados Fijos */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex flex-wrap opacity-[0.06] text-[180px] drop-shadow-xl select-none mix-blend-overlay">
        <div className="absolute top-10 left-10 transform -rotate-12 animate-pulse">⚽</div>
        <div className="absolute bottom-20 right-10 transform rotate-12 animate-bounce flex items-end">🏓</div>
        <div className="absolute top-1/2 left-1/3 transform rotate-45 animate-pulse">🏸</div>
        <div className="absolute top-20 right-1/4 transform -rotate-12 animate-pulse">🏀</div>
        <div className="absolute bottom-10 left-1/4 transform rotate-180 animate-bounce flex items-end">🎾</div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="h-24 shrink-0 w-full flex items-center justify-between px-4 sm:px-8 bg-white/10 backdrop-blur-md border-b-2 border-white/20 z-10 shadow-lg relative">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-400 rounded-[1.25rem] flex items-center justify-center shadow-xl transform rotate-3 border-[3px] border-white/50 shrink-0">
            <span className="text-3xl sm:text-4xl">🎒</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white drop-shadow-md">MOCHIL</h1>
            <p className="text-[10px] sm:text-sm text-yellow-200 uppercase tracking-widest font-bold">¡TU AMIGA DE EDUCACIÓN FÍSICA! 🤸‍♀️</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] uppercase font-bold opacity-80 text-white">Conexión Mágica</span>
            <span className="text-xs font-black text-green-300 drop-shadow-sm flex items-center gap-1">● CONECTA-2</span>
          </div>
          <div className="h-10 w-[2px] bg-white/20 hidden sm:block"></div>
          <button 
            onClick={() => setTTSActive(!isTTSActive)}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors pointer shadow-md"
            title={isTTSActive ? "Desactivar voz de Mochil" : "Activar voz de Mochil"}
          >
            {isTTSActive ? <Volume2 className="text-white" size={20} /> : <VolumeX className="text-white/50" size={20} />}
          </button>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 shadow-lg border-2 border-yellow-200">
            <span className="text-lg">⭐</span>
            <span className="text-xs sm:text-sm font-black text-indigo-900 uppercase">{pegatinasCount} <span className="hidden sm:inline">Pegatinas</span></span>
          </div>
        </div>
      </nav>

      {/* Mobile only: Reto del día resumido */}
      <div className="lg:hidden shrink-0 bg-gradient-to-r from-orange-500 to-red-500 p-3 flex items-center justify-between shadow-md border-b border-white/20 z-10 relative">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-300 fill-yellow-300" />
          <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow-sm">Reto Diario:</span>
        </div>
        <p className="text-white text-xs font-bold truncate px-2">¡Salta como una 🐸 5 veces!</p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 z-10 min-h-0 max-w-full">
        
        {/* Sidebar: Character & Stats */}
        <aside className="hidden lg:flex w-[22rem] flex-col gap-5 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
          {/* Mochil Character Card & Energy Bar */}
          <div className="bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-400 to-yellow-300"></div>
            <div className="text-[80px] mb-2 drop-shadow-2xl">🎒</div>
            <h2 className="text-2xl font-black mb-2 text-white drop-shadow-md">¡Hola Equipo!</h2>
            <p className="text-base font-bold text-white/90 leading-snug">
              "¡Guíame en mis juegos y lléname de energía!"
            </p>
            
            {/* Barra de Energía */}
            <div className="w-full mt-5 bg-black/30 rounded-full h-7 relative border-2 border-white/30 p-1 flex items-center overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 rounded-full"
                initial={{ width: "20%" }}
                animate={{ width: `${energyLevel}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 text-xs font-black text-white shadow-sm uppercase tracking-wider drop-shadow-md">
                <Battery size={16} /> Energía: {energyLevel}%
              </div>
            </div>
          </div>

          {/* Pestaña del Reto del Día */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white/40 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden shrink-0 transform hover:-translate-y-1 transition-transform">
            <div className="absolute -right-4 -top-4 opacity-20 text-[80px]">🌟</div>
            <h3 className="text-lg uppercase font-black text-white mb-2 flex items-center gap-2 drop-shadow-md">
              <Trophy size={24} className="text-yellow-300 fill-yellow-300" />
              Reto del Día
            </h3>
            <p className="text-white text-base font-bold leading-tight drop-shadow-sm">
              ¡Salta como una 🐸 5 veces seguidas sin caerte, y respira fuerte al acabar!
            </p>
          </div>

          {/* Neceser de Recompensas */}
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-[2rem] p-5 shrink-0 shadow-lg relative overflow-hidden">
             <div className="absolute -left-10 bottom-0 opacity-10 text-[100px]">🏆</div>
            <h3 className="text-sm uppercase font-black text-yellow-300 mb-4 tracking-widest text-center flex justify-center items-center gap-2 drop-shadow-sm">
              <Sparkles size={18} className="text-yellow-300 fill-yellow-300" />
              Mi Neceser Mágico
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {unlockedStickers.map((item, i) => (
                <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-3xl shadow-inner ${item === '?' ? 'bg-white/5 border-2 border-dashed border-white/20 text-white/30 font-bold text-lg' : 'bg-white/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] border border-white/10 filter hover:saturate-150 transition-all cursor-pointer hover:scale-110'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Consejos animado */}
          <div className="bg-sky-500/40 backdrop-blur-md border-2 border-sky-300/60 rounded-[2rem] p-5 shadow-lg shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20 text-[80px] blur-[2px]">💡</div>
            <div className="flex items-center gap-2 mb-3 text-sky-100">
              <Lightbulb size={24} className="text-yellow-300 animate-pulse fill-yellow-300" />
              <h3 className="text-sm uppercase font-black tracking-widest text-white drop-shadow-sm">Consejo Pro</h3>
            </div>
            <div className="min-h-[4rem] flex items-center text-white font-bold text-[17px] leading-snug drop-shadow-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTipIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {consejos[currentTipIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Chat Main Interface */}
        <section className="flex-1 flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/50 h-full">
          
          {/* Chat History */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6 flex flex-col">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 sm:gap-4 items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {m.role === 'model' ? (
                    <div className="shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-lg mt-1 shadow-sm">
                      🎒
                    </div>
                  ) : (
                    <div className="shrink-0 w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-lg text-indigo-900 font-bold mt-1 shadow-sm">
                      👦
                    </div>
                  )}
                  
                  <div className={`p-4 sm:p-5 rounded-[2rem] shadow-xl max-w-[90%] sm:max-w-[85%] relative border-2 ${
                    m.role === 'user'
                      ? 'bg-indigo-900/60 border-indigo-400 text-white rounded-tr-none'
                      : 'bg-white border-white text-indigo-900 rounded-tl-none'
                  }`}>
                    <div className={`font-bold text-lg sm:text-xl leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'drop-shadow-sm' : ''}`}>
                      {m.text}
                    </div>
                    <span className={`absolute -bottom-6 text-[11px] text-white opacity-80 font-black uppercase tracking-widest whitespace-nowrap ${
                      m.role === 'user' ? 'right-0' : 'left-0'
                    }`}>
                      {m.role === 'user' ? 'Tú' : 'Mochil'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ERROR STATE */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center mt-2"
                >
                  <div className="bg-red-500/20 border-2 border-red-400/50 text-red-100 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm max-w-[80%] mx-auto shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* LOADING STATE */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-start mt-4"
              >
                <div className="shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-lg shadow-sm">
                  🎒
                </div>
                <div className="bg-white/20 p-4 rounded-2xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full opacity-100 animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                  <span className="text-xs font-bold uppercase tracking-widest ml-2 text-white">Mochil está buscando...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-6 shrink-0" />
          </div>

          {/* Message Input */}
          <div className="shrink-0 p-4 sm:p-6 bg-black/30 border-t-2 border-white/20 flex flex-col gap-2">
            <form onSubmit={handleSubmit} className="w-full flex gap-3 sm:gap-4 h-14 sm:h-16 relative">
              <div className="flex-1 bg-white/10 border-2 border-white/30 rounded-full h-full flex items-center px-4 sm:px-6 relative focus-within:ring-4 focus-within:ring-white/40 transition-all focus-within:bg-white/20 shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="¡Escribe o habla a Mochil aquí! 📝"
                  className="w-full text-white bg-transparent outline-none placeholder:text-white/60 font-bold text-lg sm:text-lg drop-shadow-sm"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`ml-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  title="Hablar (Dictado por voz)"
                >
                  {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
              </div>
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                className={`h-full aspect-square rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-xl transition-all border-2 ${
                  input.trim() && !isLoading 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-indigo-900 border-yellow-200 cursor-pointer hover:shadow-yellow-400/50' 
                    : 'bg-white/10 text-white/30 border-white/10 cursor-not-allowed'
                }`}
              >
                ➔
              </motion.button>
            </form>
          </div>
        </section>
      </main>

      {/* Bottom Safety Footer */}
      <footer className="shrink-0 h-10 px-4 sm:px-8 flex items-center justify-center bg-indigo-900/60 backdrop-blur-xl border-t border-white/5 z-20">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-yellow-300 flex items-center gap-2 text-center">
          ⚠️ <span className="text-white hidden sm:inline">Seguridad primero:</span> ¡Cuidado no choques con los muebles! Busca un sitio con espacio.
        </p>
      </footer>
    </div>
  );
}
