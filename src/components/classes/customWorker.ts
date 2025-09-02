

export class CustomWorker {
  private worker: Worker
  private available: boolean
  private id: number
  constructor(worker: Worker) {
    this.worker = worker
    this.available = true
    this.id = 0
  }

  setAvailable(available: boolean) {
    this.available = available
  }

  setId(id: number) {
    this.id = id
  }

  getAvailable() {
    return this.available
  }

  getId() {
    return this.id
  }
  getWorker() {
    return this.worker
  }
  setWorker(worker: Worker) {
    this.worker = worker
  }
  terminate() {
    this.worker.terminate()
  }
}
