import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Zap, Crosshair, RefreshCw, Trophy, Skull } from 'lucide-react';
import Confetti from 'react-confetti';

// --- CONFIGURAÇÃO DAS MISSÕES ---
const QUESTS_DATA = [
  { 
    id: 'main_quest_1', 
    title: 'Pilar 1: O Despertar', 
    time: '04h00', 
    xp: 30, 
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/30'
  },
  { 
    id: 'main_quest_2', 
    title: 'Pilar 2: RD - Reservatório de Dopamina', 
    time: '04h00', 
    xp: 30, 
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/30'
  },
  { 
    id: 'side_quest_1', 
    title: 'Pilar 2: Devocional e Leitura', 
    xp: 30, 
    icon: <Terminal className="w-5 h-5" />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/30'
  },
  { 
    id: 'daily_task_1', 
    title: 'Pilar 3: Devocional e Leitura', 
    xp: 30, 
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/30'
  },
];

// MUDANÇA 1: Transformamos o BOSS_FIGHT em um Array (BOSS_FIGHTS)
const BOSS_FIGHTS = [
  {
    id: 'boss_fight_1',
    title: 'BOSS FIGHT 1: Curso.dev',
    time: '19h00 - 23h00',
    xp: 100,
    icon: <Skull className="w-6 h-6" />,
    color: 'text-red-500',
    borderColor: 'border-red-500/50'
  },
  {
    id: 'boss_fight_2',
    title: 'BOSS FIGHT 2: +1 dia | +1%',
    time: '04h00 - 23h00',
    xp: 150,
    icon: <Skull className="w-6 h-6" />,
    color: 'text-purple-500', // Cores diferentes pro segundo boss!
    borderColor: 'border-purple-500/50'
  }
];

const LogbookRPG = () => {
  // --- ESTADOS ---
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedQuests, setCompletedQuests] = useState({});
  // MUDANÇA 2: bossObjectives agora é um objeto {} para guardar textos separados
  const [bossObjectives, setBossObjectives] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // --- PERSISTÊNCIA (Load) ---
  useEffect(() => {
    const savedData = localStorage.getItem('logbook_rpg_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setXp(parsed.xp || 0);
      setStreak(parsed.streak || 0);
      setCompletedQuests(parsed.completedQuests || {});
      setBossObjectives(parsed.bossObjectives || {});
    }
  }, []);

  // --- PERSISTÊNCIA (Save) ---
  useEffect(() => {
    const dataToSave = { xp, streak, completedQuests, bossObjectives };
    localStorage.setItem('logbook_rpg_data', JSON.stringify(dataToSave));
  }, [xp, streak, completedQuests, bossObjectives]);

  // --- REDIMENSIONAMENTO PARA CONFETES ---
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- LÓGICA DE NEGÓCIO ---

  const toggleQuest = (questId, questXp) => {
    const isCompleted = !!completedQuests[questId];
    
    setCompletedQuests(prev => ({ ...prev, [questId]: !isCompleted }));
    setXp(prev => isCompleted ? prev - questXp : prev + questXp);
  };

  // MUDANÇA 3: Atualiza o texto apenas do Boss específico
  const handleObjectiveChange = (bossId, text) => {
    setBossObjectives(prev => ({
      ...prev,
      [bossId]: text
    }));
  };

  // MUDANÇA 4: O handleBossFight agora recebe o Boss inteiro como parâmetro
  const handleBossFight = (boss) => {
    const currentObjective = bossObjectives[boss.id] || '';

    if (!currentObjective.trim()) {
      alert(`⚠️ ERRO DE COMPILAÇÃO: Defina o objetivo da luta antes de engajar o ${boss.title}!`);
      return;
    }

    const isCompleted = !!completedQuests[boss.id];
    
    if (!isCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setXp(prev => prev + boss.xp);
    } else {
      setXp(prev => prev - boss.xp);
    }

    setCompletedQuests(prev => ({ ...prev, [boss.id]: !isCompleted }));
  };

  const resetDailyProgress = () => {
    if (window.confirm("Reiniciar ciclo diário? O XP total e o Streak serão mantidos.")) {
      setCompletedQuests({});
      setBossObjectives({});
    }
  };

  const incrementStreak = () => setStreak(s => s + 1);
  const resetStreak = () => setStreak(0);

  // MUDANÇA 5: O cálculo de XP Máximo Diário soma o XP de TODOS os Bosses
  const totalDailyXpPossivel = 
    QUESTS_DATA.reduce((acc, q) => acc + q.xp, 0) + 
    BOSS_FIGHTS.reduce((acc, b) => acc + b.xp, 0);

  // MUDANÇA 6: O cálculo de XP Atual encontra o XP da Quest ou do Boss correto
  const currentDailyXp = Object.keys(completedQuests).reduce((acc, key) => {
    const quest = QUESTS_DATA.find(q => q.id === key);
    if (quest) return acc + quest.xp;
    
    const boss = BOSS_FIGHTS.find(b => b.id === key);
    if (boss) return acc + boss.xp;
    
    return acc;
  }, 0);
  
  const progressPercentage = Math.min((currentDailyXp / totalDailyXpPossivel) * 100, 100);
  const level = Math.floor(xp / 1000) + 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono selection:bg-green-500 selection:text-black p-4 md:p-8">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.3} />}

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* --- HEADER / HUD --- */}
        <header className="border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
              DEV_LOGBOOK_v2.0
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
                <div className="absolute inset-0 bg-white/10 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <p className="text-right text-xs text-slate-600 mt-2">
              {currentDailyXp} / {totalDailyXpPossivel} XP Diários
            </p>
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

            {/* MUDANÇA 7: Renderiza a lista de Bosses usando o .map */}
            {BOSS_FIGHTS.map((boss) => (
              <div key={boss.id} className={`
                mt-8 p-1 rounded-xl bg-gradient-to-r from-${boss.color.split('-')[1]}-900/20 via-slate-900 to-${boss.color.split('-')[1]}-900/20
                ${completedQuests[boss.id] ? 'opacity-50 grayscale' : 'animate-[pulse_4s_ease-in-out_infinite]'}
              `}>
                <div className={`bg-slate-950 p-6 rounded-lg border border-${boss.color.split('-')[1]}-900/50 relative overflow-hidden`}>
                  
                  <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-${boss.color.split('-')[1]}-500/10 rounded-full border border-${boss.color.split('-')[1]}-500/50 ${boss.color} shadow-[0_0_20px_rgba(var(--tw-colors-${boss.color.split('-')[1]}-500),0.3)]`}>
                        {boss.icon}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${boss.color} tracking-wider flex items-center gap-2`}>
                          {boss.title}
                          {!completedQuests[boss.id] && <span className="flex h-3 w-3 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${boss.color.split('-')[1]}-400 opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 bg-${boss.color.split('-')[1]}-500`}></span>
                          </span>}
                        </h3>
                        <p className={`text-${boss.color.split('-')[1]}-400/60 text-sm font-mono mt-1`}>{boss.time}</p>
                      </div>
                    </div>

                    <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row items-end gap-3">
                      <input 
                        type="text" 
                        placeholder={`Objetivo (Ex: Finalizar ${boss.title})`}
                        value={bossObjectives[boss.id] || ''}
                        onChange={(e) => handleObjectiveChange(boss.id, e.target.value)}
                        disabled={completedQuests[boss.id]}
                        className={`w-full bg-slate-900 border border-${boss.color.split('-')[1]}-900/50 rounded px-4 py-2 text-${boss.color.split('-')[1]}-100 placeholder-${boss.color.split('-')[1]}-900/50 focus:outline-none focus:border-${boss.color.split('-')[1]}-500 focus:ring-1 focus:ring-${boss.color.split('-')[1]}-500 transition-all font-mono text-sm`}
                      />
                      
                      <button 
                        onClick={() => handleBossFight(boss)}
                        className={`
                          whitespace-nowrap px-6 py-2 rounded font-bold uppercase tracking-wider text-sm border transition-all
                          ${completedQuests[boss.id] 
                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                            : `bg-${boss.color.split('-')[1]}-600 hover:bg-${boss.color.split('-')[1]}-500 text-black border-${boss.color.split('-')[1]}-500 shadow-[0_0_15px_rgba(var(--tw-colors-${boss.color.split('-')[1]}-600),0.5)] hover:shadow-[0_0_25px_rgba(var(--tw-colors-${boss.color.split('-')[1]}-600),0.8)]`}
                        `}
                      >
                        {completedQuests[boss.id] ? 'Boss Derrotado' : `Engajar (+${boss.xp} XP)`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

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
