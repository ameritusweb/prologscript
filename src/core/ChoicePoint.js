// ChoicePoint.js

export class ChoicePoint {
    constructor(alternatives, bindings) {
        this.alternatives = alternatives;
        this.bindings = new Map(bindings);
    }
}