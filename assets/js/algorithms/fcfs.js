function runFCFS(processes) {
  // FCFS scheduling with idle gaps when no process is ready.
  const sorted = [...processes].sort((a, b) => {
    if (a.arrival !== b.arrival) return a.arrival - b.arrival;
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  let currentTime = 0;
  const ganttBlocks = [];
  const results = [];

  for (const process of sorted) {
    if (currentTime < process.arrival) {
      ganttBlocks.push({
        pid: 'IDLE',
        start: currentTime,
        end: process.arrival,
      });
      currentTime = process.arrival;
    }

    const startTime = currentTime;
    const completionTime = currentTime + process.burst;
    const turnaround = completionTime - process.arrival;
    const waiting = turnaround - process.burst;

    ganttBlocks.push({
      pid: process.pid,
      start: startTime,
      end: completionTime,
    });

    results.push({
      pid: process.pid,
      arrival: process.arrival,
      burst: process.burst,
      ct: completionTime,
      tat: turnaround,
      wt: waiting,
    });

    currentTime = completionTime;
  }

  return { ganttBlocks, results };
}

/* bridge: main.js */
const previousRunSelectedAlgorithmFCFS = window.runSelectedAlgorithm;
window.runSelectedAlgorithm = function runSelectedAlgorithm(input) {
  // Chain algorithm handlers in load order.
  if (input.algorithm === 'FCFS') {
    const mapped = input.processes.map((p) => ({
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
    }));

    return runFCFS(mapped);
  }

  if (typeof previousRunSelectedAlgorithmFCFS === 'function') {
    return previousRunSelectedAlgorithmFCFS(input);
  }

  throw new Error('No algorithm yet');
};
