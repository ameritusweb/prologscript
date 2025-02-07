// UnificationContext.js

import { ChoicePoint } from './ChoicePoint.js';

export class UnificationContext {
    constructor() {
        this.bindings = new Map();
        this.choicePoints = [];
    }

    addChoicePoint(alternatives) {
        this.choicePoints.push(new ChoicePoint(alternatives, this.bindings));
    }

    backtrack() {
        if (this.choicePoints.length === 0) return false;
        const choice = this.choicePoints.pop();
        this.bindings = new Map(choice.bindings);
        return choice.alternatives.length > 0 ? choice.alternatives.pop() : null;
    }
}