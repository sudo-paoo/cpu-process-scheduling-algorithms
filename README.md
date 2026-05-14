# CPU Scheduling Algorithm Simulator

## Overview
A static web app that simulates common CPU scheduling algorithms and visualizes results through dynamic Gantt charts and metric tables.

Video presentation: [https://drive.google.com/drive/folders/1PeCkKCMganw0TNYGHbmdvV34UUQfYu7w?usp=drive_link](https://drive.google.com/file/d/1LversQ96u6QomnmTxXq7XkAyIl0Y7Q0K/view?usp=sharing)

Documentation paper: [docs/FRANCO_KingPaoloD_BSCS3B.pdf](docs/FRANCO_KingPaoloD_BSCS3B.pdf)


Live site: https://sudo-paoo.github.io/cpu-process-scheduling-algorithms/

## Algorithms Implemented
1. First-Come, First-Served (FCFS) — Non-preemptive
2. Shortest Job First (SJF) — Non-preemptive
3. Shortest Remaining Time (SRT) — Preemptive
4. Round Robin (RR) — Preemptive
5. Priority Scheduling — Non-preemptive or Preemptive (user selects)
6. Priority Scheduling with Round Robin — Preemptive

## Features
- Accepts 3 to 10 user-defined processes
- Configurable priority convention (higher or lower value = higher priority)
- Dynamic Gantt chart with idle CPU gap handling
- Per-process Waiting Time (WT) and Turnaround Time (TAT) table
- Average WT and TAT summary metrics
- Runs entirely in the browser — no installation required


## How to Run
Clone the repository and open `index.html` in any modern browser:
 
```bash
git clone https://github.com/sudo-paoo/cpu-process-scheduling-algorithms.git
```
 
## How to Use
1. Enter the number of processes (min 3, max 10)
2. Fill in each process's ID, Arrival Time, Burst Time, and Priority (if applicable)
3. Select a scheduling algorithm from the dropdown
4. Configure any additional settings (time quantum, priority mode/convention)
5. Click **Run Simulation** to view the Gantt chart and results table
## Project Structure
- `index.html` — main simulator entry point
- `assets/css/styles.css` — styling and layout
- `assets/js/main.js` — UI logic and orchestration
- `assets/js/algorithms/` — scheduling algorithm implementations


## Video Demonstration
The video covers:
- Program overview and input demonstration
- Live simulation of all six scheduling algorithms
- Gantt chart and results explanation
- Summary and comparison of algorithm performance
