import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Zap, Crosshair, RefreshCw, Trophy, Skull } from 'lucide-react';
import Confetti from 'react-confetti';

// --- CONFIGURAÇÃO DAS MISSÕES ---
const QUESTS_DATA = [
  { 
    id: 'main_quest', 
    title: 'Main Quest: O Despertar', 
    time: '04h00 - 04h15', 
    xp: 50, 
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/30'
  },
  { 
    id: 'side_quest', 
    title: 'Side Quest: RD - Reservatório de Dopamina', 
    time: '05h00 - 06h00',
    xp: 30, 
    icon: <Terminal className="w-5 h-5" />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/30'
  },
  { 
    id: 'daily_task', 
    title: 'Daily Task: Devocional e Leitura', 
    time: '04h30 - 05h00',
    xp: 30, 
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/30'
  },
];

const BOSS_FIGHT = {
  id: 'boss_fight',
  title: 'BOSS FIGHT: Curso.dev',
  time: '19h00 - 23h00',
  xp: 100,
  icon: <Skull className="w-6 h-6" />,
  color: 'text-red-500',
  borderColor: 'border-red-500/50'
};

const LogbookRPG = () => {
  // --- ESTADOS ---
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedQuests, setCompletedQuests] = useState({});
  const [bossObjective, setBossObjective] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [mode, setMode] = useState('focus');

  const totalDailyXpPossivel = QUESTS_DATA.reduce((acc, q) => acc + q.xp, 0) + BOSS_FIGHT.xp;
  
  const currentDailyXp = Object.keys(completedQuests).reduce((acc, key) => {
    if (key === BOSS_FIGHT.id) return acc + BOSS_FIGHT.xp;
    const quest = QUESTS_DATA.find(q => q.id === key);
    return quest ? acc + quest.xp : acc;
  }, 0);

  // 2. DEPOIS: Efeitos que dependem do currentDailyXp
  useEffect(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    const history = JSON.parse(localStorage.getItem('rpg_history') || '{}');
    
    // Só atualiza se o XP atual for maior que o já registrado (ou se não houver registro)
    if (currentDailyXp !== history[dateStr]) {
      history[dateStr] = currentDailyXp;
      localStorage.setItem('rpg_history', JSON.stringify(history));
    }
  }, [currentDailyXp]);

  // 3. RESTANTE DOS EFEITOS (Timer, Persistência, etc)
  useEffect(() => {
    let interval = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerActive(false);
      alert(mode === 'focus' ? "🚨 FOCO ENCERRADO! Hora do descanso." : "🔋 DESCANSO TERMINOU! De volta ao trabalho.");
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft, mode]);

  // --- PERSISTÊNCIA (Load) ---
  useEffect(() => {
    const savedData = localStorage.getItem('logbook_rpg_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setXp(parsed.xp || 0);
      setStreak(parsed.streak || 0);
      setCompletedQuests(parsed.completedQuests || {});
      setBossObjective(parsed.bossObjective || '');
    }
  }, []);

  // --- PERSISTÊNCIA (Save) ---
  useEffect(() => {
    const dataToSave = { xp, streak, completedQuests, bossObjective };
    localStorage.setItem('logbook_rpg_data', JSON.stringify(dataToSave));
  }, [xp, streak, completedQuests, bossObjective]);

  // --- REDIMENSIONAMENTO PARA CONFETES ---
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  let interval = null;
  if (timerActive && secondsLeft > 0) {
    interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
  } else if (secondsLeft === 0) {
    setTimerActive(false);
    alert(mode === 'focus' ? "🚨 FOCO ENCERRADO! Hora do descanso." : "🔋 DESCANSO TERMINOU! De volta ao trabalho.");
    // Auto-switch de modo
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  }

    return () => clearInterval(interval);

  }, [timerActive, secondsLeft, mode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setSecondsLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  // --- LÓGICA DE NEGÓCIO ---

  const toggleQuest = (questId, questXp) => {
    const isCompleted = !!completedQuests[questId];
    
    // Atualiza estado da quest
    setCompletedQuests(prev => ({
      ...prev,
      [questId]: !isCompleted
    }));

    // Atualiza XP (Soma ou Subtrai)
    setXp(prev => isCompleted ? prev - questXp : prev + questXp);
  };

  const handleBossFight = () => {
    // Validação: Objetivo deve estar preenchido
    if (!bossObjective.trim()) {
      alert("⚠️ ERRO DE COMPILAÇÃO: Defina o objetivo da luta antes de engajar o Boss!");
      return;
    }

    const isCompleted = !!completedQuests[BOSS_FIGHT.id];
    
    if (!isCompleted) {
      // Completando o Boss
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Confetes por 5s
      setXp(prev => prev + BOSS_FIGHT.xp);
    } else {
      // Desmarcando o Boss
      setXp(prev => prev - BOSS_FIGHT.xp);
    }

    setCompletedQuests(prev => ({
      ...prev,
      [BOSS_FIGHT.id]: !isCompleted
    }));
  };

  const resetDailyProgress = () => {
    if (window.confirm("Reiniciar ciclo diário? O XP total e o Streak serão mantidos.")) {
      setCompletedQuests({});
      setBossObjective('');
    }
  };

  const incrementStreak = () => setStreak(s => s + 1);
  const resetStreak = () => setStreak(0);
  
  const progressPercentage = Math.min((currentDailyXp / totalDailyXpPossivel) * 100, 100);
  const level = Math.floor(xp / 1000) + 1; // Nível sobe a cada 1000 XP

  const getHeatmapData = () => {
    const data = [];
    const today = new Date();
    const history = JSON.parse(localStorage.getItem('rpg_history') || '{}');

    // Gera dados para as últimas 12 semanas (84 dias)
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        count: history[dateStr] || 0 // Pega o XP salvo ou 0
      });
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono selection:bg-green-500 selection:text-black p-4 md:p-8">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.3} />}

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* --- HEADER / HUD --- */}
        <header className="border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
              LOGBOOK RPG
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SISTEMA OPERACIONAL
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-xl">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Nível</p>
              <p className="text-2xl font-bold text-white">{level}</p>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Total XP</p>
              <p className="text-2xl font-bold text-green-400">{xp}</p>
            </div>
          </div>
        </header>

        {/* --- STREAK & PROGRESS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak Control */}
          <div className="col-span-1 bg-slate-900/50 p-4 rounded border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400 uppercase">Streak (Dias sem bugs)</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{streak}</span>
              <span className="text-sm text-slate-500 mb-1">dias</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={incrementStreak} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs py-1 px-2 rounded border border-green-500/30 transition-colors">
                +1 Dia
              </button>
              <button onClick={resetStreak} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-1 px-2 rounded border border-red-500/30 transition-colors">
                Reset
              </button>
            </div>
          </div>

          {/* Daily Progress Bar */}
          <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-4 rounded border border-slate-800 flex flex-col justify-center">
            <div className="flex justify-between mb-2 text-xs uppercase tracking-wider text-slate-400">
              <span>Carregamento do Sistema Diário</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Glitch Effect Overlay */}
                <div className="absolute inset-0 bg-white/10 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <p className="text-right text-xs text-slate-600 mt-2">
              {currentDailyXp} / {totalDailyXpPossivel} XP Diários
            </p>
          </div>
        </section>

        <section className="bg-slate-900 border border-cyan-500/30 p-6 rounded-lg mb-8 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${mode === 'focus' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <RefreshCw className={`w-6 h-6 ${timerActive ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-slate-500">Modo de Foco</h3>
                <p className={`text-xl font-bold uppercase ${mode === 'focus' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {mode === 'focus' ? 'Protocolo de Invasão' : 'Recarga de Bateria'}
                </p>
              </div>
            </div>

            <div className="text-6xl font-black font-mono tracking-tighter text-white">
              {formatTime(secondsLeft)}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={toggleTimer}
                className={`flex-1 md:flex-none px-8 py-3 rounded font-bold uppercase transition-all ${
                  timerActive 
                  ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                }`}
              >
                {timerActive ? 'Pausar' : 'Iniciar'}
              </button>
              <button 
                onClick={resetTimer}
                className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* --- QUESTS LIST --- */}
        <main className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Crosshair className="w-5 h-5 text-green-500" />
            MISSÕES ATIVAS
          </h2>

          <div className="space-y-3">
            {QUESTS_DATA.map((quest) => (
              <div 
                key={quest.id}
                onClick={() => toggleQuest(quest.id, quest.xp)}
                className={`
                  relative group cursor-pointer overflow-hidden p-4 rounded-lg border transition-all duration-300
                  ${completedQuests[quest.id] 
                    ? 'bg-slate-900/30 border-slate-800 opacity-60' 
                    : `bg-slate-900 border-l-4 ${quest.borderColor} hover:translate-x-1 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded bg-slate-800 ${quest.color}`}>
                      {quest.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold ${completedQuests[quest.id] ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {quest.title}
                      </h3>
                      {quest.time && <p className="text-xs text-slate-500 font-mono mt-1">{quest.time}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-600 border border-slate-700 px-2 py-1 rounded">
                      +{quest.xp} XP
                    </span>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${completedQuests[quest.id] ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                      {completedQuests[quest.id] && <Zap className="w-4 h-4 text-black fill-current" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* --- BOSS FIGHT (Special UI) --- */}
            <div className={`
              mt-8 p-1 rounded-xl bg-gradient-to-r from-red-900/20 via-slate-900 to-red-900/20
              ${completedQuests[BOSS_FIGHT.id] ? 'opacity-50 grayscale' : 'animate-[pulse_4s_ease-in-out_infinite]'}
            `}>
              <div className="bg-slate-950 p-6 rounded-lg border border-red-900/50 relative overflow-hidden">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                      {BOSS_FIGHT.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-500 tracking-wider flex items-center gap-2">
                        {BOSS_FIGHT.title}
                        {!completedQuests[BOSS_FIGHT.id] && <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>}
                      </h3>
                      <p className="text-red-400/60 text-sm font-mono mt-1">{BOSS_FIGHT.time}</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row items-end gap-3">
                    <input 
                      type="text" 
                      placeholder="Objetivo da Luta (Ex: Finalizar API)" 
                      value={bossObjective}
                      onChange={(e) => setBossObjective(e.target.value)}
                      disabled={completedQuests[BOSS_FIGHT.id]}
                      className="w-full bg-slate-900 border border-red-900/50 rounded px-4 py-2 text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                    />
                    
                    <button 
                      onClick={handleBossFight}
                      className={`
                        whitespace-nowrap px-6 py-2 rounded font-bold uppercase tracking-wider text-sm border transition-all
                        ${completedQuests[BOSS_FIGHT.id] 
                          ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-500 text-black border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)]'}
                      `}
                    >
                      {completedQuests[BOSS_FIGHT.id] ? 'Boss Derrotado' : 'Engajar (+100 XP)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* --- CONSISTENCY HEATMAP (ESTILO GITHUB) --- */}
        <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg mt-8">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Mapa de Calor de Produtividade (Últimas 12 Semanas)
          </h3>
          
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            {getHeatmapData().map((day, index) => {
              // Lógica de cores baseada no XP do dia
              let colorClass = "bg-slate-800"; // Zero XP
              if (day.count > 0 && day.count < 50) colorClass = "bg-green-900 opacity-40";
              if (day.count >= 50 && day.count < 100) colorClass = "bg-green-700 opacity-70";
              if (day.count >= 100 && day.count < 150) colorClass = "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]";
              if (day.count >= 150) colorClass = "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)] animate-pulse";

              return (
                <div 
                  key={index}
                  title={`${day.date}: ${day.count} XP`}
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between items-center mt-4 text-[10px] text-slate-600 uppercase tracking-tighter">
            <span>Menos XP</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
              <div className="w-2 h-2 bg-green-900 opacity-40 rounded-sm"></div>
              <div className="w-2 h-2 bg-green-700 opacity-70 rounded-sm"></div>
              <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
            </div>
            <span>Mais XP</span>
          </div>
        </section>

        {/* --- FOOTER CONTROLS --- */}
        <footer className="pt-10 flex justify-center pb-8">
          <button 
            onClick={resetDailyProgress}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs uppercase tracking-widest border border-transparent hover:border-slate-700 px-4 py-2 rounded"
          >
            <RefreshCw className="w-4 h-4" />
            Reiniciar Ciclo Diário
          </button>
        </footer>

      </div>
    </div>
  );
};

export default LogbookRPG;
