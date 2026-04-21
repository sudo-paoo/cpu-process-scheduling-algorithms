function runSJF(processes) {
	const pending = processes.map((process) => ({ ...process, done: false }));
	const ganttBlocks = [];
	const results = [];

	let currentTime = 0;
	let completed = 0;

	while (completed < pending.length) {
		const ready = pending.filter((process) => !process.done && process.arrival <= currentTime);

		if (ready.length === 0) {
			const nextArrival = Math.min(
				...pending
					.filter((process) => !process.done)
					.map((process) => process.arrival)
			);

			if (currentTime < nextArrival) {
				ganttBlocks.push({
					pid: 'IDLE',
					start: currentTime,
					end: nextArrival,
				});
				currentTime = nextArrival;
			}

			continue;
		}

		ready.sort((a, b) => {
			if (a.burst !== b.burst) return a.burst - b.burst;
			if (a.arrival !== b.arrival) return a.arrival - b.arrival;
			return a.pid.localeCompare(b.pid, undefined, { numeric: true });
		});

		const selected = ready[0];
		const startTime = currentTime;
		const completionTime = startTime + selected.burst;
		const turnaround = completionTime - selected.arrival;
		const waiting = turnaround - selected.burst;

		ganttBlocks.push({
			pid: selected.pid,
			start: startTime,
			end: completionTime,
		});

		results.push({
			pid: selected.pid,
			arrival: selected.arrival,
			burst: selected.burst,
			ct: completionTime,
			tat: turnaround,
			wt: waiting,
		});

		selected.done = true;
		completed += 1;
		currentTime = completionTime;
	}

	return { ganttBlocks, results };
}

/* bridge: main.js */
const previousRunSelectedAlgorithmSJF = window.runSelectedAlgorithm;
window.runSelectedAlgorithm = function runSelectedAlgorithm(input) {
	if (input.algorithm === 'SJF') {
		const mapped = input.processes.map((p) => ({
			pid: p.pid,
			arrival: p.arrival,
			burst: p.burst,
			priority: p.priority,
		}));

		return runSJF(mapped);
	}

	if (typeof previousRunSelectedAlgorithmSJF === 'function') {
		return previousRunSelectedAlgorithmSJF(input);
	}

	throw new Error('No algorithm yet');
};
