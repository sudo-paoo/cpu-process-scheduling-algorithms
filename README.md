# CPU Scheduling Algorithm Simulator

## Overview
A static web app that simulates common CPU scheduling algorithms and visualizes results for a set of processes. It simulates how an operating system schedules processes to run on the CPU using six different algorithms, making the scheduling behavior visible through dynamic Gantt charts and metric tables. 

Video demonstration: https://drive.google.com/drive/folders/1PeCkKCMganw0TNYGHbmdvV34UUQfYu7w?usp=drive_link

Documentation paper: [docs/FRANCO_KingPaoloD_BSCS3B.pdf](docs/FRANCO_KingPaoloD_BSCS3B.pdf)

Presentation: https://drive.google.com/file/d/1LversQ96u6QomnmTxXq7XkAyIl0Y7Q0K/view?usp=sharing


Live site: https://sudo-paoo.github.io/cpu-process-scheduling-algorithms/

## Algorithms Implemented
| # | Algorithm | Type |
|---|---|---|
| 1 | First-Come, First-Served (FCFS) | Non-preemptive |
| 2 | Shortest Job First (SJF) | Non-preemptive |
| 3 | Shortest Remaining Time (SRT) | Preemptive |
| 4 | Round Robin (RR) | Preemptive |
| 5 | Priority Scheduling | Non-preemptive and Preemptive (user selects) |
| 6 | Priority Scheduling with Round Robin | Preemptive |

## Features
- Accepts user-defined process parameters (minimum 3, maximum 10 processes)
- Supports configurable priority convention (higher value or lower value means higher priority)
- Dynamic Gantt chart showing execution timeline per process
- Per-process table of Waiting Time (WT) and Turnaround Time (TAT)
- Computed average waiting time and average turnaround time
- Handles idle CPU gaps when no process is ready
- Fully runs in the browser with no installation required

## How to Run
### Option 1 - Open directly in a browser (recommended)
1. Download or clone this repository:

```bash
git clone https://github.com/sudo-paoo/cpu-process-scheduling-algorithms.git
```

2. Open index.html in any modern browser (Chrome, Firefox, Edge):
  - Double-click index.html, or
  - Right-click -> Open with -> your browser

That is it. No server, no dependencies, no installation.

### Option 2 - Run with a local server (optional)
If your browser blocks local file access, you can serve it locally:

Using VS Code Live Server:
- Install the Live Server extension
- Right-click index.html -> Open with Live Server

Using Python:

```bash
# Python 3
python -m http.server 8080

# Then open: http://localhost:8080
```

Using Node.js:

```bash
npx serve .
# Then open the URL shown in your terminal
```

## How to Use the Simulator
1. Enter the number of processes (minimum 3)
2. Fill in the process table; each row represents one process:
  - Process ID (e.g., P1, P2, P3)
  - Arrival Time
  - Burst Time
  - Priority (only required for Priority Scheduling algorithms)
3. Select a scheduling algorithm from the dropdown
4. Configure additional settings if prompted:
  - Time quantum for Round Robin and Priority + RR
  - Priority mode for Priority Scheduling (Non-preemptive or Preemptive)
  - Priority convention (higher value = higher priority, or lower value = higher priority)
5. Click Run Simulation
6. View the Gantt chart and results table below

## Input Parameters
| Parameter | Description | Required For |
|---|---|---|
| Number of Processes | Minimum 3, maximum 10 | All algorithms |
| Process ID | Label for each process (e.g., P1, P2) | All algorithms |
| Arrival Time | Time the process enters the ready queue | All algorithms |
| Burst Time | Total CPU time the process needs | All algorithms |
| Priority | Numeric priority value per process | Priority Scheduling, Priority + RR |
| Time Quantum | Fixed CPU time slice per turn | Round Robin, Priority + RR |
| Priority Convention | Whether higher or lower number = higher priority | Priority Scheduling, Priority + RR |

## Output
For every simulation run, the program produces:

Gantt Chart: a horizontal timeline showing which process occupied the CPU at each time unit, including any idle periods.

Results Table:

| Process | Arrival Time | Burst Time | Completion Time | Turnaround Time (TAT) | Waiting Time (WT) |
|---|---|---|---|---|---|
| P1 | ... | ... | ... | CT - AT | TAT - BT |
| ... | ... | ... | ... | ... | ... |

Summary Metrics:
- Average Waiting Time = Sum of all WT / Number of processes
- Average Turnaround Time = Sum of all TAT / Number of processes

## Project Structure
- index.html - main simulator (open this in your browser)
- assets/css/styles.css - styling and layout
- assets/js/main.js - UI logic and orchestration
- assets/js/algorithms/ - scheduling algorithm implementations


## Video Demonstration
The video covers:
- Program overview and input demonstration
- Live simulation of all six scheduling algorithms
- Gantt chart and results explanation
- Summary and comparison of algorithm performance