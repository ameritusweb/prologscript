// UnificationContext.js

import { ChoicePoint } from './ChoicePoint.js';

export class UnificationContext {
    constructor() {
        this.bindings = new Map();
        this.choicePoints = [];
        this.depth = 0;
        this.maxDepth = 100;  // Add maximum depth limit
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

    // Add methods for depth management
    incrementDepth() {
        if (this.depth >= this.maxDepth) {
            throw new Error('Maximum recursion depth exceeded');
        }
        this.depth++;
    }

    decrementDepth() {
        this.depth--;
    }

    // Add method for binding variables
    bind(varName, value) {
        // Remove $ prefix if present
        const name = varName.startsWith('$') ? varName.slice(1) : varName;
        this.bindings.set(name, value);
    }

    // Add method for getting bindings
    getBindings() {
        return new Map(this.bindings);
    }
}