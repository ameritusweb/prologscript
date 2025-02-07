export class Counterfactual {
    constructor(reality, name) {
        this.reality = reality;
        this.name = name;
        this.interventions = new Map();
        this.effects = new Map();
    }

    intervene(variable, value) {
        this.interventions.set(variable, value);
        return this;
    }

    compute() {
        // Store original states
        const originalStates = new Map();
        for (const [node, info] of this.reality.causalModel.nodes) {
            originalStates.set(node, info.state);
        }

        // Apply interventions
        for (const [variable, value] of this.interventions) {
            this.reality.causalModel.intervene(variable, value);
        }

        // Record effects
        for (const [node, info] of this.reality.causalModel.nodes) {
            this.effects.set(node, info.state);
        }

        // Restore original states
        for (const [node, state] of originalStates) {
            const nodeInfo = this.reality.causalModel.nodes.get(node);
            if (nodeInfo) {
                nodeInfo.state = state;
            }
        }

        return this;
    }

    getEffect(variable) {
        return this.effects.get(variable);
    }
};