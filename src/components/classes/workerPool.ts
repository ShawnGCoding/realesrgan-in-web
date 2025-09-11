/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomWorker } from "./customWorker";
export class WorkerPool {
  private poolSize = navigator.hardwareConcurrency || 8
  private workerScript: string
  private workers: CustomWorker[]
  private tasks: Record<string, {
    data: any
    status: string
    result: any
  }>
  private taskQueue: string[]
  private completedTasks: number
  private totalTasks: number
  private startTime: number
  private onSingleFinish: (result: any) => void
  private onAllFinish: () => void
  constructor(workerScript: string, onSingleFinish: (result: any) => void, onAllFinish: () => void) {
    this.workerScript = workerScript;
    this.workers = [];
    this.tasks = {};
    this.taskQueue = [];

    // 统计信息
    this.completedTasks = 0;
    this.totalTasks = 0;
    this.startTime = 0;
    this.onSingleFinish = onSingleFinish;
    this.onAllFinish = onAllFinish;
    this.init();
  }

  // 初始化Worker池
  init() {
      for (let i = 0; i < this.poolSize; i++) {
          const worker = new CustomWorker(new Worker(new URL(this.workerScript, import.meta.url), {type: 'module'}));
          worker.setId(i);
          worker.setAvailable(true);

          worker.getWorker().onmessage = (e) => {
              worker.setAvailable(true)
              this.completedTasks++;
              this.onSingleFinish(e.data);
              // 更新UI
              // this.updateProgress();

              // 处理任务结果
              if (e.data && e.data.taskId !== undefined) {
                  this.tasks[e.data.taskId].status = 'completed';
                  this.tasks[e.data.taskId].result = e.data.result;
                  this.updateTaskUI(e.data.taskId);
              }

              // 检查是否有待处理的任务
              this.processNextTask(worker);
          };

          worker.getWorker().onerror = (e: any) => {
              console.error(`Worker ${worker.getId()} 错误:`, e.message);
              worker.setAvailable(true);

              if (e.data && e.data.taskId !== undefined) {
                  this.tasks[e.data.taskId].status = 'error';
                  this.updateTaskUI(e.data.taskId);
              }

              this.processNextTask(worker);
          };

          this.workers.push(worker);
      }

      this.updateWorkerStatusUI();
  }

  // 添加任务到队列
  addTask(taskData: any, taskId: string) {
      this.tasks[taskId] = {
          data: taskData,
          status: 'pending',
          result: null
      };

      this.taskQueue.push(taskId);
      this.totalTasks++;

      // 尝试立即执行任务
      this.processTaskQueue();
  }

  // 处理任务队列
  processTaskQueue() {
      const availableWorker = this.getAvailableWorker();

      if (availableWorker && this.taskQueue.length > 0) {
          const taskId = this.taskQueue.shift();
          this.executeTask(availableWorker, taskId!);
      }
  }

  // 获取可用Worker
  getAvailableWorker() {
      return this.workers.find(worker => worker.getAvailable());
  }

  // 执行任务
  executeTask(worker: CustomWorker, taskId: string) {
      worker.setAvailable(false);
      this.tasks[taskId].status = 'processing';

      worker.getWorker().postMessage({
          taskId: taskId,
          data: this.tasks[taskId].data
      });

      this.updateTaskUI(taskId);
      this.updateWorkerStatusUI();
  }

  // 处理下一个任务
  processNextTask(worker: CustomWorker) {
      if (this.taskQueue.length > 0) {
          const taskId = this.taskQueue.shift();
          this.executeTask(worker, taskId!);
      } else {
          this.updateWorkerStatusUI();

          // 检查所有任务是否完成
          if (this.completedTasks === this.totalTasks) {
              const endTime = performance.now();
            const totalTime = endTime - this.startTime;
            console.log(totalTime);
            this.onAllFinish();
            this.terminate();
              // document.getElementById('totalTime').textContent = Math.round(totalTime);
          }
      }
  }

  // 开始处理任务
  start() {
      this.startTime = performance.now();
      this.completedTasks = 0;
      this.processTaskQueue();
  }

  updateTaskUI(taskId: string) {
    console.log(taskId);
      // const taskResults = document.getElementById('taskResults');
      // let taskElement = document.getElementById(`task-${taskId}`);

      // if (!taskElement) {
      //     taskElement = document.createElement('div');
      //     taskElement.id = `task-${taskId}`;
      //     taskElement.className = 'task-item';
      //     taskResults.appendChild(taskElement);
      // }

      // const status = this.tasks[taskId].status;
      // const statusClass = status === 'completed' ? 'success' : (status === 'error' ? 'error' : '');

      // taskElement.innerHTML = `
      //     <span>任务 #${taskId} (${status})</span>
      //     <span class="${statusClass}">${this.tasks[taskId].result || ''}</span>
      // `;
  }

  // 更新进度UI
  updateProgress() {
      // const progress = document.getElementById('overallProgress');
      // const completedElem = document.getElementById('completedTasks');

      // const percentage = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 100 : 0;
      // progress.style.width = `${percentage}%`;
      // completedElem.textContent = `${this.completedTasks}/${this.totalTasks}`;
  }

  // 更新Worker状态UI
  updateWorkerStatusUI() {
      // const workerStatus = document.getElementById('workerStatus');
      // workerStatus.innerHTML = '';

      // this.workers.forEach(worker => {
      //     const workerElem = document.createElement('div');
      //     workerElem.className = `worker ${worker.available ? 'worker-idle' : 'worker-busy'}`;

      //     workerElem.innerHTML = `
      //         <div class="worker-status-icon ${worker.available ? 'idle' : 'busy'}"></div>
      //         <div>Worker #${worker.id} (${worker.available ? '空闲' : '忙碌'})</div>
      //     `;

      //     workerStatus.appendChild(workerElem);
      // });
  }

  // 终止所有Worker
  terminate() {
      this.workers.forEach(worker => {
          worker.terminate();
      });

      this.workers = [];
  }
}
