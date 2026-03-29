import React, { useState } from 'react';
import { 
  PlaneTakeoff, Wind, MapPin, Clock, ArrowRight, ShieldCheck, 
  AlertTriangle, Plane, ChevronRight, Activity, RefreshCcw 
} from 'lucide-react';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [activeField, setActiveField] = useState(null);
  
  const [formData, setFormData] = useState({
    airline: '',
    time: '',
    origin: '',
    dest: ''
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    let val = 0;
    
    // Start the loading animation
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 10) + 2;
      if (val >= 90) val = 90; // Pause at 90% while waiting for Python
      setProgress(val);
    }, 100);

    try {
      // Send the user's input to our Python API
      const response = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airline: formData.airline,
          time: formData.time,
          origin: formData.origin,
          dest: formData.dest
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();

      // Finish the loading bar and show the real prediction!
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setPrediction({
          delayed: result.delayed,
          score: result.score
        });
        setIsAnalyzing(false);
        setShowResult(true);
      }, 600);

    } catch (error) {
      console.error("Error fetching prediction:", error);
      clearInterval(interval);
      alert("Cannot connect to ML Server. Is your Python backend running on port 5000?");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setShowResult(false);
    setProgress(0);
    setPrediction(null);
    setFormData({ airline: '', time: '', origin: '', dest: '' });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-slate-50 flex flex-col overflow-hidden p-4 md:p-8">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto flex justify-between items-center z-50 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <PlaneTakeoff size={20} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">
            Aero<span className="text-cyan-400">Logic</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Server Active</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-grow flex items-center justify-center">
        
        {/* STEP 1: INPUT FORM */}
        {!showResult && !isAnalyzing && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="space-y-10">
              <div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4">
                  PREDICT <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">THE DELAY.</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-md font-light">
                  Input your parameters. Our neural network will visualize your flight path and calculate the exact probability of a delay.
                </p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Carrier Input */}
                  <div className={`relative group rounded-2xl border transition-all duration-300 ${activeField === 'airline' ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Wind className={`h-5 w-5 ${activeField === 'airline' ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <input 
                      required type="text" placeholder="CARRIER (DL)" 
                      className="w-full bg-transparent pl-12 pr-4 py-4 text-white focus:outline-none uppercase font-bold tracking-widest text-sm"
                      value={formData.airline} onChange={(e) => setFormData({...formData, airline: e.target.value})} 
                      onFocus={() => setActiveField('airline')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Time Input */}
                  <div className={`relative group rounded-2xl border transition-all duration-300 ${activeField === 'time' ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock className={`h-5 w-5 ${activeField === 'time' ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <input 
                      required type="time" 
                      className="w-full bg-transparent pl-12 pr-4 py-4 text-white focus:outline-none font-bold tracking-widest text-sm"
                      value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} 
                      onFocus={() => setActiveField('time')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Origin Input */}
                  <div className={`relative group rounded-2xl border transition-all duration-300 ${activeField === 'origin' ? 'bg-cyan-900/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className={`h-5 w-5 ${activeField === 'origin' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <input 
                      required type="text" placeholder="ORIGIN (JFK)" 
                      className="w-full bg-transparent pl-12 pr-4 py-4 text-white focus:outline-none uppercase font-bold tracking-widest text-sm"
                      value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} 
                      onFocus={() => setActiveField('origin')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Dest Input */}
                  <div className={`relative group rounded-2xl border transition-all duration-300 ${activeField === 'dest' ? 'bg-cyan-900/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className={`h-5 w-5 ${activeField === 'dest' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <input 
                      required type="text" placeholder="DEST (LAX)" 
                      className="w-full bg-transparent pl-12 pr-4 py-4 text-white focus:outline-none uppercase font-bold tracking-widest text-sm"
                      value={formData.dest} onChange={(e) => setFormData({...formData, dest: e.target.value})} 
                      onFocus={() => setActiveField('dest')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                </div>

                <button type="submit" className="relative w-full overflow-hidden rounded-2xl p-[1px] group mt-4">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <div className="relative bg-[#020617] px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-opacity-0">
                    <span className="font-black uppercase tracking-[0.2em] text-white group-hover:text-[#020617] transition-colors duration-300">
                      Initialize Scan
                    </span>
                    <ArrowRight size={20} className="text-cyan-400 group-hover:text-[#020617] group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </button>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="hidden lg:flex flex-col justify-center perspective-[1000px]">
              <div className={`w-full max-w-md mx-auto bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl transition-all duration-700 transform ${formData.origin && formData.dest ? 'rotate-y-0 scale-100' : 'rotate-y-12 scale-95 opacity-80'}`}>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Telemetry</p>
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-cyan-400" />
                      <span className="font-mono text-sm text-white">{formData.airline?.toUpperCase() || 'WAITING'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">T-Minus</p>
                    <span className="font-mono text-sm text-white">{formData.time || '--:--'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 relative">
                  <div className="text-center z-10 bg-slate-900/40 p-2 rounded-xl min-w-[80px]">
                    <p className="text-4xl font-black italic text-white tracking-tighter">{formData.origin?.toUpperCase() || '---'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Departure</p>
                  </div>
                  
                  <div className="flex-grow relative flex items-center justify-center mx-4">
                    <div className="absolute w-full border-t-2 border-dashed border-slate-700"></div>
                    <div className={`absolute w-full border-t-2 border-dashed border-cyan-400 transition-all duration-1000 ease-out ${formData.origin && formData.dest ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'} origin-left`}></div>
                    
                    <div className={`relative z-10 bg-[#020617] p-2 rounded-full border border-slate-700 transition-all duration-500 ${formData.origin && formData.dest ? 'text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'text-slate-600'}`}>
                      <Plane size={24} className={formData.origin && formData.dest ? 'animate-pulse' : ''} />
                    </div>
                  </div>

                  <div className="text-center z-10 bg-slate-900/40 p-2 rounded-xl min-w-[80px]">
                    <p className="text-4xl font-black italic text-white tracking-tighter">{formData.dest?.toUpperCase() || '---'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Arrival</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: LOADING SCREEN */}
        {isAnalyzing && (
          <div className="w-full max-w-md text-center space-y-8 animate-in zoom-in duration-500">
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="90" stroke="url(#gradient)" strokeWidth="4" fill="transparent" 
                  strokeDasharray={565} strokeDashoffset={565 - (565 * progress) / 100}
                  className="transition-all duration-200 ease-out" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {progress}%
              </div>
            </div>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Running XGBoost Inference...</p>
          </div>
        )}

        {/* STEP 3: RESULTS SCREEN */}
        {showResult && prediction && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              
              <div className={`absolute top-0 left-0 w-full h-2 ${prediction.delayed ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-10 mb-10">
                <div className="flex items-center gap-6 text-center md:text-left">
                  <div className={`p-6 rounded-3xl ${prediction.delayed ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]'}`}>
                    {prediction.delayed ? <AlertTriangle size={48} /> : <ShieldCheck size={48} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Inference Result</h3>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
                      {prediction.delayed ? 'Delay Probable' : 'On Schedule'}
                    </h2>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-widest block mb-2">Confidence Score</span>
                  <div className="flex items-baseline justify-center md:justify-end gap-1">
                    <span className={`text-6xl font-black italic ${prediction.delayed ? 'text-orange-400' : 'text-emerald-400'}`}>{prediction.score}</span>
                    <span className="text-2xl font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#020617] rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center md:text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Flight Vector</span>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="text-3xl font-black text-white">{formData.origin?.toUpperCase() || 'ORG'}</span>
                    <ChevronRight className="text-slate-600" />
                    <span className="text-3xl font-black text-slate-400">{formData.dest?.toUpperCase() || 'DST'}</span>
                  </div>
                </div>
                <div className="bg-[#020617] rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center md:text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Carrier & Time</span>
                  <span className="text-xl font-bold text-white mb-1">{formData.airline?.toUpperCase() || 'N/A'}</span>
                  <span className="text-sm font-mono text-slate-400">{formData.time || '00:00'} DEPARTURE</span>
                </div>
                <div className="bg-[#020617] rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center md:text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Processed</span>
                  <span className="text-xl font-bold text-white mb-1">1.8M Records</span>
                  <span className="text-sm font-mono text-emerald-400 flex items-center justify-center md:justify-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> SUCCESS</span>
                </div>
              </div>
              
              <button onClick={reset} className="w-full md:w-auto mx-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold uppercase tracking-widest text-sm text-slate-300 hover:text-white">
                <RefreshCcw size={16} /> Run New Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}