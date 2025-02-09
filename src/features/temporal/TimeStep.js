export class TimeStep {
    constructor(timestamp, states) {
        this.timestamp = timestamp;
        this.states = new Map(states);
    }
}