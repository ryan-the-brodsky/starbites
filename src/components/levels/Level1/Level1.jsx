import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Crown, Clock, Volume2, AlertTriangle, CheckCircle2, XCircle, Wifi, Battery, Thermometer, Activity, Timer } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';
import { phases, getAllTasks, PENALTY_AMOUNT } from '../../../data/level1Tasks';
import PushButton from '../../controls/PushButton';
import ToggleSwitch from '../../controls/ToggleSwitch';
import PullLever from '../../controls/PullLever';
import RotaryDial from '../../controls/RotaryDial';
import HoldButton from '../../controls/HoldButton';

const TASK_TIME_LIMIT = 5; // seconds per task
const MISS_PENALTY = 25; // points lost for missing a task

// Shuffle function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Level1 = () => {
  const {
    gameState,
    role,
    isCommander,
    isCrew,
    completeTask,
    applyPenalty,
    completeLevel,
    updateLevelState,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [taskTimeLeft, setTaskTimeLeft] = useState(TASK_TIME_LIMIT); // per-task timer
  const [showFeedback, setShowFeedback] = useState(null);
  const [missedTasks, setMissedTasks] = useState([]); // track which tasks were missed
  const taskTimerRef = useRef(null);
  const lastTaskIndexRef = useRef(0);

  // This is now Level 2 in the game flow (Pretrial Checklist)
  const level2State = gameState?.level2 || {
    currentPhase: 1,
    currentTaskIndex: 0,
    completedTasks: [],
    score: 0,
    penalties: 0,
  };

  const allTasks = getAllTasks();
  const currentTaskIndex = level2State.currentTaskIndex || 0;
  const completedTasks = level2State.completedTasks || [];
  const currentTask = allTasks[currentTaskIndex];
  const penalties = level2State.penalties || 0;

  // Calculate current phase based on task index
  const currentPhase = useMemo(() => {
    const phase1End = phases[1].tasks.length;
    const phase2End = phase1End + phases[2].tasks.length;

    if (currentTaskIndex < phase1End) return 1;
    if (currentTaskIndex < phase2End) return 2;
    return 3;
  }, [currentTaskIndex]);

  // Memoize shuffled tasks for crew display
  const shuffledPhases = useMemo(() => ({
    1: { ...phases[1], tasks: shuffleArray(phases[1].tasks) },
    2: { ...phases[2], tasks: shuffleArray(phases[2].tasks) },
    3: { ...phases[3], tasks: shuffleArray(phases[3].tasks) },
  }), []);

  // Skip to next task (called when task timer runs out)
  const skipCurrentTask = useCallback(() => {
    if (!currentTask || completedTasks.length >= allTasks.length) return;

    // Mark this task as missed and apply penalty
    setMissedTasks(prev => [...prev, currentTask.id]);
    applyPenalty(MISS_PENALTY);

    // Show timeout feedback
    setShowFeedback({ type: 'timeout', message: `TIME'S UP! -${MISS_PENALTY} PTS` });
    setTimeout(() => setShowFeedback(null), 1500);

    // Move to next task by marking current as "skipped" (completed with 0 points)
    completeTask(currentTask.id, 0);

    // Reset task timer
    setTaskTimeLeft(TASK_TIME_LIMIT);
  }, [currentTask, completedTasks.length, allTasks.length, applyPenalty, completeTask]);

  // Overall level timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Per-task timer - counts down and auto-skips when it reaches 0
  useEffect(() => {
    // Don't run timer if all tasks complete
    if (completedTasks.length >= allTasks.length) return;

    // Reset timer when task changes
    if (currentTaskIndex !== lastTaskIndexRef.current) {
      setTaskTimeLeft(TASK_TIME_LIMIT);
      lastTaskIndexRef.current = currentTaskIndex;
    }

    // Start countdown
    taskTimerRef.current = setInterval(() => {
      setTaskTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - skip this task
          clearInterval(taskTimerRef.current);
          skipCurrentTask();
          return TASK_TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (taskTimerRef.current) {
        clearInterval(taskTimerRef.current);
      }
    };
  }, [currentTaskIndex, completedTasks.length, allTasks.length, skipCurrentTask]);

  // Start timer on mount
  useEffect(() => {
    if (!level2State.startedAt) {
      updateLevelState('level2', { startedAt: Date.now() });
    }
  }, []);

  const isCompleted = (taskId) => completedTasks.includes(taskId);
  const isMissed = (taskId) => missedTasks.includes(taskId);
  const allComplete = completedTasks.length === allTasks.length;

  // Handle level complete (this is Level 2 in the new structure)
  useEffect(() => {
    if (allComplete && !level2State.completedAt) {
      completeLevel(2);
    }
  }, [allComplete, level2State.completedAt, completeLevel]);

  const attemptTask = (taskId) => {
    if (role !== 'crew') return;
    if (completedTasks.includes(taskId)) return;

    if (currentTask && taskId === currentTask.id) {
      // Bonus points for quick completion
      const timeBonus = taskTimeLeft * 5; // Up to 25 bonus points for fast completion
      const points = currentTask.points + timeBonus;
      completeTask(taskId, points);
      setShowFeedback({ type: 'success', message: `CONFIRMED! +${points} PTS` });
      setTimeout(() => setShowFeedback(null), 1200);
      // Reset task timer for next task
      setTaskTimeLeft(TASK_TIME_LIMIT);
    } else {
      applyPenalty(PENALTY_AMOUNT);
      setShowFeedback({ type: 'error', message: `WRONG SEQUENCE! -${PENALTY_AMOUNT}` });
      setTimeout(() => setShowFeedback(null), 1200);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render control
  const renderControl = (task) => {
    const props = { task, isCompleted: isCompleted(task.id), onActivate: () => attemptTask(task.id) };
    switch (task.control) {
      case 'button': return <PushButton key={task.id} {...props} />;
      case 'switch': return <ToggleSwitch key={task.id} {...props} />;
      case 'lever': return <PullLever key={task.id} {...props} />;
      case 'dial': return <RotaryDial key={task.id} {...props} />;
      case 'hold': return <HoldButton key={task.id} {...props} />;
      default: return <PushButton key={task.id} {...props} />;
    }
  };

  // Cockpit components
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

  // COMMANDER VIEW
  if (isCommander) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-white p-4">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-4 bg-slate-800/80 rounded-xl p-4 border border-amber-500/50">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-amber-300 font-bold">MISSION COMMANDER</div>
              <div className="text-slate-400 text-sm">
                Code: <span className="text-amber-400 font-mono text-lg">{gameState.gameCode}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-mono">
              <Clock className="w-6 h-6 text-cyan-400" />
              <span className={timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              Score: <span className="text-green-400">{gameState.meta.totalScore}</span>
            </div>
          </div>
        </div>

        {/* Phase Progress */}
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

        {/* Instruction Banner */}
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-300 mb-1">
            <Volume2 className="w-5 h-5" />
            <span className="font-semibold">READ THIS TO YOUR CREW:</span>
          </div>
        </div>

        {allComplete ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">LEVEL 2 COMPLETE!</h2>
            <p className="text-4xl font-bold text-cyan-300 mt-4">Score: {gameState.level2.score}</p>
            <p className="text-slate-500 mt-2">Penalties: {penalties}</p>
            <p className="text-slate-400 mt-4">Proceeding to Level 3...</p>
          </div>
        ) : (
          <>
            {/* Current Task with Timer */}
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-xl p-6 mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-red-400 font-mono">
                  ▶ CURRENT TASK ({currentTaskIndex + 1}/{allTasks.length})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400 font-mono uppercase">
                    {currentTask?.control}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">"{currentTask?.name}"</h2>

              {/* Task Timer Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${taskTimeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                    <span className={`text-sm font-mono font-bold ${taskTimeLeft <= 2 ? 'text-red-400' : 'text-amber-300'}`}>
                      {taskTimeLeft}s
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Task time remaining</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                      taskTimeLeft <= 2 ? 'bg-red-500' : taskTimeLeft <= 3 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(taskTimeLeft / TASK_TIME_LIMIT) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Missed Tasks Warning */}
            {missedTasks.length > 0 && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">
                  {missedTasks.length} task{missedTasks.length > 1 ? 's' : ''} missed (-{missedTasks.length * MISS_PENALTY} pts)
                </span>
              </div>
            )}

            {/* Upcoming Tasks */}
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

        <div className="mt-6 text-center text-slate-500 text-sm">
          {completedTasks.length} of {allTasks.length} complete
        </div>
      </div>
    );
  }

  // CREW VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Feedback */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-xl text-xl font-bold shadow-2xl ${
          showFeedback.type === 'success' ? 'bg-green-500' : showFeedback.type === 'timeout' ? 'bg-amber-600' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {showFeedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
             showFeedback.type === 'timeout' ? <Timer className="w-8 h-8" /> :
             <XCircle className="w-8 h-8" />}
            {showFeedback.message}
          </div>
        </div>
      )}

      {allComplete ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-950 to-slate-950">
          <div className="text-center">
            <div className="text-8xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold text-green-400 mb-4">LEVEL 2 COMPLETE!</h2>
            <div className="text-5xl font-bold text-cyan-300 mb-2">{gameState.level2.score} PTS</div>
            {penalties > 0 && <p className="text-red-400">Errors: {penalties}</p>}
            <p className="text-slate-400 mt-4">Loading Level 3...</p>
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
                  <div className="text-cyan-400 font-mono font-bold">{gameState.gameCode}</div>
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
                  <div className="text-green-400 font-mono font-bold">{gameState.meta.totalScore}</div>
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
              <span className="text-sm text-red-200 font-mono">WAIT FOR COMMANDER — WRONG SEQUENCE = -{PENALTY_AMOUNT} PTS</span>
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

                      {/* Controls */}
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
};

export default Level1;
