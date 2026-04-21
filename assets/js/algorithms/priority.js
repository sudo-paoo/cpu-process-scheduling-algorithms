function comparePriorityValue(a, b, priorityMode) {
	if (priorityMode === 'higher-higher') {
		return b - a;
	}
	return a - b;
}

function runPriority(processes, priorityMode, preemptionMode) {
	const ordered = [...processes].sort((a, b) => {
		if (a.arrival !== b.arrival) return a.arrival - b.arrival;
		return a.pid.localeCompare(b.pid, undefined, { numeric: true });
	});

	const remaining = new Map(ordered.map((p) => [p.pid, p.burst]));
	const completion = new Map();
	const ganttBlocks = [];

	let currentTime = 0;
	let completed = 0;

	const appendBlock = (pid, start, end) => {
		if (end <= start) return;
		const last = ganttBlocks[ganttBlocks.length - 1];
		if (last && last.pid === pid && last.end === start) {
			last.end = end;
			return;
		}
		ganttBlocks.push({ pid, start, end });
	};

	const selectReady = () => {
		const ready = ordered.filter((p) => p.arrival <= currentTime && (remaining.get(p.pid) ?? 0) > 0);
		if (ready.length === 0) return null;

		ready.sort((a, b) => {
			const byPriority = comparePriorityValue(a.priority, b.priority, priorityMode);
			if (byPriority !== 0) return byPriority;
			if (a.arrival !== b.arrival) return a.arrival - b.arrival;
			return a.pid.localeCompare(b.pid, undefined, { numeric: true });
		});

		return ready[0];
	};

	while (completed < ordered.length) {
		const selected = selectReady();

		if (!selected) {
			const nextArrival = Math.min(
				...ordered
					.filter((p) => (remaining.get(p.pid) ?? 0) > 0)
					.map((p) => p.arrival)
			);
			appendBlock('IDLE', currentTime, nextArrival);
			currentTime = nextArrival;
			continue;
		}

		if (preemptionMode === 'preemptive') {
			appendBlock(selected.pid, currentTime, currentTime + 1);
			currentTime += 1;

			const newRemaining = (remaining.get(selected.pid) ?? 0) - 1;
			remaining.set(selected.pid, newRemaining);
			if (newRemaining === 0) {
				completion.set(selected.pid, currentTime);
				completed += 1;
			}
			continue;
		}

		const runFor = remaining.get(selected.pid) ?? 0;
		appendBlock(selected.pid, currentTime, currentTime + runFor);
		currentTime += runFor;
		remaining.set(selected.pid, 0);
		completion.set(selected.pid, currentTime);
		completed += 1;
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
const previousRunSelectedAlgorithmPriority = window.runSelectedAlgorithm;
window.runSelectedAlgorithm = function runSelectedAlgorithm(input) {
	if (input.algorithm === 'Priority') {
		const mapped = input.processes.map((p) => ({
			pid: p.pid,
			arrival: p.arrival,
			burst: p.burst,
			priority: p.priority,
		}));

		return runPriority(mapped, input.priorityMode, input.preemptionMode);
	}

	if (typeof previousRunSelectedAlgorithmPriority === 'function') {
		return previousRunSelectedAlgorithmPriority(input);
	}

	throw new Error('No algorithm yet');
};
