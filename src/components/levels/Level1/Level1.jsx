import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Crown, Clock, Volume2, AlertTriangle, CheckCircle2, XCircle, Wifi, Battery, Thermometer, Activity, Timer, Rocket, RotateCcw, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';
import { phases, getAllTasks, PENALTY_AMOUNT } from '../../../data/level1Tasks';
import PushButton from '../../controls/PushButton';
import ToggleSwitch from '../../controls/ToggleSwitch';
import PullLever from '../../controls/PullLever';
import RotaryDial from '../../controls/RotaryDial';
import HoldButton from '../../controls/HoldButton';
import { getPlayerCharacter } from '../../../data/characters';
import LevelComplete from '../../common/LevelComplete';

const TASK_TIME_LIMIT = 7; // seconds per task
const MISS_PENALTY = 25; // points lost for missing a task
const VISIBLE_UPCOMING_TASKS = 2; // Number of upcoming tasks to show (mystery mode)

// Shuffle function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MIN_TASKS_PER_PLAYER = 3;

const Level1 = ({ onNavigateToLevel }) => {
  const {
    gameState,
    playerId,
    role,
    isCommander,
    isCrew,
    completeTask,
    applyPenalty,
    completeLevel,
    updateLevelState,
    startPretrialChecklist,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [taskTimeLeft, setTaskTimeLeft] = useState(TASK_TIME_LIMIT); // per-task timer
  const [showFeedback, setShowFeedback] = useState(null);
  const [retryQueue, setRetryQueue] = useState([]); // Tasks that need to be retried
  const taskTimerRef = useRef(null);
  const lastTaskIndexRef = useRef(-1);

  // This is now Level 2 in the game flow (Pretrial Checklist)
  const level2State = gameState?.level2 || {
    currentPhase: 1,
    currentTaskIndex: 0,
    completedTasks: [],
    score: 0,
    penalties: 0,
    levelStarted: false, // Commander must start the level
    missedTaskCount: 0, // Track total missed tasks
    readyPlayers: [],
    taskAssignments: {},
    taskCompletions: {},
  };

  const levelStarted = level2State.levelStarted || false;
  const allTasks = getAllTasks();
  const currentTaskIndex = level2State.currentTaskIndex || 0;
  const completedTasks = level2State.completedTasks || [];
  const penalties = level2State.penalties || 0;
  const missedTaskCount = level2State.missedTaskCount || 0;
  const readyPlayers = level2State.readyPlayers || [];
  const taskAssignments = level2State.taskAssignments || {};
  const taskCompletions = level2State.taskCompletions || {};

  // Get all players and check ready status
  const allPlayers = Object.keys(gameState?.players || {});
  const crewPlayers = allPlayers.filter(pid => gameState?.players[pid]?.role === 'crew');
  const allPlayersReady = allPlayers.length > 0 && allPlayers.every(pid => readyPlayers.includes(pid));

  // Check if player is assigned to a task
  const isPlayerAssignedToTask = (taskId) => {
    const assigned = taskAssignments[taskId] || [];
    return assigned.includes(playerId);
  };

  // Check if player has completed their part of a task
  const hasPlayerCompletedTask = (taskId) => {
    const completions = taskCompletions[taskId] || [];
    return completions.includes(playerId);
  };

  // Check if task is fully complete (all assigned players have completed)
  const isTaskFullyComplete = (taskId) => {
    const assigned = taskAssignments[taskId] || [];
    const completions = taskCompletions[taskId] || [];
    if (assigned.length === 0) return completedTasks.includes(taskId); // Fallback for single player
    return assigned.every(pid => completions.includes(pid));
  };

  // Get tasks assigned to current player
  const myAssignedTasks = allTasks.filter(task => isPlayerAssignedToTask(task.id));

  // Calculate the ACTIVE phase based on completions (for phase-based progression)
  // A phase is only "active" when all previous phases are complete
  const activePhase = useMemo(() => {
    // Check if phase 1 is complete (all phase 1 tasks done)
    const phase1Complete = phases[1].tasks.every(t => completedTasks.includes(t.id));
    if (!phase1Complete) return 1;

    // Check if phase 2 is complete
    const phase2Complete = phases[2].tasks.every(t => completedTasks.includes(t.id));
    if (!phase2Complete) return 2;

    // Phase 3 is active (or all done)
    return 3;
  }, [completedTasks]);

  // Get tasks for the current active phase only
  const currentPhaseTasks = phases[activePhase]?.tasks || [];

  // Calculate the task index WITHIN the current phase
  const phaseTaskIndex = useMemo(() => {
    // Count how many tasks in the current phase have been attempted (completed or in retry queue)
    const attemptedInPhase = currentPhaseTasks.filter(t =>
      completedTasks.includes(t.id) || retryQueue.some(rt => rt.id === t.id)
    ).length;
    return attemptedInPhase;
  }, [currentPhaseTasks, completedTasks, retryQueue]);

  // Get the next unattempted task in the current phase
  const nextPhaseTask = useMemo(() => {
    return currentPhaseTasks.find(t =>
      !completedTasks.includes(t.id) && !retryQueue.some(rt => rt.id === t.id)
    );
  }, [currentPhaseTasks, completedTasks, retryQueue]);

  // Check if we're in retry mode for the current phase
  // (all tasks attempted but some in retry queue)
  const isPhaseRetryMode = !nextPhaseTask && retryQueue.length > 0;

  // Get current task (either from retry queue or next unattempted task in phase)
  const currentRetryTask = retryQueue[0];
  const currentTask = isPhaseRetryMode ? currentRetryTask : nextPhaseTask;

  // Check if current phase is complete (all tasks done, no retries pending)
  const isCurrentPhaseComplete = currentPhaseTasks.every(t => completedTasks.includes(t.id));

  // Check if a phase is unlocked (active phase or earlier)
  const isPhaseUnlocked = (phaseNum) => {
    return phaseNum <= activePhase;
  };

  // For display, use activePhase for phase-based progression
  const currentPhase = activePhase;

  // Alias for backward compatibility with existing code
  const isRetrying = isPhaseRetryMode;

  // Memoize shuffled tasks for crew display
  const shuffledPhases = useMemo(() => ({
    1: { ...phases[1], tasks: shuffleArray(phases[1].tasks) },
    2: { ...phases[2], tasks: shuffleArray(phases[2].tasks) },
    3: { ...phases[3], tasks: shuffleArray(phases[3].tasks) },
  }), []);

  // Commander starts the level with task assignments
  const handleStartLevel = useCallback(() => {
    if (!isCommander) return;
    startPretrialChecklist(allTasks);
  }, [isCommander, startPretrialChecklist, allTasks]);

  // Handle task timeout - add to retry queue instead of skipping
  const handleTaskTimeout = useCallback(() => {
    if (!currentTask || !levelStarted) return;

    // Apply penalty
    applyPenalty(MISS_PENALTY);
    updateLevelState('level2', {
      missedTaskCount: missedTaskCount + 1
    });

    // Show timeout feedback
    setShowFeedback({ type: 'timeout', message: `TIME'S UP! -${MISS_PENALTY} PTS - RETRY REQUIRED!` });
    setTimeout(() => setShowFeedback(null), 1500);

    if (isPhaseRetryMode) {
      // If already retrying, move this task to end of retry queue
      setRetryQueue(prev => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    } else {
      // Add to retry queue (task progression is now automatic based on state)
      setRetryQueue(prev => [...prev, currentTask]);
    }

    // Reset task timer
    setTaskTimeLeft(TASK_TIME_LIMIT);
  }, [currentTask, levelStarted, applyPenalty, updateLevelState, missedTaskCount, isPhaseRetryMode]);

  // Retry mode is now computed automatically based on state (isPhaseRetryMode)
  // No need for this effect anymore since we compute it directly

  // Clean up retry queue - remove any tasks that have been completed
  // AND ensure only tasks from the current active phase remain
  // This ensures completed tasks never re-enter the retry cycle
  useEffect(() => {
    const currentPhaseTaskIds = currentPhaseTasks.map(t => t.id);
    setRetryQueue(prev => {
      const filtered = prev.filter(task =>
        !completedTasks.includes(task.id) && // Not completed
        currentPhaseTaskIds.includes(task.id) // In current phase
      );
      // Only update if something changed to avoid infinite loops
      if (filtered.length !== prev.length) {
        return filtered;
      }
      return prev;
    });
  }, [completedTasks, currentPhaseTasks]);

  // Overall level timer (only runs when level is started)
  useEffect(() => {
    if (!levelStarted) return;
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, levelStarted]);

  // Per-task timer - counts down and handles timeout
  useEffect(() => {
    // Don't run timer if level not started or all tasks complete
    if (!levelStarted) return;
    if (!currentTask) return; // No current task means phase/level is complete

    const allComplete = completedTasks.length >= allTasks.length && retryQueue.length === 0;
    if (allComplete) return;

    // Reset timer when task changes
    const taskKey = isPhaseRetryMode ? `retry-${currentRetryTask?.id}` : `task-${currentTask?.id}`;
    if (taskKey !== lastTaskIndexRef.current) {
      setTaskTimeLeft(TASK_TIME_LIMIT);
      lastTaskIndexRef.current = taskKey;
    }

    // Start countdown
    taskTimerRef.current = setInterval(() => {
      setTaskTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - handle timeout
          clearInterval(taskTimerRef.current);
          handleTaskTimeout();
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
  }, [currentTask, completedTasks.length, allTasks.length, handleTaskTimeout, levelStarted, isPhaseRetryMode, currentRetryTask, retryQueue.length]);

  const isCompleted = (taskId) => completedTasks.includes(taskId);
  const allComplete = completedTasks.length >= allTasks.length && retryQueue.length === 0;

  // Check if ALL phases are complete
  const allPhasesComplete = [1, 2, 3].every(p =>
    phases[p].tasks.every(t => completedTasks.includes(t.id))
  ) && retryQueue.length === 0;

  // Handle level complete (this is Level 2 in the new structure)
  useEffect(() => {
    if (allPhasesComplete && levelStarted && !level2State.completedAt) {
      completeLevel(2);
    }
  }, [allPhasesComplete, level2State.completedAt, completeLevel, levelStarted]);

  // Get which phase a task belongs to
  const getTaskPhase = (taskId) => {
    if (phases[1].tasks.some(t => t.id === taskId)) return 1;
    if (phases[2].tasks.some(t => t.id === taskId)) return 2;
    if (phases[3].tasks.some(t => t.id === taskId)) return 3;
    return null;
  };

  const attemptTask = (taskId) => {
    if (role !== 'crew') return;
    if (!levelStarted) return;

    // Check if the task's phase is unlocked
    const taskPhase = getTaskPhase(taskId);
    if (taskPhase && !isPhaseUnlocked(taskPhase)) {
      setShowFeedback({ type: 'error', message: `PHASE ${taskPhase} LOCKED! Complete current phase first.` });
      setTimeout(() => setShowFeedback(null), 1500);
      return;
    }

    const expectedTaskId = isRetrying ? currentRetryTask?.id : currentTask?.id;

    // Check if player is assigned to this task (if task assignments exist)
    const hasAssignments = Object.keys(taskAssignments).length > 0;
    if (hasAssignments && !isPlayerAssignedToTask(taskId)) {
      setShowFeedback({ type: 'error', message: 'NOT YOUR TASK!' });
      setTimeout(() => setShowFeedback(null), 1200);
      return;
    }

    // Check if player already completed their part
    if (hasPlayerCompletedTask(taskId)) {
      setShowFeedback({ type: 'info', message: 'ALREADY COMPLETED!' });
      setTimeout(() => setShowFeedback(null), 1200);
      return;
    }

    // Check if task is already fully complete
    if (isTaskFullyComplete(taskId)) {
      return;
    }

    if (taskId === expectedTaskId) {
      // Record this player's completion of the task
      const currentCompletions = taskCompletions[taskId] || [];
      const newCompletions = [...currentCompletions, playerId];
      const newTaskCompletions = {
        ...taskCompletions,
        [taskId]: newCompletions,
      };

      // Check if all assigned players have now completed
      const assigned = taskAssignments[taskId] || [playerId];
      const taskNowFullyComplete = assigned.every(pid => newCompletions.includes(pid));

      if (taskNowFullyComplete || !hasAssignments) {
        // Task is fully complete!
        const timeBonus = taskTimeLeft * 5; // Up to 25 bonus points for fast completion
        const taskPoints = isPhaseRetryMode ? 25 : (currentTask?.points || 50); // Reduced points for retry
        const points = taskPoints + timeBonus;

        completeTask(taskId, points);
        setShowFeedback({ type: 'success', message: `CONFIRMED! +${points} PTS` });
        setTimeout(() => setShowFeedback(null), 1200);

        if (isPhaseRetryMode) {
          // Remove from retry queue
          setRetryQueue(prev => prev.filter(t => t.id !== taskId));
        } else {
          // Task completion is tracked via completedTasks, no need to update index
          // Just update taskCompletions for teamwork tracking
          updateLevelState('level2', {
            taskCompletions: newTaskCompletions,
          });
        }

        // Reset task timer
        setTaskTimeLeft(TASK_TIME_LIMIT);
      } else {
        // Player completed their part but waiting for others
        updateLevelState('level2', {
          taskCompletions: newTaskCompletions,
        });
        setShowFeedback({ type: 'partial', message: `YOUR PART DONE! WAITING FOR TEAM...` });
        setTimeout(() => setShowFeedback(null), 1200);
      }
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
  const renderControl = (task, phaseNum) => {
    const hasAssignments = Object.keys(taskAssignments).length > 0;
    const isAssignedToMe = isPlayerAssignedToTask(task.id);
    const myPartComplete = hasPlayerCompletedTask(task.id);
    const fullyComplete = isTaskFullyComplete(task.id);
    const assignedPlayers = taskAssignments[task.id] || [];
    const completedBy = taskCompletions[task.id] || [];
    const needsTeamwork = assignedPlayers.length > 1;

    // Check if phase is locked
    const isPhaseLocked = !isPhaseUnlocked(phaseNum);

    // Determine visual state
    const isDisabled = isPhaseLocked || (hasAssignments && !isAssignedToMe);
    const isMyComplete = myPartComplete;
    const isFullComplete = fullyComplete || completedTasks.includes(task.id);

    const props = {
      task,
      isCompleted: isFullComplete,
      isPartialComplete: isMyComplete && !isFullComplete,
      isDisabled: isDisabled,
      isLocked: isPhaseLocked,
      needsTeamwork: needsTeamwork && !isFullComplete,
      teamProgress: needsTeamwork ? { completed: completedBy.length, total: assignedPlayers.length } : null,
      onActivate: () => attemptTask(task.id)
    };

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
      <div className={`w-2 h-2 rounded-full ${levelStarted ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
      <div className={`w-2 h-2 rounded-full ${levelStarted ? 'bg-green-500' : 'bg-slate-600'}`} />
      <div className="w-2 h-2 rounded-full bg-amber-500" />
      <div className="w-2 h-2 rounded-full bg-slate-600" />
    </div>
  );

  const MiniDisplay = ({ lines }) => (
    <div className="bg-slate-950 border border-slate-700 rounded p-1 font-mono text-[8px] text-green-400 leading-tight">
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );

  // Pre-start screen for Commander
  const CommanderPreStart = () => (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-white p-4 flex flex-col">
      {/* Header */}
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
      </div>

      {/* Pre-start content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <Rocket className="w-28 h-28 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-amber-300 mb-4">PRETRIAL CHECKLIST</h2>
          <p className="text-xl text-slate-200 mb-8">
            {allPlayersReady
              ? "Your crew is ready! Press the button below to begin the checklist sequence."
              : "Waiting for all crew members to be ready..."}
          </p>

          {/* Crew Ready Status */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Crew Ready Status ({readyPlayers.length}/{allPlayers.length})
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {allPlayers.map((pid) => {
                const isReady = readyPlayers.includes(pid);
                const playerData = gameState.players[pid];
                const isMe = pid === playerId;
                const character = getPlayerCharacter(pid, playerData?.functionalRole);
                return (
                  <div
                    key={pid}
                    className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                      isReady
                        ? 'bg-green-900/30 border-green-500 text-green-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400'
                    } ${isMe ? 'ring-2 ring-amber-500' : ''}`}
                  >
                    <span className="text-lg">{character.emoji}</span>
                    {isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 animate-pulse" />
                    )}
                    <span className="text-sm font-medium">{character.name}</span>
                    {isMe && <span className="text-xs text-cyan-400">(You)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-6 mb-6 text-left">
            <div className="flex items-center gap-3 text-amber-300 mb-4">
              <Volume2 className="w-7 h-7" />
              <span className="font-bold text-xl">COMMANDER BRIEFING</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📢</span>
                <p className="text-lg text-amber-100">
                  <strong>Read each task aloud</strong> to your crew clearly.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <p className="text-lg text-amber-100">
                  Tasks have a <strong>{TASK_TIME_LIMIT}-second time limit</strong>. Missed tasks must be retried!
                </p>
              </div>
              {crewPlayers.length > 1 && (
                <div className="flex items-start gap-3 bg-cyan-900/30 rounded-lg p-3 border border-cyan-600/50">
                  <Users className="w-7 h-7 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-cyan-200">
                    <strong className="text-cyan-300">Teamwork Mode:</strong> Tasks are distributed across {crewPlayers.length} crew members. Some tasks require <strong>multiple crew members</strong> to complete together!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm text-slate-400 mb-2">Phase Overview:</h3>
            <div className="space-y-2">
              {Object.values(phases).map(phase => (
                <div key={phase.id} className="flex justify-between text-sm">
                  <span className="text-slate-300">{phase.name}</span>
                  <span className="text-slate-500">{phase.tasks.length} tasks</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between font-bold">
              <span className="text-slate-300">Total Tasks</span>
              <span className="text-cyan-400">{allTasks.length}</span>
            </div>
          </div>

          <button
            onClick={handleStartLevel}
            disabled={!allPlayersReady}
            className={`px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-3 mx-auto ${
              allPlayersReady
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-105'
                : 'bg-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Rocket className="w-6 h-6" />
            {allPlayersReady ? 'Begin Checklist' : 'Waiting for Crew...'}
          </button>
        </div>
      </div>
    </div>
  );

  // Pre-start screen for Crew
  const CrewPreStart = () => (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="animate-pulse mb-6">
          <Clock className="w-24 h-24 text-cyan-400 mx-auto" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-4">STANDBY FOR CHECKLIST</h2>
        <p className="text-xl text-slate-300 mb-8">
          Waiting for Commander to begin the pretrial checklist sequence...
        </p>

        {/* Instructions - larger and more visible */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👂</span>
            <p className="text-lg text-slate-200">
              <strong className="text-cyan-300">Listen carefully</strong> to your Commander when they call out a task.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <p className="text-lg text-slate-200">
              <strong className="text-cyan-300">Find and activate</strong> the correct control on your panel.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-amber-900/30 rounded-lg p-3 border border-amber-600/50">
            <Users className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-lg text-amber-200">
              <strong className="text-amber-300">Teamwork tasks:</strong> Some tasks show this icon, meaning <strong>you AND another crew member</strong> must both complete the task. Listen closely to make sure all tasks are done!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Show pre-start screen if level hasn't started
  if (!levelStarted) {
    return isCommander ? <CommanderPreStart /> : <CrewPreStart />;
  }

  // COMMANDER VIEW
  if (isCommander) {
    // Get upcoming tasks from CURRENT PHASE only (limited for mystery)
    // Find remaining unattempted tasks in this phase
    const remainingPhaseTasks = currentPhaseTasks.filter(t =>
      !completedTasks.includes(t.id) && !retryQueue.some(rt => rt.id === t.id) && t.id !== currentTask?.id
    );

    const upcomingTasks = isPhaseRetryMode
      ? retryQueue.slice(1, 1 + VISIBLE_UPCOMING_TASKS)
      : remainingPhaseTasks.slice(0, VISIBLE_UPCOMING_TASKS);

    // Count tasks in current phase
    const phaseTasksCompleted = currentPhaseTasks.filter(t => completedTasks.includes(t.id)).length;
    const phaseTasksTotal = currentPhaseTasks.length;

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

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="text-lg font-bold text-green-400">{completedTasks.length}/{allTasks.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500">Retry Queue</div>
            <div className={`text-lg font-bold ${retryQueue.length > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
              {retryQueue.length}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500">Penalties</div>
            <div className={`text-lg font-bold ${penalties > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {penalties}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500">Missed</div>
            <div className={`text-lg font-bold ${missedTaskCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {missedTaskCount}
            </div>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="mb-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex gap-2">
            {[1, 2, 3].map(p => {
              const phaseComplete = phases[p].tasks.every(t => completedTasks.includes(t.id));
              const phaseLocked = !isPhaseUnlocked(p);
              return (
                <div key={p} className="flex-1">
                  <div className={`h-2 rounded-full ${
                    phaseComplete ? 'bg-green-500' :
                    p === activePhase ? 'bg-cyan-500' :
                    phaseLocked ? 'bg-slate-800' : 'bg-slate-700'
                  }`} />
                  <div className={`text-xs mt-1 text-center flex items-center justify-center gap-1 ${
                    phaseLocked ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {phaseLocked && <Lock className="w-3 h-3" />}
                    {phases[p].name}
                    {phaseComplete && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instruction Banner */}
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-300 mb-1">
            <Volume2 className="w-5 h-5" />
            <span className="font-semibold">READ THIS TO YOUR CREW:</span>
          </div>
        </div>

        {allPhasesComplete ? (
          <LevelComplete
            level={2}
            score={gameState.level2?.score || 0}
            onContinue={() => onNavigateToLevel && onNavigateToLevel(3)}
          />
        ) : isCurrentPhaseComplete ? (
          // Phase complete! Show transition message
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">{phases[activePhase].name} COMPLETE!</h2>
            <p className="text-xl text-slate-300 mt-4">
              Moving to {phases[activePhase + 1]?.name || 'next phase'}...
            </p>
            <p className="text-slate-500 mt-2">
              Phase Score: {currentPhaseTasks.reduce((sum, t) => sum + (completedTasks.includes(t.id) ? t.points : 0), 0)} pts
            </p>
          </div>
        ) : (
          <>
            {/* Current Phase Header */}
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-xl p-3 mb-4 text-center">
              <span className="text-cyan-300 font-mono font-bold text-lg">{phases[activePhase].name}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-400">{phaseTasksCompleted}/{phaseTasksTotal} tasks complete</span>
            </div>

            {/* Retry Mode Banner */}
            {isPhaseRetryMode && (
              <div className="bg-amber-900/50 border-2 border-amber-500 rounded-xl p-4 mb-4 flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-amber-400 animate-spin" />
                <div>
                  <div className="font-bold text-amber-300">RETRY MODE - {phases[activePhase].name}</div>
                  <div className="text-sm text-amber-200/80">
                    {retryQueue.length} missed task{retryQueue.length > 1 ? 's' : ''} must be completed before next phase
                  </div>
                </div>
              </div>
            )}

            {/* Current Task with Timer */}
            {currentTask && (
              <div className={`border-2 rounded-xl p-6 mb-4 ${
                isPhaseRetryMode
                  ? 'bg-gradient-to-r from-amber-900/50 to-yellow-900/50 border-amber-500'
                  : 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-mono ${isPhaseRetryMode ? 'text-amber-400' : 'text-red-400'}`}>
                    {isPhaseRetryMode ? '▶ RETRY TASK' : `▶ ${phases[activePhase].name} (${phaseTasksCompleted + 1}/${phaseTasksTotal})`}
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
            )}

            {/* Upcoming Tasks in this Phase (Mystery Mode - limited view) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Eye className="w-4 h-4" />
                COMING UP IN {phases[activePhase].name}:
              </div>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex justify-between">
                    <span className="text-sm text-slate-400">{task.name}</span>
                    <span className="text-xs text-slate-600 font-mono uppercase">{task.control}</span>
                  </div>
                ))
              ) : !isPhaseRetryMode && (
                <div className="text-sm text-slate-500 italic pl-4">No more tasks in this phase</div>
              )}
              {!isPhaseRetryMode && remainingPhaseTasks.length > VISIBLE_UPCOMING_TASKS && (
                <div className="flex items-center gap-2 text-xs text-slate-600 pl-4">
                  <EyeOff className="w-3 h-3" />
                  {remainingPhaseTasks.length - VISIBLE_UPCOMING_TASKS} more tasks hidden...
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-center text-slate-500 text-sm">
          {completedTasks.length} of {allTasks.length} complete (total)
          {retryQueue.length > 0 && ` | ${retryQueue.length} awaiting retry`}
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
          showFeedback.type === 'success' ? 'bg-green-500' :
          showFeedback.type === 'partial' ? 'bg-cyan-600' :
          showFeedback.type === 'info' ? 'bg-slate-600' :
          showFeedback.type === 'timeout' ? 'bg-amber-600' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {showFeedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
             showFeedback.type === 'partial' ? <Users className="w-8 h-8" /> :
             showFeedback.type === 'info' ? <CheckCircle2 className="w-8 h-8" /> :
             showFeedback.type === 'timeout' ? <RotateCcw className="w-8 h-8" /> :
             <XCircle className="w-8 h-8" />}
            {showFeedback.message}
          </div>
        </div>
      )}

      {allPhasesComplete ? (
        <LevelComplete
          level={2}
          score={gameState.level2?.score || 0}
          onContinue={() => onNavigateToLevel && onNavigateToLevel(3)}
        />
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
                {isRetrying && (
                  <div className="bg-amber-900/50 rounded px-3 py-1 border border-amber-600 flex items-center gap-2">
                    <RotateCcw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="text-amber-400 font-mono font-bold text-sm">RETRY: {retryQueue.length}</span>
                  </div>
                )}
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
            <div className={`border rounded px-4 py-2 mb-4 flex items-center justify-center gap-2 ${
              isRetrying
                ? 'bg-gradient-to-r from-amber-900/50 via-amber-800/30 to-amber-900/50 border-amber-500/50'
                : 'bg-gradient-to-r from-red-900/50 via-red-800/30 to-red-900/50 border-red-500/50'
            }`}>
              {isRetrying ? (
                <>
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-200 font-mono">RETRY MODE — COMPLETE MISSED TASKS</span>
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-200 font-mono">WAIT FOR COMMANDER — WRONG SEQUENCE = -{PENALTY_AMOUNT} PTS</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </>
              )}
            </div>

            {/* Cockpit Panels */}
            <div className="space-y-4">
              {[1, 2, 3].map(phaseNum => {
                const phaseTasks = shuffledPhases[phaseNum].tasks;
                const phaseComplete = phases[phaseNum].tasks.every(t => completedTasks.includes(t.id));
                const isPhaseLocked = !isPhaseUnlocked(phaseNum);

                return (
                  <div key={phaseNum} className={`relative ${isPhaseLocked ? 'opacity-60' : ''}`}>
                    {/* Panel Frame */}
                    <div className={`absolute inset-0 bg-gradient-to-b rounded-xl ${
                      isPhaseLocked ? 'from-slate-700 to-slate-800' : 'from-slate-600 to-slate-800'
                    }`} />
                    <div className="absolute inset-[3px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg" />

                    {/* Locked Overlay */}
                    {isPhaseLocked && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 rounded-xl">
                        <div className="bg-slate-800/90 px-4 py-2 rounded-lg border border-slate-600 flex items-center gap-2">
                          <Lock className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-mono text-slate-400">COMPLETE PREVIOUS PHASE</span>
                        </div>
                      </div>
                    )}

                    {/* Panel Content */}
                    <div className="relative p-4">
                      {/* Panel Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            phaseComplete ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-lg' :
                            phaseNum === currentPhase && !isPhaseLocked ? 'bg-cyan-500 border-cyan-400 animate-pulse' :
                            'bg-slate-700 border-slate-600'
                          }`} />
                          <div>
                            <div className={`text-xs font-mono ${isPhaseLocked ? 'text-slate-500' : 'text-slate-400'}`}>
                              {phases[phaseNum].name}
                              {isPhaseLocked && ' 🔒'}
                            </div>
                            <div className="text-[10px] text-slate-600">{phases[phaseNum].subtitle}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Gauge value={phaseComplete ? 100 : isPhaseLocked ? 0 : 50} label="PWR" />
                          <MiniDisplay lines={[
                            `PHASE ${phaseNum}`,
                            phaseComplete ? 'COMPLETE' : isPhaseLocked ? 'LOCKED' : 'ACTIVE',
                            `${phases[phaseNum].tasks.filter(t => completedTasks.includes(t.id)).length}/${phases[phaseNum].tasks.length}`
                          ]} />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className={`bg-slate-950/50 rounded-lg p-4 border ${
                        isPhaseLocked ? 'border-slate-800' : 'border-slate-700'
                      }`}>
                        <div className={`flex flex-wrap justify-center gap-6 ${
                          phaseTasks.length <= 3 ? 'gap-8' : 'gap-4'
                        }`}>
                          {phaseTasks.map(task => renderControl(task, phaseNum))}
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
