"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const os_1 = require("os");
class Clusters {
    constructor() {
        this.cpus = os_1.cpus();
        this.init();
    }
    init() {
        if (cluster.isMaster) {
            // Give one proccess forEach CPU
            this.cpus.forEach(() => cluster.fork());
            // On listening
            cluster.on('listening', (worker) => {
                console.log('Cluster %d connect', worker.process.pid);
            });
            // On disconnect
            cluster.on('disconnect', (worker) => {
                console.log('Cluster %d disconnect', worker.process.pid);
            });
            // On exit, call another proccess
            cluster.on('exit', (worker) => {
                console.log('Cluster %d exited', worker.process.pid);
                // Give another proccess
                cluster.fork();
            });
        }
        else {
            require('./index');
        }
    }
}
exports.default = new Clusters();
