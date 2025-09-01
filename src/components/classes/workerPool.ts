class WorkerPool {
  private poolSize: number
  private workerScript: string
  private workers: Worker[]
  private tasks: {
    data: any
    status: string
    result: any
  }[]
  private taskQueue: string[]
  private initialized: boolean
  private completedTasks: number
  private totalTasks: number
  private startTime: number
  constructor(poolSize: number, workerScript: string) {
    this.poolSize = poolSize;
    this.workerScript = workerScript;
    this.workers = [];
    this.tasks = [];
    this.taskQueue = [];
    this.initialized = false;

    // 统计信息
    this.completedTasks = 0;
    this.totalTasks = 0;
    this.startTime = 0;

    this.init();
  }

  // 初始化Worker池
  init() {
      for (let i = 0; i < this.poolSize; i++) {
          const worker = new Worker(this.workerScript);
          worker.id = i;
          worker.available = true;

          worker.onmessage = (e) => {
              worker.available = true;
              this.completedTasks++;

              // 更新UI
              this.updateProgress();

              // 处理任务结果
              if (e.data && e.data.taskId !== undefined) {
                  this.tasks[e.data.taskId].status = 'completed';
                  this.tasks[e.data.taskId].result = e.data.result;
                  this.updateTaskUI(e.data.taskId);
              }

              // 检查是否有待处理的任务
              this.processNextTask(worker);
          };

          worker.onerror = (e) => {
              console.error(`Worker ${worker.id} 错误:`, e.message);
              worker.available = true;

              if (e.data && e.data.taskId !== undefined) {
                  this.tasks[e.data.taskId].status = 'error';
                  this.updateTaskUI(e.data.taskId);
              }

              this.processNextTask(worker);
          };

          this.workers.push(worker);
      }

      this.initialized = true;
      this.updateWorkerStatusUI();
  }

  // 添加任务到队列
  addTask(taskData, taskId) {
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
          this.executeTask(availableWorker, taskId);
      }
  }

  // 获取可用Worker
  getAvailableWorker() {
      return this.workers.find(worker => worker.available);
  }

  // 执行任务
  executeTask(worker, taskId) {
      worker.available = false;
      this.tasks[taskId].status = 'processing';

      worker.postMessage({
          taskId: taskId,
          data: this.tasks[taskId].data
      });

      this.updateTaskUI(taskId);
      this.updateWorkerStatusUI();
  }

  // 处理下一个任务
  processNextTask(worker) {
      if (this.taskQueue.length > 0) {
          const taskId = this.taskQueue.shift();
          this.executeTask(worker, taskId);
      } else {
          this.updateWorkerStatusUI();

          // 检查所有任务是否完成
          if (this.completedTasks === this.totalTasks) {
              const endTime = performance.now();
              const totalTime = endTime - this.startTime;
              document.getElementById('totalTime').textContent = Math.round(totalTime);
          }
      }
  }

  // 开始处理任务
  start() {
      this.startTime = performance.now();
      this.completedTasks = 0;
      this.processTaskQueue();
  }

  // 更新任务UI
  updateTaskUI(taskId) {
      const taskResults = document.getElementById('taskResults');
      let taskElement = document.getElementById(`task-${taskId}`);

      if (!taskElement) {
          taskElement = document.createElement('div');
          taskElement.id = `task-${taskId}`;
          taskElement.className = 'task-item';
          taskResults.appendChild(taskElement);
      }

      const status = this.tasks[taskId].status;
      const statusClass = status === 'completed' ? 'success' : (status === 'error' ? 'error' : '');

      taskElement.innerHTML = `
          <span>任务 #${taskId} (${status})</span>
          <span class="${statusClass}">${this.tasks[taskId].result || ''}</span>
      `;
  }

  // 更新进度UI
  updateProgress() {
      const progress = document.getElementById('overallProgress');
      const completedElem = document.getElementById('completedTasks');

      const percentage = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 100 : 0;
      progress.style.width = `${percentage}%`;
      completedElem.textContent = `${this.completedTasks}/${this.totalTasks}`;
  }

  // 更新Worker状态UI
  updateWorkerStatusUI() {
      const workerStatus = document.getElementById('workerStatus');
      workerStatus.innerHTML = '';

      this.workers.forEach(worker => {
          const workerElem = document.createElement('div');
          workerElem.className = `worker ${worker.available ? 'worker-idle' : 'worker-busy'}`;

          workerElem.innerHTML = `
              <div class="worker-status-icon ${worker.available ? 'idle' : 'busy'}"></div>
              <div>Worker #${worker.id} (${worker.available ? '空闲' : '忙碌'})</div>
          `;

          workerStatus.appendChild(workerElem);
      });
  }

  // 终止所有Worker
  terminate() {
      this.workers.forEach(worker => {
          worker.terminate();
      });

      this.workers = [];
      this.initialized = false;
  }
}
