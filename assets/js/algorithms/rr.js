function runRR(processes, quantum) {
	const q = Number.isFinite(quantum) && quantum > 0 ? Math.floor(quantum) : 1;
	const ordered = [...processes].sort((a, b) => {
		if (a.arrival !== b.arrival) return a.arrival - b.arrival;
		return a.pid.localeCompare(b.pid, undefined, { numeric: true });
	});

	const remaining = new Map(ordered.map((p) => [p.pid, p.burst]));
	const completion = new Map();
	const queue = [];
	const ganttBlocks = [];

	let currentTime = 0;
	let completed = 0;
	let nextArrivalIndex = 0;

	const appendBlock = (pid, start, end) => {
		if (end <= start) return;
		const last = ganttBlocks[ganttBlocks.length - 1];
		if (last && last.pid === pid && last.end === start) {
			last.end = end;
			return;
		}
		ganttBlocks.push({ pid, start, end });
	};

	const enqueueArrivals = () => {
		while (nextArrivalIndex < ordered.length && ordered[nextArrivalIndex].arrival <= currentTime) {
			queue.push(ordered[nextArrivalIndex]);
			nextArrivalIndex += 1;
		}
	};

	while (completed < ordered.length) {
		enqueueArrivals();

		if (queue.length === 0) {
			const nextArrival = ordered[nextArrivalIndex]?.arrival;
			if (nextArrival === undefined) break;
			appendBlock('IDLE', currentTime, nextArrival);
			currentTime = nextArrival;
			enqueueArrivals();
			continue;
		}

		const current = queue.shift();
		if (!current) continue;
		const remainingBefore = remaining.get(current.pid) ?? 0;
		if (remainingBefore <= 0) continue;

		const runFor = Math.min(q, remainingBefore);
		const start = currentTime;
		const end = currentTime + runFor;
		appendBlock(current.pid, start, end);
		currentTime = end;

		remaining.set(current.pid, remainingBefore - runFor);
		enqueueArrivals();

		if ((remaining.get(current.pid) ?? 0) > 0) {
			queue.push(current);
		} else {
			completion.set(current.pid, currentTime);
			completed += 1;
		}
	}

	const results = processes.map((p) => {
		const ct = completion.get(p.pid) ?? 0;
		const tat = ct - p.arrival;
		const wt = tat - p.burst;
		return {
			pid: p.pid,
			arrival: p.arrival,
			burst: p.burst,
			ct,
			tat,
			wt,
		};
	});

	return { ganttBlocks, results };
}

/* bridge: main.js */
const previousRunSelectedAlgorithmRR = window.runSelectedAlgorithm;
window.runSelectedAlgorithm = function runSelectedAlgorithm(input) {
	if (input.algorithm === 'RR') {
		const mapped = input.processes.map((p) => ({
			pid: p.pid,
			arrival: p.arrival,
			burst: p.burst,
			priority: p.priority,
		}));

		return runRR(mapped, input.quantum);
	}

	if (typeof previousRunSelectedAlgorithmRR === 'function') {
		return previousRunSelectedAlgorithmRR(input);
	}

	throw new Error('No algorithm yet');
};
