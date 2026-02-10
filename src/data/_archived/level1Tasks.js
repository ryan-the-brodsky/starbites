// Level 2: Pretrial Checklist - Real task names for training

export const phases = {
  1: {
    name: "T-MINUS 8 WEEKS",
    subtitle: "Initial Setup",
    tasks: [
      {
        id: 'p1t1',
        name: 'Pilot/trial results communicated to technical team',
        control: 'button',
        points: 100,
      },
      {
        id: 'p1t2',
        name: 'Material lead times confirmed',
        control: 'lever',
        points: 100,
      },
      {
        id: 'p1t3',
        name: 'Processing flowcharts and conditions drafted',
        control: 'dial',
        points: 100,
      },
      {
        id: 'p1t4',
        name: 'New ingredient setup in systems',
        control: 'switch',
        points: 100,
      },
      {
        id: 'p1t5',
        name: 'Dummy code requests completed',
        control: 'button',
        points: 100,
      },
      {
        id: 'p1t6',
        name: 'ETQ workflow for new materials kicked off',
        control: 'hold',
        points: 100,
      },
    ]
  },
  2: {
    name: "T-MINUS 4 WEEKS",
    subtitle: "Pre-Trial",
    tasks: [
      {
        id: 'p2t1',
        name: 'Material approved in ETQ confirmed',
        control: 'switch',
        points: 100,
      },
      {
        id: 'p2t2',
        name: 'PO placed with lead time matching trial needs',
        control: 'lever',
        points: 100,
      },
      {
        id: 'p2t3',
        name: 'Trial BOM creation requested',
        control: 'button',
        points: 100,
      },
    ]
  },
  3: {
    name: "T-MINUS 2 WEEKS",
    subtitle: "Final Prep",
    tasks: [
      {
        id: 'p3t1',
        name: 'Pre-trial call scheduled',
        control: 'dial',
        points: 100,
      },
      {
        id: 'p3t2',
        name: 'Trial BOM approved',
        control: 'switch',
        points: 100,
      },
      {
        id: 'p3t3',
        name: 'Trial material on-site or ETA on track',
        control: 'hold',
        points: 100,
      },
      {
        id: 'p3t4',
        name: 'Badge access completed',
        control: 'button',
        points: 100,
      },
    ]
  }
};

export const getAllTasks = () => [
  ...phases[1].tasks,
  ...phases[2].tasks,
  ...phases[3].tasks,
];

export const getTaskById = (taskId) => {
  return getAllTasks().find(t => t.id === taskId);
};

export const getPhaseForTask = (taskId) => {
  for (const [phaseNum, phase] of Object.entries(phases)) {
    if (phase.tasks.some(t => t.id === taskId)) {
      return parseInt(phaseNum);
    }
  }
  return null;
};

export const PENALTY_AMOUNT = 50;
export const MAX_LEVEL2_SCORE = 1000;

export default phases;
