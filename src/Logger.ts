const LOG_INTERVAL = 100;

class Logger {
    counter: number;

    constructor() {
        this.counter = 0;
    }

    log(msg: string) {
        if (this.counter % LOG_INTERVAL == 0) {
            console.log(this.counter + ": " + msg);
        }
        this.counter++;
    }
}

export { Logger }
