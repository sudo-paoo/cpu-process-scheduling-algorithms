function comparePriorityValuePriorityRR(a, b, priorityMode) {
	// Normalize priority ordering based on user convention.
	if (priorityMode === 'higher-higher') {
		return b - a;
	}
	return a - b;
}

function runPriorityRR(processes, quantum, priorityMode) {
	// Priority queues with round-robin time slicing per priority.
	const q = Number.isFinite(quantum) && quantum > 0 ? Math.floor(quantum) : 1;
	const ordered = [...processes].sort((a, b) => {
		if (a.arrival !== b.arrival) return a.arrival - b.arrival;
		return a.pid.localeCompare(b.pid, undefined, { numeric: true });
	});

	const remaining = new Map(ordered.map((p) => [p.pid, p.burst]));
	const completion = new Map();
	const queueByPriority = new Map();
	const inQueue = new Set();
	const ganttBlocks = [];

	let currentTime = 0;
	let completed = 0;
	let nextArrivalIndex = 0;

	// Coalesce adjacent blocks for the same PID.
	const appendBlock = (pid, start, end) => {
		if (end <= start) return;
		const last = ganttBlocks[ganttBlocks.length - 1];
		if (last && last.pid === pid && last.end === start) {
			last.end = end;
			return;
		}
		ganttBlocks.push({ pid, start, end });
	};

	// Lazily create per-priority queues.
	const getQueue = (priority) => {
		if (!queueByPriority.has(priority)) {
			queueByPriority.set(priority, []);
		}
		return queueByPriority.get(priority);
	};

	// Enqueue arrivals once; inQueue prevents duplicates.
	const enqueueArrivals = () => {
		while (nextArrivalIndex < ordered.length && ordered[nextArrivalIndex].arrival <= currentTime) {
			const process = ordered[nextArrivalIndex];
			if (!inQueue.has(process.pid) && (remaining.get(process.pid) ?? 0) > 0) {
				getQueue(process.priority).push(process);
				inQueue.add(process.pid);
			}
			nextArrivalIndex += 1;
		}
	};

	// Pick highest-priority non-empty queue.
	const pickBestPriority = () => {
		const activePriorities = [];
		queueByPriority.forEach((queue, priority) => {
			if (queue.length > 0) activePriorities.push(priority);
		});

		if (activePriorities.length === 0) return null;

		activePriorities.sort((a, b) => comparePriorityValuePriorityRR(a, b, priorityMode));
		return activePriorities[0];
	};

	// Check if a higher-priority queue is ready to preempt.
	const hasHigherPriorityReady = (priority) => {
		const bestPriority = pickBestPriority();
		if (bestPriority === null) return false;
		return comparePriorityValuePriorityRR(bestPriority, priority, priorityMode) < 0;
	};

	while (completed < ordered.length) {
		enqueueArrivals();

		const activePriority = pickBestPriority();
		if (activePriority === null) {
			const nextArrival = ordered[nextArrivalIndex]?.arrival;
			if (nextArrival === undefined) break;
			appendBlock('IDLE', currentTime, nextArrival);
			currentTime = nextArrival;
			enqueueArrivals();
			continue;
		}

		const queue = getQueue(activePriority);
		const current = queue.shift();
		if (!current) continue;
		inQueue.delete(current.pid);

		const remainingBefore = remaining.get(current.pid) ?? 0;
		if (remainingBefore <= 0) continue;

		let ran = 0;
		const maxSlice = Math.min(q, remainingBefore);

		// Step through the slice to allow higher-priority arrivals to preempt.
		while (ran < maxSlice && (remaining.get(current.pid) ?? 0) > 0) {
			appendBlock(current.pid, currentTime, currentTime + 1);
			currentTime += 1;
			ran += 1;
			remaining.set(current.pid, (remaining.get(current.pid) ?? 0) - 1);

			enqueueArrivals();
			if ((remaining.get(current.pid) ?? 0) > 0 && hasHigherPriorityReady(activePriority)) {
				break;
			}
		}

		if ((remaining.get(current.pid) ?? 0) > 0) {
			getQueue(current.priority).push(current);
			inQueue.add(current.pid);
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
const previousRunSelectedAlgorithmPriorityRR = window.runSelectedAlgorithm;
window.runSelectedAlgorithm = function runSelectedAlgorithm(input) {
	// Chain algorithm handlers in load order.
	if (input.algorithm === 'PriorityRR') {
		const mapped = input.processes.map((p) => ({
			pid: p.pid,
			arrival: p.arrival,
			burst: p.burst,
			priority: p.priority,
		}));

		return runPriorityRR(mapped, input.quantum, input.priorityMode);
	}

	if (typeof previousRunSelectedAlgorithmPriorityRR === 'function') {
		return previousRunSelectedAlgorithmPriorityRR(input);
	}

	throw new Error('No algorithm yet');
};
