import * as cluster from 'cluster';
import { CpuInfo, cpus } from 'os';

class Clusters {

  private cpus: CpuInfo[];

  constructor() {
    this.cpus = cpus();
    this.init();
  }

  init(): void {
    if (cluster.isMaster) {

      // Give one proccess forEach CPU
      this.cpus.forEach(() => cluster.fork());

      // On listening
      cluster.on('listening', (worker: cluster.Worker) => {
        console.log('Cluster %d connect', worker.process.pid);
      });

      // On disconnect
      cluster.on('disconnect', (worker: cluster.Worker) => {
        console.log('Cluster %d disconnect', worker.process.pid);
      });

      // On exit, call another proccess
      cluster.on('exit', (worker: cluster.Worker) => {
        console.log('Cluster %d exited', worker.process.pid);

        // Give another proccess
        cluster.fork();
      });

    } else {
      require('./index');
    }
  }

}

export default new Clusters();