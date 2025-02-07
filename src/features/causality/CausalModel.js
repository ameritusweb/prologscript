// CausalModel.js

export class CausalModel {
    constructor(reality) {
        this.reality = reality;
        this.nodes = new Map();
        this.edges = new Map();
        this.interventions = new Map();
        this.counterfactuals = new Map();
    }

    // Node management
    addNode(name, defaultState = null, stateSpace = null) {
        this.nodes.set(name, {
            state: defaultState,
            stateSpace: stateSpace,
            parents: new Set(),
            children: new Set()
        });
    }

    getNode(name) {
        return this.nodes.get(name);
    }

    // Causal relationships
    addCause(cause, effect, mechanism) {
        // Ensure nodes exist
        if (!this.nodes.has(cause)) {
            this.addNode(cause);
        }
        if (!this.nodes.has(effect)) {
            this.addNode(effect);
        }

        // Set up edge
        if (!this.edges.has(cause)) {
            this.edges.set(cause, new Map());
        }
        this.edges.get(cause).set(effect, mechanism);
        
        // Update parent-child relationships
        this.nodes.get(effect).parents.add(cause);
        this.nodes.get(cause).children.add(effect);
    }

    // Interventions
    intervene(node, value) {
        this.interventions.set(node, value);
        this._propagateEffects(node);
        return this.getState(node);
    }

    removeIntervention(node) {
        this.interventions.delete(node);
        this._propagateEffects(node);
    }

    // Counterfactuals
    createCounterfactual(name) {
        const counterfactual = {
            name,
            interventions: new Map(),
            effects: new Map()
        };
        this.counterfactuals.set(name, counterfactual);
        return counterfactual;
    }

    evaluateCounterfactual(name, interventions) {
        // Store original states
        const originalStates = new Map(this.nodes);
        const originalInterventions = new Map(this.interventions);

        // Apply counterfactual interventions
        for (const [node, value] of interventions) {
            this.intervene(node, value);
        }

        // Record effects
        const effects = new Map();
        for (const [node, info] of this.nodes) {
            effects.set(node, this.getState(node));
        }

        // Restore original state
        this.nodes = originalStates;
        this.interventions = originalInterventions;

        return effects;
    }

    // Effect propagation
    _propagateEffects(startNode) {
        const visited = new Set();
        const queue = [startNode];

        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (visited.has(currentNode)) continue;
            visited.add(currentNode);

            const edges = this.edges.get(currentNode);
            if (!edges) continue;

            for (const [childNode, mechanism] of edges) {
                const newState = mechanism(this.getState(currentNode));
                if (newState !== null) {
                    this._updateNodeState(childNode, newState);
                    queue.push(childNode);
                }
            }
        }
    }

    propagateEffects(state) {
        // Update nodes based on external state
        for (const [key, value] of state) {
            if (this.nodes.has(key)) {
                this._updateNodeState(key, value);
            }
        }

        // Propagate effects through the causal network
        for (const node of this.nodes.keys()) {
            if (this.getState(node) !== null) {
                this._propagateEffects(node);
            }
        }
    }

    // State management
    getState(node) {
        // Interventions take precedence
        if (this.interventions.has(node)) {
            return this.interventions.get(node);
        }
        return this.nodes.get(node)?.state ?? null;
    }

    _updateNodeState(node, newState) {
        const nodeInfo = this.nodes.get(node);
        if (!nodeInfo) return;

        // Validate state if stateSpace is defined
        if (nodeInfo.stateSpace && !nodeInfo.stateSpace.includes(newState)) {
            throw new Error(`Invalid state ${newState} for node ${node}`);
        }

        nodeInfo.state = newState;
    }

    // Analysis methods
    findCausalPath(startNode, endNode) {
        const visited = new Set();
        const path = [];
        
        const dfs = (current) => {
            if (current === endNode) {
                return true;
            }
            
            visited.add(current);
            path.push(current);
            
            const edges = this.edges.get(current);
            if (edges) {
                for (const [nextNode] of edges) {
                    if (!visited.has(nextNode)) {
                        if (dfs(nextNode)) {
                            path.push(nextNode);
                            return true;
                        }
                    }
                }
            }
            
            path.pop();
            return false;
        };

        dfs(startNode);
        return path;
    }

    getCausalAncestors(node) {
        const ancestors = new Set();
        const queue = [node];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const nodeInfo = this.nodes.get(current);
            
            if (nodeInfo) {
                for (const parent of nodeInfo.parents) {
                    if (!ancestors.has(parent)) {
                        ancestors.add(parent);
                        queue.push(parent);
                    }
                }
            }
        }
        
        return ancestors;
    }

    getCausalDescendants(node) {
        const descendants = new Set();
        const queue = [node];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const nodeInfo = this.nodes.get(current);
            
            if (nodeInfo) {
                for (const child of nodeInfo.children) {
                    if (!descendants.has(child)) {
                        descendants.add(child);
                        queue.push(child);
                    }
                }
            }
        }
        
        return descendants;
    }

    // Debug and visualization
    toGraph() {
        return {
            nodes: Array.from(this.nodes.entries()).map(([name, info]) => ({
                name,
                state: info.state,
                stateSpace: info.stateSpace
            })),
            edges: Array.from(this.edges.entries()).flatMap(([from, targets]) =>
                Array.from(targets.keys()).map(to => ({
                    from,
                    to
                }))
            )
        };
    }
}