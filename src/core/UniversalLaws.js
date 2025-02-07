export class UniversalLaws {
    constructor() {
        this.causalRules = new Map();
        this.constants = new Map();
        this.invariants = new Set();
    }

    addUniversalRule(name, condition, mechanism) {
        this.causalRules.set(name, {
            condition,
            mechanism,
            override: new Map() // Reality-specific overrides
        });
    }

    addConstant(name, value) {
        this.constants.set(name, value);
    }

    addInvariant(predicate) {
        this.invariants.add(predicate);
    }

    // Check if a rule can be overridden in a specific reality
    canOverride(ruleName) {
        return !this.invariants.has(ruleName);
    }
}
