import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Rocket, Star, CheckCircle2, Clock, Users, Crown, AlertTriangle, Radio, Volume2, Zap, XCircle, Wifi, Battery, Thermometer, Activity } from 'lucide-react';

const StarBitesGame = () => {
  const [screen, setScreen] = useState('home');
  const [role, setRole] = useState(null);
  const [gameCode, setGameCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [score, setScore] = useState(1000);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showFeedback, setShowFeedback] = useState(null);
  const [penalties, setPenalties] = useState(0);

  // Original pretrial tasks with exact language
  const phases = {
    1: {
      name: "T-MINUS 8 WEEKS",
      subtitle: "Initial Setup",
      tasks: [
        { id: 'p1t1', name: 'Pilot/trial results communicated to technical team', control: 'button' },
        { id: 'p1t2', name: 'Material lead times confirmed', control: 'switch' },
        { id: 'p1t3', name: 'Processing flowcharts and conditions drafted', control: 'lever' },
        { id: 'p1t4', name: 'New ingredient setup in systems', control: 'dial' },
        { id: 'p1t5', name: 'Dummy code requests completed', control: 'button' },
        { id: 'p1t6', name: 'ETQ workflow for new materials kicked off', control: 'hold' },
      ]
    },
    2: {
      name: "T-MINUS 4 WEEKS",
      subtitle: "Pre-Trial",
      tasks: [
        { id: 'p2t1', name: 'Material approved in ETQ confirmed', control: 'switch' },
        { id: 'p2t2', name: 'PO placed with lead time matching trial needs', control: 'lever' },
        { id: 'p2t3', name: 'Trial BOM creation requested', control: 'button' },
      ]
    },
    3: {
      name: "T-MINUS 2 WEEKS",
      subtitle: "Final Prep",
      tasks: [
        { id: 'p3t1', name: 'Pre-trial call scheduled', control: 'dial' },
        { id: 'p3t2', name: 'Trial BOM approved', control: 'hold' },
        { id: 'p3t3', name: 'Trial material on-site or ETA on track', control: 'switch' },
        { id: 'p3t4', name: 'Badge access completed', control: 'button' },
      ]
    }
  };

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize shuffled tasks for crew display
  const shuffledPhases = useMemo(() => ({
    1: { ...phases[1], tasks: shuffleArray(phases[1].tasks) },
    2: { ...phases[2], tasks: shuffleArray(phases[2].tasks) },
    3: { ...phases[3], tasks: shuffleArray(phases[3].tasks) },
  }), []);

  const getAllTasks = () => [...phases[1].tasks, ...phases[2].tasks, ...phases[3].tasks];
  const allTasks = getAllTasks();
  const currentTask = allTasks[currentTaskIndex];

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const startAsCommander = () => {
    setGameCode(generateCode());
    setRole('commander');
    setScreen('game');
  };

  const joinAsCrew = () => {
    if (joinCode.length >= 4) {
      setGameCode(joinCode.toUpperCase());
      setRole('crew');
      setScreen('game');
    }
  };

  useEffect(() => {
    if (screen === 'game' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [screen, timeLeft]);

  const attemptTask = (taskId) => {
    if (role !== 'crew') return;
    if (completedTasks.includes(taskId)) return;

    if (currentTask && taskId === currentTask.id) {
      setCompletedTasks([...completedTasks, taskId]);
      setScore(s => s + 100 + Math.floor(timeLeft / 5));
      setShowFeedback({ type: 'success', message: 'CONFIRMED!' });
      setTimeout(() => setShowFeedback(null), 1200);
      
      if (currentTaskIndex < allTasks.length - 1) {
        setCurrentTaskIndex(i => i + 1);
        if (currentTaskIndex + 1 >= phases[1].tasks.length + phases[2].tasks.length) {
          setCurrentPhase(3);
        } else if (currentTaskIndex + 1 >= phases[1].tasks.length) {
          setCurrentPhase(2);
        }
      }
    } else {
      setPenalties(p => p + 1);
      setScore(s => Math.max(0, s - 50));
      setShowFeedback({ type: 'error', message: 'WRONG SEQUENCE! -50' });
      setTimeout(() => setShowFeedback(null), 1200);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCompleted = (taskId) => completedTasks.includes(taskId);
  const allComplete = completedTasks.length === allTasks.length;

  // ============== INTERACTIVE CONTROLS ==============

  // Big Push Button with integrated label
  const PushButton = ({ task }) => {
    const completed = isCompleted(task.id);
    const [pressed, setPressed] = useState(false);

    const handleClick = () => {
      if (completed) return;
      setPressed(true);
      setTimeout(() => setPressed(false), 150);
      attemptTask(task.id);
    };

    return (
      <div className="flex flex-col items-center">
        <div 
          className={`relative cursor-pointer select-none ${completed ? 'opacity-60' : ''}`}
          onClick={handleClick}
        >
          <div className="absolute inset-0 top-2 bg-slate-950 rounded-full" />
          <div 
            className={`relative w-16 h-16 rounded-full border-4 transition-all duration-100 flex items-center justify-center
              ${completed 
                ? 'bg-green-700 border-green-500 translate-y-2' 
                : pressed 
                  ? 'bg-red-700 border-red-400 translate-y-2' 
                  : 'bg-gradient-to-b from-red-500 to-red-700 border-red-400 hover:from-red-400 hover:to-red-600'
              }`}
          >
            {completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-300" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-400/30 border-2 border-red-300/50" />
            )}
          </div>
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-1">PUSH</div>
        <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${completed ? 'text-green-400' : 'text-slate-400'}`}>
          {task.name}
        </div>
      </div>
    );
  };

  // Toggle Switch with integrated label
  const ToggleSwitch = ({ task }) => {
    const completed = isCompleted(task.id);

    return (
      <div className="flex flex-col items-center">
        <div 
          className={`relative cursor-pointer select-none ${completed ? '' : 'hover:scale-105'} transition-transform`}
          onClick={() => !completed && attemptTask(task.id)}
        >
          <div className="w-12 h-20 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 p-1 flex flex-col justify-between">
            <div className={`w-2 h-2 rounded-full mx-auto ${completed ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-slate-500'}`} />
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-12 bg-slate-800 rounded relative">
                <div 
                  className={`absolute left-0.5 w-5 h-5 rounded transition-all duration-200 ${
                    completed 
                      ? 'top-0.5 bg-gradient-to-b from-green-400 to-green-600' 
                      : 'top-6 bg-gradient-to-b from-slate-400 to-slate-500'
                  }`}
                />
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full mx-auto ${!completed ? 'bg-amber-500' : 'bg-slate-500'}`} />
          </div>
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-1">FLIP</div>
        <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${completed ? 'text-green-400' : 'text-slate-400'}`}>
          {task.name}
        </div>
      </div>
    );
  };

  // Pull Lever with integrated label
  const PullLever = ({ task }) => {
    const completed = isCompleted(task.id);
    const [pulling, setPulling] = useState(false);

    const handleClick = () => {
      if (completed) return;
      setPulling(true);
      setTimeout(() => {
        attemptTask(task.id);
        setPulling(false);
      }, 300);
    };

    return (
      <div className="flex flex-col items-center">
        <div 
          className={`relative cursor-pointer select-none ${completed ? 'opacity-60' : ''}`}
          onClick={handleClick}
        >
          <div className="w-14 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 relative overflow-hidden">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-green-500' : 'bg-slate-500'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${!completed ? 'bg-red-500' : 'bg-slate-500'}`} />
            </div>
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-6 transition-all duration-300 ${
                completed || pulling ? 'top-12' : 'top-3'
              }`}
            >
              <div className="w-2 h-12 bg-gradient-to-b from-slate-400 to-slate-500 mx-auto rounded" />
              <div className={`w-6 h-4 rounded-full -mt-1 ${
                completed ? 'bg-gradient-to-b from-green-500 to-green-700' : 'bg-gradient-to-b from-orange-500 to-orange-700'
              }`} />
            </div>
          </div>
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-1">PULL</div>
        <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${completed ? 'text-green-400' : 'text-slate-400'}`}>
          {task.name}
        </div>
      </div>
    );
  };

  // Rotary Dial with integrated label - FIXED
  const RotaryDial = ({ task }) => {
    const completed = isCompleted(task.id);
    const [rotation, setRotation] = useState(0);
    const clickCountRef = useRef(0);

    const handleClick = () => {
      if (completed) return;
      clickCountRef.current += 1;
      setRotation(clickCountRef.current * 90);
      
      if (clickCountRef.current >= 3) {
        attemptTask(task.id);
      }
    };

    return (
      <div className="flex flex-col items-center">
        <div 
          className={`relative cursor-pointer select-none ${completed ? 'opacity-60' : ''}`}
          onClick={handleClick}
        >
          <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1">
            <div className="w-full h-full rounded-full bg-slate-800 relative border-2 border-slate-600">
              {[0, 90, 180, 270].map(deg => (
                <div 
                  key={deg}
                  className="absolute w-0.5 h-1.5 bg-slate-500 left-1/2 -translate-x-1/2"
                  style={{ transform: `rotate(${deg}deg)`, transformOrigin: '50% 400%', top: '2px' }}
                />
              ))}
              <div 
                className={`absolute inset-1.5 rounded-full transition-transform duration-200 ${
                  completed ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-cyan-600 to-cyan-800'
                }`}
                style={{ transform: `rotate(${completed ? 270 : rotation}deg)` }}
              >
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-white rounded-full" />
              </div>
              {completed && <CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-green-300" />}
            </div>
          </div>
          {/* Click counter indicator */}
          {!completed && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full ${clickCountRef.current >= i ? 'bg-cyan-400' : 'bg-slate-600'}`} 
                />
              ))}
            </div>
          )}
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-2">TURN ×3</div>
        <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${completed ? 'text-green-400' : 'text-slate-400'}`}>
          {task.name}
        </div>
      </div>
    );
  };

  // Hold Button with integrated label - FIXED
  const HoldButton = ({ task }) => {
    const completed = isCompleted(task.id);
    const [progress, setProgress] = useState(0);
    const [holding, setHolding] = useState(false);
    const intervalRef = useRef(null);
    const progressRef = useRef(0);

    const startHold = (e) => {
      e.preventDefault();
      if (completed) return;
      setHolding(true);
      progressRef.current = 0;
      
      intervalRef.current = setInterval(() => {
        progressRef.current += 4;
        setProgress(progressRef.current);
        
        if (progressRef.current >= 100) {
          clearInterval(intervalRef.current);
          setProgress(100);
          attemptTask(task.id);
        }
      }, 40);
    };

    const endHold = () => {
      setHolding(false);
      clearInterval(intervalRef.current);
      if (progressRef.current < 100 && !completed) {
        progressRef.current = 0;
        setProgress(0);
      }
    };

    useEffect(() => () => clearInterval(intervalRef.current), []);

    // Reset progress display when task completes
    useEffect(() => {
      if (completed) {
        setProgress(100);
      }
    }, [completed]);

    return (
      <div className="flex flex-col items-center">
        <div 
          className={`relative cursor-pointer select-none ${completed ? 'opacity-60' : ''}`}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
        >
          <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#334155" strokeWidth="3" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke={completed ? "#22c55e" : "#f59e0b"}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                className="transition-all duration-75"
              />
            </svg>
            <div 
              className={`absolute inset-2 rounded-full flex items-center justify-center transition-all ${
                completed 
                  ? 'bg-gradient-to-b from-green-600 to-green-800' 
                  : holding
                    ? 'bg-gradient-to-b from-amber-600 to-amber-800 scale-95'
                    : 'bg-gradient-to-b from-amber-500 to-amber-700'
              }`}
            >
              {completed ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : (
                <span className="text-white font-bold text-xs">{Math.round(progress)}%</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-cyan-400 font-mono mt-1">HOLD</div>
        <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${completed ? 'text-green-400' : 'text-slate-400'}`}>
          {task.name}
        </div>
      </div>
    );
  };

  // Render control
  const renderControl = (task) => {
    switch (task.control) {
      case 'button': return <PushButton key={task.id} task={task} />;
      case 'switch': return <ToggleSwitch key={task.id} task={task} />;
      case 'lever': return <PullLever key={task.id} task={task} />;
      case 'dial': return <RotaryDial key={task.id} task={task} />;
      case 'hold': return <HoldButton key={task.id} task={task} />;
      default: return <PushButton key={task.id} task={task} />;
    }
  };

  // ============== COCKPIT COMPONENTS ==============

  const Gauge = ({ value = 75, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-600 relative">
        <div 
          className="absolute bottom-1 left-1/2 w-0.5 h-3 bg-cyan-400 origin-bottom rounded"
          style={{ transform: `translateX(-50%) rotate(${(value - 50) * 1.8}deg)` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        </div>
      </div>
      <span className="text-[8px] text-slate-500 font-mono mt-0.5">{label}</span>
    </div>
  );

  const StatusLights = () => (
    <div className="flex gap-1">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <div className="w-2 h-2 rounded-full bg-amber-500" />
      <div className="w-2 h-2 rounded-full bg-slate-600" />
    </div>
  );

  const MiniDisplay = ({ lines }) => (
    <div className="bg-slate-950 border border-slate-700 rounded p-1 font-mono text-[8px] text-green-400 leading-tight">
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );

  // ============== SCREENS ==============

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Rocket className="w-20 h-20 text-cyan-400 transform -rotate-45" />
                <Star className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              MISSION NORTH STAR
            </h1>
            <p className="text-xl text-cyan-300">Star Bites Production Training</p>
            <p className="text-slate-400 mt-2">Level 1: Pretrial Checklist</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={startAsCommander}
              className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-2 border-amber-500 rounded-2xl p-6 text-left hover:border-amber-300 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-10 h-10 text-amber-400" />
                <div>
                  <h2 className="text-2xl font-bold text-amber-300">COMMANDER</h2>
                  <p className="text-amber-400/70 text-sm">Start New Mission</p>
                </div>
              </div>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-center gap-2"><Radio className="w-4 h-4 text-amber-400" />See tasks to call out</li>
                <li className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-amber-400" />Direct your crew verbally</li>
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Cannot complete tasks</li>
              </ul>
            </button>

            <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-10 h-10 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-cyan-300">CREW MEMBER</h2>
                  <p className="text-cyan-400/70 text-sm">Join Mission</p>
                </div>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" />Operate ship controls</li>
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" />Wrong order = -50 pts</li>
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mission code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-800 border border-cyan-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  maxLength={6}
                />
                <button
                  onClick={joinAsCrew}
                  disabled={joinCode.length < 4}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">How to Play</h3>
            <ol className="text-sm text-slate-400 space-y-2">
              <li><span className="text-cyan-400 font-mono">1.</span> Commander shares mission code with crew</li>
              <li><span className="text-cyan-400 font-mono">2.</span> Commander reads tasks aloud in order</li>
              <li><span className="text-cyan-400 font-mono">3.</span> Crew finds and operates the matching control</li>
              <li><span className="text-red-400 font-mono">⚠</span> <span className="text-red-300">Wrong sequence = -50 points!</span></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // COMMANDER VIEW
  if (screen === 'game' && role === 'commander') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-white p-4">
        <div className="flex justify-between items-center mb-4 bg-slate-800/80 rounded-xl p-4 border border-amber-500/50">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-amber-300 font-bold">MISSION COMMANDER</div>
              <div className="text-slate-400 text-sm">Code: <span className="text-amber-400 font-mono text-lg">{gameCode}</span></div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-mono">
              <Clock className="w-6 h-6 text-cyan-400" />
              <span className={timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-slate-400 text-sm">Score: <span className="text-green-400">{score}</span></div>
          </div>
        </div>

        <div className="mb-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex gap-2">
            {[1, 2, 3].map(p => (
              <div key={p} className="flex-1">
                <div className={`h-2 rounded-full ${p < currentPhase ? 'bg-green-500' : p === currentPhase ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                <div className="text-xs text-slate-500 mt-1 text-center">{phases[p].name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-300 mb-1">
            <Volume2 className="w-5 h-5" />
            <span className="font-semibold">READ THIS TO YOUR CREW:</span>
          </div>
        </div>

        {allComplete ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">MISSION COMPLETE!</h2>
            <p className="text-4xl font-bold text-cyan-300 mt-4">Final Score: {score}</p>
            <p className="text-slate-500 mt-2">Penalties: {penalties}</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-xl p-6 mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-red-400 font-mono">▶ CURRENT TASK ({currentTaskIndex + 1}/{allTasks.length})</span>
                <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400 font-mono uppercase">{currentTask.control}</span>
              </div>
              <h2 className="text-xl font-semibold text-white">"{currentTask.name}"</h2>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-mono">COMING UP:</div>
              {allTasks.slice(currentTaskIndex + 1, currentTaskIndex + 5).map((task) => (
                <div key={task.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex justify-between">
                  <span className="text-sm text-slate-400">{task.name}</span>
                  <span className="text-xs text-slate-600 font-mono uppercase">{task.control}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 text-center text-slate-500 text-sm">{completedTasks.length} of {allTasks.length} complete</div>
      </div>
    );
  }

  // CREW VIEW - SPACESHIP COCKPIT
  if (screen === 'game' && role === 'crew') {
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
        {/* Feedback */}
        {showFeedback && (
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-xl text-xl font-bold shadow-2xl ${
            showFeedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className="flex items-center gap-3">
              {showFeedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              {showFeedback.message}
            </div>
          </div>
        )}

        {allComplete ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-950 to-slate-950">
            <div className="text-center">
              <div className="text-8xl mb-6">🚀</div>
              <h2 className="text-4xl font-bold text-green-400 mb-4">MISSION COMPLETE!</h2>
              <div className="text-5xl font-bold text-cyan-300 mb-2">{score} PTS</div>
              {penalties > 0 && <p className="text-red-400">Errors: {penalties}</p>}
            </div>
          </div>
        ) : (
          <div className="h-screen flex flex-col">
            {/* Top Console Bar */}
            <div className="bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-b-4 border-slate-600 px-4 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 rounded px-3 py-1 border border-slate-600">
                    <span className="text-[10px] text-slate-500 font-mono">MISSION</span>
                    <div className="text-cyan-400 font-mono font-bold">{gameCode}</div>
                  </div>
                  <StatusLights />
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3 text-green-400" />
                    <Battery className="w-3 h-3 text-green-400" />
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="bg-slate-900 rounded px-3 py-1 border border-slate-600">
                    <span className="text-[10px] text-slate-500 font-mono">TIME</span>
                    <div className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded px-3 py-1 border border-slate-600">
                    <span className="text-[10px] text-slate-500 font-mono">SCORE</span>
                    <div className="text-green-400 font-mono font-bold">{score}</div>
                  </div>
                  {penalties > 0 && (
                    <div className="bg-red-900/50 rounded px-3 py-1 border border-red-600">
                      <span className="text-[10px] text-red-400 font-mono">ERRORS</span>
                      <div className="text-red-400 font-mono font-bold">{penalties}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Cockpit Area */}
            <div className="flex-1 p-4 overflow-auto">
              {/* Warning Banner */}
              <div className="bg-gradient-to-r from-red-900/50 via-red-800/30 to-red-900/50 border border-red-500/50 rounded px-4 py-2 mb-4 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-200 font-mono">WAIT FOR COMMANDER — WRONG SEQUENCE = -50 PTS</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>

              {/* Cockpit Panels */}
              <div className="space-y-4">
                {[1, 2, 3].map(phaseNum => {
                  const phaseTasks = shuffledPhases[phaseNum].tasks;
                  const phaseComplete = phases[phaseNum].tasks.every(t => completedTasks.includes(t.id));
                  
                  return (
                    <div key={phaseNum} className="relative">
                      {/* Panel Frame */}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-600 to-slate-800 rounded-xl" />
                      <div className="absolute inset-[3px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg" />
                      
                      {/* Panel Content */}
                      <div className="relative p-4">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              phaseComplete ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-lg' :
                              phaseNum === currentPhase ? 'bg-cyan-500 border-cyan-400 animate-pulse' : 
                              'bg-slate-700 border-slate-600'
                            }`} />
                            <div>
                              <div className="text-xs font-mono text-slate-400">{phases[phaseNum].name}</div>
                              <div className="text-[10px] text-slate-600">{phases[phaseNum].subtitle}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Gauge value={phaseComplete ? 100 : 50} label="PWR" />
                            <MiniDisplay lines={[
                              `PHASE ${phaseNum}`,
                              phaseComplete ? 'COMPLETE' : 'ACTIVE',
                              `${phases[phaseNum].tasks.filter(t => completedTasks.includes(t.id)).length}/${phases[phaseNum].tasks.length}`
                            ]} />
                          </div>
                        </div>

                        {/* Controls with integrated labels */}
                        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                          <div className={`flex flex-wrap justify-center gap-6 ${
                            phaseTasks.length <= 3 ? 'gap-8' : 'gap-4'
                          }`}>
                            {phaseTasks.map(task => renderControl(task))}
                          </div>
                        </div>

                        {/* Decorative rivets */}
                        <div className="flex justify-between mt-2 px-2">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                            <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                            <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-gradient-to-t from-slate-800 to-slate-900 border-t-2 border-slate-700 px-4 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <div className="h-3 w-32 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-300"
                      style={{ width: `${(completedTasks.length / allTasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {completedTasks.length}/{allTasks.length} COMPLETE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-600">SYS NOMINAL</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default StarBitesGame;
