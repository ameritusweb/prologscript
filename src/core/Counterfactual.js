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
        // Store original states and interventions
        const originalStates = new Map();
        const originalInterventions = new Map(this.reality.causalModel.interventions);

        // Save original states
        for (const [node, info] of this.reality.causalModel.nodes) {
            originalStates.set(node, {
                state: info.state,
                interventions: this.reality.causalModel.interventions.get(node)
            });
        }

        try {
            // Clear existing interventions first
            this.reality.causalModel.interventions.clear();

            // Apply our counterfactual interventions
            for (const [variable, value] of this.interventions) {
                this.reality.causalModel.intervene(variable, value);
            }

            // Record effects after all interventions are applied
            for (const [node, info] of this.reality.causalModel.nodes) {
                this.effects.set(node, this.reality.causalModel.getState(node));
            }
        } finally {
            // Restore original states and interventions
            for (const [node, originalData] of originalStates) {
                const nodeInfo = this.reality.causalModel.nodes.get(node);
                if (nodeInfo) {
                    nodeInfo.state = originalData.state;
                }
            }
            this.reality.causalModel.interventions = new Map(originalInterventions);
        }

        return this;
    }

    getEffect(variable) {
        return this.effects.get(variable);
    }
};