(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('esprima')) :
    typeof define === 'function' && define.amd ? define(['exports', 'esprima'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PrologScript = {}, global.esprima));
})(this, (function (exports, esprima) { 'use strict';

    // CausalModel.js

    class CausalModel {
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
            console.log(`CausalModel: Adding cause ${cause} -> ${effect}`);
            
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
            
            // Add the mechanism
            this.edges.get(cause).set(effect, mechanism);
            
            // Update relationships
            this.nodes.get(effect).parents.add(cause);
            this.nodes.get(cause).children.add(effect);
            
            console.log('Current edges:', Array.from(this.edges.entries()));
            console.log('Current nodes:', Array.from(this.nodes.entries()));
        }

        _propagateEffects(startNode) {
            console.log(`Propagating effects from ${startNode}`);
            console.log('Current edges:', Array.from(this.edges.entries()));
            
            const visited = new Set();
            const queue = [startNode];

            while (queue.length > 0) {
                const currentNode = queue.shift();
                if (visited.has(currentNode)) continue;
                visited.add(currentNode);

                const currentState = this.getState(currentNode);
                console.log(`Processing ${currentNode}, state:`, currentState);

                const edges = this.edges.get(currentNode);
                if (!edges) {
                    console.log(`No edges found for ${currentNode}`);
                    continue;
                }

                for (const [childNode, mechanism] of edges) {
                    if (!this.interventions.has(childNode)) {
                        console.log(`Updating ${childNode} based on ${currentNode}`);
                        const newState = mechanism(currentState);
                        console.log(`New state for ${childNode}:`, newState);
                        if (newState !== null) {
                            this._updateNodeState(childNode, newState);
                            queue.push(childNode);
                        }
                    }
                }
            }
        }

        intervene(node, value) {
            console.log(`Intervening on ${node} with value:`, value);
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

        // State management
        getState(node) {
            // First check interventions
            if (this.interventions.has(node)) {
                return this.interventions.get(node);
            }
            
            // Then check node state
            const nodeInfo = this.nodes.get(node);
            return nodeInfo ? nodeInfo.state : null;
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

    // TemporalRule.js

    class TemporalRule {
        constructor(name, timeFn, effectFn) {
            this.name = name;
            this.timeFn = timeFn;
            this.effectFn = effectFn;
            this.history = new Map();
            this.lastEvaluation = null;
            this.evaluationFrequency = 1;  // How often to evaluate (in time units)
        }

        evaluate(time, state) {
            // Check if we need to evaluate based on frequency
            if (this.lastEvaluation !== null && 
                time - this.lastEvaluation < this.evaluationFrequency) {
                return this.history.get(this.lastEvaluation);
            }

            // Calculate time effect
            const timeEffect = this.timeFn(time);

            // Calculate state effect
            const effect = this.effectFn(state, timeEffect);

            // Store in history
            this.history.set(time, effect);
            this.lastEvaluation = time;

            return effect;
        }

        // Get historical effects
        getHistory(startTime, endTime) {
            return Array.from(this.history.entries())
            .filter(([t]) => t >= startTime && t <= endTime)
            .sort(([t1], [t2]) => t1 - t2);   
        }

        // Get effect at specific time
        getEffectAt(time) {
            // If exact time exists in history
            if (this.history.has(time)) {
                return this.history.get(time);
            }

            // Find nearest recorded times
            const times = Array.from(this.history.keys());
            const nearest = times.reduce((prev, curr) => 
                Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev
            );

            return this.history.get(nearest);
        }

        // Set evaluation frequency
        setEvaluationFrequency(frequency) {
            if (frequency <= 0) {
                throw new Error('Frequency must be positive');
            }
            this.evaluationFrequency = frequency;
        }

        // Clear history before a certain time
        clearHistoryBefore(time) {
            for (const t of this.history.keys()) {
                if (t < time) {
                    this.history.delete(t);
                }
            }
        }

        // Get trend analysis
        analyzeTrend(startTime, endTime) {
            const history = this.getHistory(startTime, endTime);
            if (history.length < 2) return null;

            const values = history.map(([_, effect]) => this._extractNumericValue(effect));
            
            return {
                start: values[0],
                end: values[values.length - 1],
                min: Math.min(...values),
                max: Math.max(...values),
                average: values.reduce((a, b) => a + b, 0) / values.length,
                trend: this._calculateTrend(history)
            };
        }

        // Helper method to extract numeric value from effect
        _extractNumericValue(effect) {
            if (typeof effect === 'number') {
                return effect;
            }
            if (typeof effect === 'object') {
                // Take first numeric value found
                for (const value of Object.values(effect)) {
                    if (typeof value === 'number') {
                        return value;
                    }
                }
            }
            return 0;
        }

        // Calculate trend (positive or negative)
        _calculateTrend(history) {
            if (history.length < 2) return 'stable';

            const values = history.map(([_, effect]) => this._extractNumericValue(effect));
            const firstHalf = values.slice(0, Math.floor(values.length / 2));
            const secondHalf = values.slice(Math.floor(values.length / 2));

            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (Math.abs(secondAvg - firstAvg) < 0.001) return 'stable';
            return secondAvg > firstAvg ? 'increasing' : 'decreasing';
        }

        // Interpolate effect between two times
        interpolateEffect(time1, time2, interpolationTime) {
            const effect1 = this.getEffectAt(time1);
            const effect2 = this.getEffectAt(time2);

            if (!effect1 || !effect2) return null;

            const ratio = (interpolationTime - time1) / (time2 - time1);
            
            if (typeof effect1 === 'number' && typeof effect2 === 'number') {
                return effect1 + (effect2 - effect1) * ratio;
            }

            // For object effects, interpolate each numeric property
            const interpolatedEffect = {};
            for (const key in effect1) {
                if (typeof effect1[key] === 'number' && typeof effect2[key] === 'number') {
                    interpolatedEffect[key] = effect1[key] + (effect2[key] - effect1[key]) * ratio;
                }
            }

            return interpolatedEffect;
        }

        // Reset the rule
        reset() {
            this.history.clear();
            this.lastEvaluation = null;
        }

        // Serialization
        toJSON() {
            return {
                name: this.name,
                evaluationFrequency: this.evaluationFrequency,
                history: Array.from(this.history.entries())
            };
        }
    }

    // ProbabilityDistribution.js

    class ProbabilityDistribution {
        constructor(type, params) {
            this.type = type;
            this.params = params;
            this.validateParams();
        }

        sample() {
            switch (this.type) {
                case 'normal':
                    return this._sampleNormal();
                case 'uniform':
                    return this._sampleUniform();
                case 'exponential':
                    return this._sampleExponential();
                case 'poisson':
                    return this._samplePoisson();
                case 'bernoulli':
                    return this._sampleBernoulli();
                case 'discrete':
                    return this._sampleDiscrete();
                case 'gamma':
                    return this._sampleGamma();
                case 'beta':
                    return this._sampleBeta();
                default:
                    throw new Error(`Unknown distribution type: ${this.type}`);
            }
        }

        // Normal distribution using Box-Muller transform
        _sampleNormal() {
            const { mean = 0, stdDev = 1 } = this.params;
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            return mean + stdDev * z;
        }

        // Uniform distribution
        _sampleUniform() {
            const { min = 0, max = 1 } = this.params;
            return min + Math.random() * (max - min);
        }

        // Exponential distribution
        _sampleExponential() {
            const { rate = 1 } = this.params;
            return -Math.log(1 - Math.random()) / rate;
        }

        // Poisson distribution using Knuth's algorithm
        _samplePoisson() {
            const { lambda = 1 } = this.params;
            const L = Math.exp(-lambda);
            let k = 0;
            let p = 1;

            do {
                k++;
                p *= Math.random();
            } while (p > L);

            return k - 1;
        }

        // Bernoulli distribution
        _sampleBernoulli() {
            const { p = 0.5 } = this.params;
            return Math.random() < p ? 1 : 0;
        }

        // Discrete distribution
        _sampleDiscrete() {
            const { values = [], probabilities = [] } = this.params;
            if (values.length !== probabilities.length) {
                throw new Error('Values and probabilities must have same length');
            }

            const r = Math.random();
            let cumulative = 0;
            
            for (let i = 0; i < values.length; i++) {
                cumulative += probabilities[i];
                if (r <= cumulative) return values[i];
            }
            
            return values[values.length - 1];
        }

        // Gamma distribution using Marsaglia and Tsang method
        _sampleGamma() {
            const { shape = 1, scale = 1 } = this.params;
            if (shape < 1) {
                const r = this._sampleGamma({ shape: shape + 1, scale }) * Math.pow(Math.random(), 1 / shape);
                return scale * r;
            }

            const d = shape - 1/3;
            const c = 1 / Math.sqrt(9 * d);
            let v, x;
            
            do {
                do {
                    x = this._sampleNormal();
                    v = 1 + c * x;
                } while (v <= 0);
                
                v = v * v * v;
                
            } while (
                u > 1 - 0.331 * Math.pow(x, 4) &&
                Math.log(u) > 0.5 * x * x + d * (1 - v + Math.log(v))
            );

            return scale * d * v;
        }

        // Beta distribution using gamma distributions
        _sampleBeta() {
            const { alpha = 1, beta = 1 } = this.params;
            const x = this._sampleGamma({ shape: alpha, scale: 1 });
            const y = this._sampleGamma({ shape: beta, scale: 1 });
            return x / (x + y);
        }

        // Parameter validation
        validateParams() {
            switch (this.type) {
                case 'normal':
                    if (this.params.stdDev <= 0) {
                        throw new Error('Standard deviation must be positive');
                    }
                    break;
                case 'exponential':
                    if (this.params.rate <= 0) {
                        throw new Error('Rate must be positive');
                    }
                    break;
                case 'poisson':
                    if (this.params.lambda <= 0) {
                        throw new Error('Lambda must be positive');
                    }
                    break;
                case 'bernoulli':
                    if (this.params.p < 0 || this.params.p > 1) {
                        throw new Error('Probability must be between 0 and 1');
                    }
                    break;
                case 'discrete':
                    if (!Array.isArray(this.params.values) || !Array.isArray(this.params.probabilities)) {
                        throw new Error('Values and probabilities must be arrays');
                    }
                    const sum = this.params.probabilities.reduce((a, b) => a + b, 0);
                    if (Math.abs(sum - 1) > 1e-10) {
                        throw new Error('Probabilities must sum to 1');
                    }
                    break;
                case 'gamma':
                    if (this.params.shape <= 0 || this.params.scale <= 0) {
                        throw new Error('Shape and scale must be positive');
                    }
                    break;
                case 'beta':
                    if (this.params.alpha <= 0 || this.params.beta <= 0) {
                        throw new Error('Alpha and beta must be positive');
                    }
                    break;
            }
        }

        // Get distribution parameters
        getParams() {
            return { ...this.params };
        }

        // Calculate distribution mean
        getMean() {
            switch (this.type) {
                case 'normal':
                    return this.params.mean;
                case 'uniform':
                    return (this.params.min + this.params.max) / 2;
                case 'exponential':
                    return 1 / this.params.rate;
                case 'poisson':
                    return this.params.lambda;
                case 'bernoulli':
                    return this.params.p;
                case 'discrete':
                    return this.params.values.reduce(
                        (sum, value, i) => sum + value * this.params.probabilities[i],
                        0
                    );
                default:
                    return null;
            }
        }

        // Create a copy of this distribution
        clone() {
            return new ProbabilityDistribution(
                this.type,
                { ...this.params }
            );
        }

        // Serialization
        toJSON() {
            return {
                type: this.type,
                params: this.params
            };
        }
    }

    // StochasticRule.js


    class StochasticRule {
        constructor(name, distribution, effectFn) {
            this.name = name;
            this.distribution = this._createDistribution(distribution);
            this.effectFn = effectFn;
            this.samples = new Map();
            this.cache = new Map();
            this.cacheSize = 1000;  // Maximum cache size
        }

        evaluate(state, time = null) {
            // Use cached value if available and time matches
            if (time !== null && this.cache.has(time)) {
                return this.cache.get(time);
            }

            // Generate new sample
            const sample = this.distribution.sample();
            
            // Store sample if time is provided
            if (time !== null) {
                this.samples.set(time, sample);
                // Cache the result
                this._cacheResult(time, sample);
            }

            // Apply effect function with the sample
            return this.effectFn(state, sample);
        }

        // Get historical samples for analysis
        getSamples(startTime = null, endTime = null) {
            if (startTime === null || endTime === null) {
                return Array.from(this.samples.values());
            }
            
            return Array.from(this.samples.entries())
                .filter(([t, _]) => t >= startTime && t <= endTime)
                .map(([_, v]) => v);
        }

        // Get statistics about the rule's behavior
        getStatistics(startTime = null, endTime = null) {
            const samples = this.getSamples(startTime, endTime);
            
            if (samples.length === 0) return null;

            const sum = samples.reduce((a, b) => a + b, 0);
            const mean = sum / samples.length;
            
            const squaredDiffs = samples.map(x => Math.pow(x - mean, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
            
            return {
                count: samples.length,
                mean: mean,
                variance: variance,
                stdDev: Math.sqrt(variance),
                min: Math.min(...samples),
                max: Math.max(...samples)
            };
        }

        // Reset the rule's state
        reset() {
            this.samples.clear();
            this.cache.clear();
        }

        // Private methods
        _createDistribution(config) {
            if (config instanceof ProbabilityDistribution) {
                return config;
            }

            return new ProbabilityDistribution(
                config.type,
                config.params
            );
        }

        _cacheResult(time, result) {
            // Implement LRU caching
            if (this.cache.size >= this.cacheSize) {
                const oldestKey = this.cache.keys().next().value;
                this.cache.delete(oldestKey);
            }
            this.cache.set(time, result);
        }

        // Correlation analysis between this rule and another
        calculateCorrelation(otherRule, timeRange) {
            const samples1 = this.getSamples(timeRange.start, timeRange.end);
            const samples2 = otherRule.getSamples(timeRange.start, timeRange.end);

            if (samples1.length !== samples2.length || samples1.length === 0) {
                return null;
            }

            const mean1 = samples1.reduce((a, b) => a + b, 0) / samples1.length;
            const mean2 = samples2.reduce((a, b) => a + b, 0) / samples2.length;

            const covariance = samples1.reduce((sum, _, i) => 
                sum + (samples1[i] - mean1) * (samples2[i] - mean2), 0
            ) / samples1.length;

            const stdDev1 = Math.sqrt(samples1.reduce((sum, x) => 
                sum + Math.pow(x - mean1, 2), 0
            ) / samples1.length);

            const stdDev2 = Math.sqrt(samples2.reduce((sum, x) => 
                sum + Math.pow(x - mean2, 2), 0
            ) / samples2.length);

            return covariance / (stdDev1 * stdDev2);
        }

        // Serialization
        toJSON() {
            return {
                name: this.name,
                distribution: this.distribution.toJSON(),
                samples: Array.from(this.samples.entries())
            };
        }

        // Create a copy of this rule
        clone() {
            return new StochasticRule(
                this.name,
                this.distribution.clone(),
                this.effectFn
            );
        }
    }

    // Reality.js


    class Reality {
        constructor(name) {
            this.name = name;
            this.facts = new Map();
            this.rules = new Map();
            this.causalModel = new CausalModel(this);
            this.temporalRules = new Map();
            this.stochasticRules = new Map();
            this.currentTime = 0;
            this.timeStep = 1;
            this.state = new Map();
            this.agents = new Map();
            this.history = [];
        }

        // Fact management
        assertTruth(fact, value) {
            this.facts.set(fact, value);
        }

        isTrue(fact) {
            return this.facts.get(fact) === true;
        }

        // Rule management
        addRule(name, condition, effect) {
            this.rules.set(name, { condition, effect });
        }

        addCausalRule(cause, effect, condition, mechanism) {
            this.causalModel.addCause(cause, effect, (state) => {
                return condition(this) ? mechanism(state) : null;
            });
        }

        // Temporal and stochastic rules
        addTemporalRule(name, timeFn, effectFn) {
            const rule = new TemporalRule(name, timeFn, effectFn);
            this.temporalRules.set(name, rule);
        }

        addStochasticRule(name, distribution, effectFn) {
            const rule = new StochasticRule(name, distribution, effectFn);
            this.stochasticRules.set(name, rule);
        }

        // Agent management
        addAgent(agent) {
            this.agents.set(agent.name, agent);
            agent.reality = this;
        }

        getAgent(name) {
            return this.agents.get(name);
        }

        // State management
        setState(key, value) {
            this.state.set(key, value);
        }

        getState(key) {
            return this.state.get(key);
        }

        // Evolution and simulation
        evolve(duration) {
            const timeline = [];
            const endTime = this.currentTime + duration;

            for (let t = this.currentTime; t <= endTime; t += this.timeStep) {
                const timeState = this._evolveStep(t);
                timeline.push(timeState);
                this.history.push(timeState);
            }

            this.currentTime = endTime;
            return timeline;
        }

        _evolveStep(time) {
            const timeState = new Map(this.state);

            // Apply temporal rules
            for (const rule of this.temporalRules.values()) {
                const effect = rule.evaluate(time, timeState);
                this._updateState(timeState, effect);
            }

            // Apply stochastic rules
            for (const rule of this.stochasticRules.values()) {
                const effect = rule.evaluate(timeState, time);
                this._updateState(timeState, effect);
            }

            // Update agents
            for (const agent of this.agents.values()) {
                agent.update(this);
            }

            // Apply causal rules
            this.causalModel.propagateEffects(timeState);

            // Update current state
            this.state = new Map(timeState);

            return {
                time,
                state: new Map(timeState),
                agentStates: this._getAgentStates()
            };
        }

        _updateState(state, effect) {
            if (effect && typeof effect === 'object') {
                for (const [key, value] of Object.entries(effect)) {
                    state.set(key, value);
                }
            }
        }

        _getAgentStates() {
            const agentStates = new Map();
            for (const [name, agent] of this.agents) {
                agentStates.set(name, new Map(agent.state));
            }
            return agentStates;
        }

        // Query methods
        query(predicate, ...args) {
            switch (predicate) {
                case 'isTrue':
                    return this.isTrue(args[0]);
                case 'getState':
                    return this.getState(args[0]);
                case 'agentState':
                    const agent = this.getAgent(args[0]);
                    return agent ? agent.getState(args[1]) : null;
                default:
                    return this._evaluateRule(predicate, args);
            }
        }

        _evaluateRule(ruleName, args) {
            const rule = this.rules.get(ruleName);
            if (!rule) return null;

            if (rule.condition(this, ...args)) {
                return rule.effect(this, ...args);
            }
            return null;
        }

        // History and analysis
        getHistory(startTime = 0, endTime = this.currentTime) {
            return this.history.filter(
                state => state.time >= startTime && state.time <= endTime
            );
        }

        getStateAt(time) {
            const state = this.history.find(s => s.time === time);
            return state ? state.state : null;
        }

        // Serialization
        toJSON() {
            return {
                name: this.name,
                currentTime: this.currentTime,
                facts: Object.fromEntries(this.facts),
                state: Object.fromEntries(this.state),
                agents: Array.from(this.agents.keys())
            };
        }
    }

    class Counterfactual {
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
    }

    class UniversalLaws {
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

    // ChoicePoint.js

    class ChoicePoint {
        constructor(alternatives, bindings) {
            this.alternatives = alternatives;
            this.bindings = new Map(bindings);
        }
    }

    // UnificationContext.js


    class UnificationContext {
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

    // Term.js

    class Term {
        constructor(value, ast = null) {
            this.value = value;
            this.binding = null;
            this.ast = ast;
        }

        isNumber() {
            return typeof this.value === 'number';
        }

        isVariable() {
            return typeof this.value === 'string' && this.value.startsWith('$');
        }

        isList() {
            return Array.isArray(this.value);
        }

        isExpression() {
            return this.ast !== null;
        }

        static createBinaryOp = function (operator, left, right) {
            return {
                type: "BinaryExpression",
                operator: operator,
                left: left instanceof Term ? { type: "Variable", name: typeof left.value !== 'string' ? left.value : left.value.replace("$", "") } : left,
                right: right instanceof Term ? { type: "Variable", name: typeof right.value !== 'string' ? right.value : right.value.replace("$", "") } : right
            };
        };
        
    }

    // Strategy.js

    class Strategy {
        constructor(config = {}) {
            this.type = config.type || 'utility'; // 'utility', 'rule-based', 'learning'
            this.parameters = {
                learningRate: config.learningRate || 0.1,
                explorationRate: config.explorationRate || 0.2,
                discountFactor: config.discountFactor || 0.9,
                ...config.parameters
            };
            this.rules = new Map();
            this.utilityFunctions = new Map();
            this.actionSpace = new Set(config.actions || []);
            this.experienceMemory = [];
            this.maxMemorySize = config.maxMemorySize || 1000;
            
            this._initializeStrategy(config);
        }

        _initializeStrategy(config) {
            switch (this.type) {
                case 'utility':
                    this._initializeUtilityFunctions(config.utilities || {});
                    break;
                case 'rule-based':
                    this._initializeRules(config.rules || []);
                    break;
                case 'learning':
                    this._initializeLearningModel(config.model || {});
                    break;
                default:
                    throw new Error(`Unknown strategy type: ${this.type}`);
            }
        }

        evaluate(context) {
            switch (this.type) {
                case 'utility':
                    return this._evaluateUtility(context);
                case 'rule-based':
                    return this._evaluateRules(context);
                case 'learning':
                    return this._evaluateLearning(context);
                default:
                    throw new Error(`Unknown strategy type: ${this.type}`);
            }
        }

        // Utility-based decision making
        _initializeUtilityFunctions(utilities) {
            for (const [action, func] of Object.entries(utilities)) {
                this.utilityFunctions.set(action, func);
            }
        }

        _evaluateUtility(context) {
            const utilities = new Map();
            
            for (const action of this.actionSpace) {
                const utilityFunc = this.utilityFunctions.get(action);
                if (utilityFunc) {
                    utilities.set(action, utilityFunc(context));
                }
            }

            // Add exploration possibility
            if (Math.random() < this.parameters.explorationRate) {
                const randomAction = this._getRandomAction();
                return {
                    action: randomAction,
                    confidence: 0.5,
                    reason: 'exploration'
                };
            }

            // Find action with maximum utility
            let maxUtility = -Infinity;
            let bestAction = null;

            for (const [action, utility] of utilities) {
                if (utility > maxUtility) {
                    maxUtility = utility;
                    bestAction = action;
                }
            }

            return {
                action: bestAction,
                confidence: this._normalizeUtility(maxUtility),
                reason: 'utility maximization'
            };
        }

        // Rule-based decision making
        _initializeRules(rules) {
            for (const rule of rules) {
                this.addRule(rule.condition, rule.action, rule.priority);
            }
        }

        addRule(condition, action, priority = 1) {
            const ruleId = `rule_${this.rules.size + 1}`;
            this.rules.set(ruleId, {
                condition,
                action,
                priority,
                useCount: 0,
                successRate: 0
            });
        }

        _evaluateRules(context) {
            const applicableRules = [];

            for (const [id, rule] of this.rules) {
                if (rule.condition(context)) {
                    applicableRules.push({ id, ...rule });
                }
            }

            if (applicableRules.length === 0) {
                return this._handleNoRules(context);
            }

            // Sort by priority and success rate
            applicableRules.sort((a, b) => 
                (b.priority * b.successRate) - (a.priority * a.successRate)
            );

            const selectedRule = applicableRules[0];
            return {
                action: selectedRule.action,
                confidence: selectedRule.successRate,
                reason: `rule ${selectedRule.id}`
            };
        }

        // Learning-based decision making
        _initializeLearningModel(model) {
            this.model = {
                weights: new Map(),
                bias: 0,
                ...model
            };
        }

        _evaluateLearning(context) {
            // Use learned model to make decision
            const actionValues = new Map();

            for (const action of this.actionSpace) {
                actionValues.set(action, this._predictValue(context, action));
            }

            // Epsilon-greedy exploration
            if (Math.random() < this.parameters.explorationRate) {
                return {
                    action: this._getRandomAction(),
                    confidence: 0.5,
                    reason: 'exploration'
                };
            }

            // Find best action
            let maxValue = -Infinity;
            let bestAction = null;

            for (const [action, value] of actionValues) {
                if (value > maxValue) {
                    maxValue = value;
                    bestAction = action;
                }
            }

            return {
                action: bestAction,
                confidence: this._normalizeValue(maxValue),
                reason: 'learned policy'
            };
        }

        // Adaptation and learning
        adapt(experience) {
            this._addExperience(experience);
            
            switch (this.type) {
                case 'utility':
                    this._adaptUtilities(experience);
                    break;
                case 'rule-based':
                    this._adaptRules(experience);
                    break;
                case 'learning':
                    this._adaptLearningModel(experience);
                    break;
            }
        }

        _addExperience(experience) {
            this.experienceMemory.push({
                ...experience,
                timestamp: Date.now()
            });

            if (this.experienceMemory.length > this.maxMemorySize) {
                this.experienceMemory.shift();
            }
        }

        _adaptUtilities(experience) {
            const { action, context, outcome } = experience;
            const utilityFunc = this.utilityFunctions.get(action);
            
            if (utilityFunc) {
                // Update utility function based on outcome
                const newUtility = this._updateUtility(utilityFunc, outcome);
                this.utilityFunctions.set(action, newUtility);
            }
        }

        _adaptRules(experience) {
            const { action, success } = experience;
            
            for (const [id, rule] of this.rules) {
                if (rule.action === action) {
                    rule.useCount++;
                    rule.successRate = (rule.successRate * (rule.useCount - 1) + 
                        (success ? 1 : 0)) / rule.useCount;
                }
            }
        }

        _adaptLearningModel(experience) {
            const { context, action, reward } = experience;
            const prediction = this._predictValue(context, action);
            const error = reward - prediction;
            
            // Update weights
            for (const [feature, value] of Object.entries(context)) {
                const currentWeight = this.model.weights.get(feature) || 0;
                this.model.weights.set(
                    feature,
                    currentWeight + this.parameters.learningRate * error * value
                );
            }

            // Update bias
            this.model.bias += this.parameters.learningRate * error;
        }

        // Utility functions
        _getRandomAction() {
            const actions = Array.from(this.actionSpace);
            return actions[Math.floor(Math.random() * actions.length)];
        }

        _normalizeUtility(utility) {
            // Convert utility to confidence score between 0 and 1
            return 1 / (1 + Math.exp(-utility));
        }

        _normalizeValue(value) {
            return this._normalizeUtility(value);
        }

        _predictValue(context, action) {
            let value = this.model.bias;
            
            for (const [feature, weight] of this.model.weights) {
                if (context[feature] !== undefined) {
                    value += weight * context[feature];
                }
            }
            
            return value;
        }

        _handleNoRules(context) {
            // Default behavior when no rules apply
            return {
                action: this._getRandomAction(),
                confidence: 0.1,
                reason: 'default behavior'
            };
        }

        // Serialization
        toJSON() {
            return {
                type: this.type,
                parameters: this.parameters,
                rules: Array.from(this.rules.entries()),
                utilityFunctions: Array.from(this.utilityFunctions.entries()),
                actionSpace: Array.from(this.actionSpace),
                model: this.model
            };
        }

        static fromJSON(json) {
            const strategy = new Strategy({
                type: json.type,
                parameters: json.parameters
            });

            strategy.rules = new Map(json.rules);
            strategy.utilityFunctions = new Map(json.utilityFunctions);
            strategy.actionSpace = new Set(json.actionSpace);
            strategy.model = json.model;

            return strategy;
        }
    }

    // Agent.js

    class Agent {
        constructor(name, strategyConfig = {}) {
            this.name = name;
            this.beliefs = new Map();
            this.goals = new Set();
            this.strategy = new Strategy(strategyConfig);
            this.state = new Map();
            this.history = [];
            this.observers = new Set();
        }

        // Belief management
        addBelief(belief, confidence = 1.0) {
            this.beliefs.set(belief, {
                confidence,
                timestamp: Date.now()
            });
        }

        updateBelief(belief, newConfidence) {
            if (this.beliefs.has(belief)) {
                this.beliefs.set(belief, {
                    confidence: newConfidence,
                    timestamp: Date.now()
                });
            }
        }

        removeBelief(belief) {
            this.beliefs.delete(belief);
        }

        // Goal management
        addGoal(goal, priority = 1) {
            this.goals.add({
                description: goal,
                priority,
                status: 'active'
            });
        }

        updateGoalStatus(goal, status) {
            for (let g of this.goals) {
                if (g.description === goal) {
                    g.status = status;
                    break;
                }
            }
        }

        // Decision making
        decide(context) {
            const decision = this.strategy.evaluate({
                beliefs: this.beliefs,
                goals: this.goals,
                state: this.state,
                context
            });

            this.recordDecision(decision);
            return decision;
        }

        // Action execution
        async act(action, reality) {
            const result = await this.executeAction(action, reality);
            this.updateState(result);
            this.notifyObservers(action, result);
            return result;
        }

        async executeAction(action, reality) {
            // Execute action in reality and return result
            try {
                const outcome = await reality.executeAction(action, this);
                this.history.push({
                    action,
                    outcome,
                    timestamp: Date.now()
                });
                return outcome;
            } catch (error) {
                console.error(`Action execution failed: ${error.message}`);
                return null;
            }
        }

        // State management
        updateState(update) {
            for (const [key, value] of Object.entries(update)) {
                this.state.set(key, value);
            }
        }

        getState(key) {
            return this.state.get(key);
        }

        // Learning and adaptation
        learn(experience) {
            this.strategy.adapt(experience);
            this.updateBeliefs(experience);
        }

        updateBeliefs(experience) {
            // Update beliefs based on experience
            for (const [belief, outcome] of Object.entries(experience.outcomes)) {
                const currentBelief = this.beliefs.get(belief);
                if (currentBelief) {
                    const newConfidence = this.calculateNewConfidence(
                        currentBelief.confidence,
                        outcome
                    );
                    this.updateBelief(belief, newConfidence);
                }
            }
        }

        calculateNewConfidence(oldConfidence, outcome) {
            // Simple Bayesian update
            const learningRate = 0.1;
            return oldConfidence + learningRate * (outcome - oldConfidence);
        }

        // Observer pattern
        addObserver(observer) {
            this.observers.add(observer);
        }

        removeObserver(observer) {
            this.observers.delete(observer);
        }

        notifyObservers(action, result) {
            for (const observer of this.observers) {
                observer.update(this, action, result);
            }
        }

        // History and analysis
        getHistory() {
            return this.history;
        }

        analyzePerformance(metrics = ['success_rate', 'goal_completion']) {
            const analysis = {};
            
            if (metrics.includes('success_rate')) {
                analysis.success_rate = this.calculateSuccessRate();
            }
            
            if (metrics.includes('goal_completion')) {
                analysis.goal_completion = this.calculateGoalCompletion();
            }
            
            return analysis;
        }

        calculateSuccessRate() {
            if (this.history.length === 0) return 0;
            
            const successes = this.history.filter(
                entry => entry.outcome && entry.outcome.success
            ).length;
            
            return successes / this.history.length;
        }

        calculateGoalCompletion() {
            const completedGoals = Array.from(this.goals)
                .filter(goal => goal.status === 'completed').length;
            return this.goals.size > 0 ? completedGoals / this.goals.size : 0;
        }

        // Utility methods
        toString() {
            return `Agent(${this.name})`;
        }

        toJSON() {
            return {
                name: this.name,
                beliefs: Array.from(this.beliefs.entries()),
                goals: Array.from(this.goals),
                state: Array.from(this.state.entries()),
                history: this.history
            };
        }

        static fromJSON(json) {
            const agent = new Agent(json.name);
            
            for (const [belief, data] of json.beliefs) {
                agent.beliefs.set(belief, data);
            }
            
            for (const goal of json.goals) {
                agent.goals.add(goal);
            }
            
            for (const [key, value] of json.state) {
                agent.state.set(key, value);
            }
            
            agent.history = json.history;
            
            return agent;
        }
    }

    class MathConstraint {
        constructor(operator, value) {
            this.operator = operator;
            this.value = value;
        }

        evaluate(x) {
            switch (this.operator) {
                case '>': return x > this.value;
                case '>=': return x >= this.value;
                case '<': return x < this.value;
                case '<=': return x <= this.value;
                case '=': return x === this.value;
                case '!=': return x !== this.value;
                default: return false;
            }
        }
    }

    class WaveFunction {
        constructor(amplitude, frequency, phase = 0, type = 'sine') {
            this.amplitude = amplitude;
            this.frequency = frequency;
            this.phase = phase;
            this.type = type;
        }

        getValue(x) {
            switch (this.type) {
                case 'sine':
                    return this.amplitude * Math.sin(this.frequency * x + this.phase);
                case 'cosine':
                    return this.amplitude * Math.cos(this.frequency * x + this.phase);
                case 'square':
                    return this.amplitude * Math.sign(Math.sin(this.frequency * x + this.phase));
                case 'sawtooth':
                    return this.amplitude * ((x % (2 * Math.PI / this.frequency)) / (2 * Math.PI / this.frequency) * 2 - 1);
                default:
                    return this.amplitude * Math.sin(this.frequency * x + this.phase);
            }
        }

        findX(y, rangeStart = 0, rangeEnd = 2 * Math.PI, precision = 0.01) {
            const solutions = [];
            for (let x = rangeStart; x <= rangeEnd; x += precision) {
                const currentY = this.getValue(x);
                if (Math.abs(currentY - y) < precision) {
                    solutions.push(x);
                }
            }
            return solutions;
        }

        getRelatedPoint(x, distance) {
            return this.getValue(x + distance);
        }
    }

    class TimeStep {
        constructor(timestamp, states) {
            this.timestamp = timestamp;
            this.states = new Map(states);
        }
    }

    // Variable.js

    class Variable {
        constructor(name) {
            this.name = name;
            this.binding = null;
            this.constraints = new Set();
        }

        bind(value, context) {
            // If variable is unbound
            if (this.binding === null) {
                // Check constraints before binding
                if (this._satisfiesConstraints(value)) {
                    // Create binding in context
                    context.bindings.set(this.name, value);
                    this.binding = value;
                    return true;
                }
                return false;
            }
            // If already bound, check if values match
            return this.binding === value;
        }

        addConstraint(constraint) {
            this.constraints.add(constraint);
        }

        _satisfiesConstraints(value) {
            return Array.from(this.constraints).every(constraint => constraint(value));
        }

        unbind(context) {
            context.bindings.delete(this.name);
            this.binding = null;
        }

        getValue(context) {
            return context.bindings.get(this.name) || null;
        }

        isVariable() {
            return true;
        }

        isBound(context) {
            return context.bindings.has(this.name);
        }

        // For pattern matching
        matches(other, context) {
            if (this.isBound(context)) {
                const value = this.getValue(context);
                if (other.isVariable() && other.isBound(context)) {
                    return value === other.getValue(context);
                }
                return value === other;
            }
            // If unbound, bind to other value
            return this.bind(other.isVariable() ? other.getValue(context) : other, context);
        }

        // Occurs check for unification
        occursIn(term, context) {
            if (term.isVariable()) {
                if (term.name === this.name) return true;
                if (term.isBound(context)) {
                    return this.occursIn(term.getValue(context), context);
                }
                return false;
            }
            if (Array.isArray(term)) {
                return term.some(t => this.occursIn(t, context));
            }
            return false;
        }

        // Deep copy for backtracking
        clone() {
            const newVar = new Variable(this.name);
            newVar.constraints = new Set(this.constraints);
            return newVar;
        }

        // Create constraint from predicate
        constrain(predicate) {
            this.addConstraint(value => predicate(value));
            return this;
        }

        // Type constraints
        constrainToType(type) {
            return this.constrain(value => typeof value === type);
        }

        constrainToNumber() {
            return this.constrainToType('number');
        }

        constrainToString() {
            return this.constrainToType('string');
        }

        // Range constraints for numbers
        constrainRange(min, max) {
            return this.constrain(value => 
                typeof value === 'number' && 
                value >= min && 
                value <= max
            );
        }

        // List membership constraint
        constrainToSet(allowedValues) {
            const set = new Set(allowedValues);
            return this.constrain(value => set.has(value));
        }

        // Custom validation
        constrainWithValidation(validator) {
            return this.constrain(validator);
        }

        toString() {
            return `$${this.name}`;
        }

        // For debugging
        inspect() {
            return {
                name: this.name,
                binding: this.binding,
                constraintCount: this.constraints.size
            };
        }
    }

    const createVariable = (name) => new Variable(name);

    // PrologScript.js - Main Library File


    class PrologScript {
        constructor() {
            this.realities = new Map();
            this.activeReality = null;
            this.universalLaws = new UniversalLaws();
            this.knowledgeBase = new Map();
            this.rules = new Map();
            this.context = new UnificationContext();
            this.semanticRelations = new Map();
            this.timeline = [];
            this._initializePredicates();
            this._initializeMathPredicates();
            this._initializeWavePredicates();
            this._initializeUniversalLaws();
            this._initializeCounterfactualPredicates();
        }

        // Reality Management
        createReality(name) {
            const reality = new Reality(name);
            this.realities.set(name, reality);
            if (!this.activeReality) {
                this.activeReality = reality;
            }
            return reality;
        }

        switchReality(name) {
            const reality = this.realities.get(name);
            if (reality) {
                this.activeReality = reality;
                return true;
            }
            return false;
        }

        // Agent Management
        createAgent(name, strategy) {
            if (!this.activeReality) {
                throw new Error('No active reality');
            }
            const agent = new Agent(name, strategy);
            this.activeReality.addAgent(agent);
            return agent;
        }

        // Universal Laws
        addUniversalLaw(name, condition, mechanism) {
            this.universalLaws.addUniversalRule(name, condition, mechanism);

            // Add as a predicate
            this.predicate(name, (state) => {
                if (!this.activeReality) return false;
                
                // Get the universal rule
                const rule = this.universalLaws.causalRules.get(name);
                if (!rule) return false;

                // Check for reality-specific override
                const override = rule.override.get(this.activeReality.name);
                
                if (override && override.condition(this.activeReality)) {
                    // Use override mechanism
                    return override.mechanism(state);
                } else if (rule.condition(this.activeReality)) {
                    // Use default mechanism
                    return rule.mechanism(state);
                }
                
                return false;
            });

            // Apply to all realities
            for (const reality of this.realities.values()) {
                reality.addRule(name, condition, mechanism);
            }
        }

        overrideUniversalLaw(ruleName, newMechanism, condition = null) {
            if (!this.activeReality) {
                throw new Error('No active reality');
            }
        
            // Check if the rule exists and can be overridden
            if (!this.universalLaws.causalRules.has(ruleName)) {
                throw new Error(`Universal rule ${ruleName} not found`);
            }
        
            if (!this.universalLaws.canOverride(ruleName)) {
                throw new Error(`Universal rule ${ruleName} cannot be overridden`);
            }
        
            const rule = this.universalLaws.causalRules.get(ruleName);
            
            // Store the override for this reality
            rule.override.set(this.activeReality.name, {
                mechanism: newMechanism,
                condition: condition || (() => true)
            });
        
            return true;
        }

        // Wave Functions
        createWave(config) {
            return new WaveFunction(
                config.amplitude,
                config.frequency,
                config.phase,
                config.type
            );
        }

        // Simulation
        simulate(steps) {
            if (!this.activeReality) {
                throw new Error('No active reality');
            }
            return this.activeReality.evolve(steps);
        }

         // Enhanced arithmetic with variable support
        computeAdd($X, $Y) {
            const x = typeof $X === 'string' ? this.context.bindings.get($X.slice(1)) : $X;
            const y = typeof $Y === 'string' ? this.context.bindings.get($Y.slice(1)) : $Y;
            return x + y;
        }

        computeSubtract($X, $Y) {
            const x = typeof $X === 'string' ? this.context.bindings.get($X.slice(1)) : $X;
            const y = typeof $Y === 'string' ? this.context.bindings.get($Y.slice(1)) : $Y;
            return x - y;
        }
        // Predicate definition
        predicate(name, func) {
            this[name] = func;
            return true;
        }

        _initializePredicates() {
            // List operations
            this.predicate('cons', ($Head, $Tail, $List) => {
                const head = this._resolveTerm($Head);
                const tail = this._resolveTerm($Tail);
                if (tail.isList()) {
                    return this.unify($List, [head.value, ...tail.value]);
                }
                return false;
            });

            this.predicate('head', ($List, $Head) => {
                const list = this._resolveTerm($List);
                if (list.isList() && list.value.length > 0) {
                    return this.unify($Head, list.value[0]);
                }
                return false;
            });

            this.predicate('tail', ($List, $Tail) => {
                const list = this._resolveTerm($List);
                if (list.isList() && list.value.length > 0) {
                    return this.unify($Tail, list.value.slice(1));
                }
                return false;
            });

            this.predicate('append', ($List1, $List2, $Result) => {
                const list1 = this._resolveTerm($List1);
                const list2 = this._resolveTerm($List2);
                if (list1.isList() && list2.isList()) {
                    return this.unify($Result, [...list1.value, ...list2.value]);
                }
                return false;
            });

            // Arithmetic predicates
            this.predicate('add', ($X, $Y, $Result) => {

                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                
                if (x !== null && y !== null) {
                    return this.unify($Result, x + y);
                }

                const xTerm = this._resolveTerm($X);
                const yTerm = this._resolveTerm($Y);
                const resultTerm = this._resolveTerm($Result);

                // Create an AST for the expression X + Y
                const ast = Term.createBinaryOp('+', xTerm, yTerm);

                // If both X and Y are bound, compute the result but preserve the AST
                if (!xTerm.isVariable() && !yTerm.isVariable()) {
                    const computedValue = xTerm.value + yTerm.value;
                    return this.unify($Result, new Term(computedValue, ast));
                }

                // If Result is bound, solve for X or Y
                if (!resultTerm.isVariable()) {
                    const computedValue = resultTerm.value;
                    
                    // Solve for X if Y is known
                    if (!yTerm.isVariable()) {
                        return this.unify($X, new Term(computedValue - yTerm.value, ast));
                    }

                    // Solve for Y if X is known
                    if (!xTerm.isVariable()) {
                        return this.unify($Y, new Term(computedValue - xTerm.value, ast));
                    }
                }

                this.context.bindings.set("X", xTerm);
                this.context.bindings.set("Y", yTerm);

                const hashAST = ps._hashAST(ast);
                const astTerm = new Term(hashAST, ast);

                this.context.bindings.set(hashAST, astTerm);

                // Otherwise, bind the AST to the result variable
                return this.unify($Result, astTerm);
            });

            this.predicate('subtract', ($X, $Y, $Result) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                if (x !== null && y !== null) {
                    return this.unify($Result, x - y);
                }
                return false;
            });

            this.predicate('multiply', ($X, $Y, $Result) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                if (x !== null && y !== null) {
                    return this.unify($Result, x * y);
                }
                return false;
            });

            this.predicate('divide', ($X, $Y, $Result) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                if (x !== null && y !== null && y !== 0) {
                    return this.unify($Result, x / y);
                }
                return false;
            });

            this.predicate('mod', ($X, $Y, $Result) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                if (x !== null && y !== null && y !== 0) {
                    return this.unify($Result, x % y);
                }
                return false;
            });

            // Comparison predicates
            this.predicate('greater', ($X, $Y) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                return x !== null && y !== null && x > y;
            });

            this.predicate('less', ($X, $Y) => {
                const x = this._evaluateArithmetic($X);
                const y = this._evaluateArithmetic($Y);
                return x !== null && y !== null && x < y;
            });
        }

        _initializeMathPredicates() {
            // Arithmetic operations
            this.predicate('computeSum', ($X, $Y, $Z) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                const z = this._resolveValue($Z);
                return z === x + y;
            });

            this.predicate('computeMultiply', ($X, $Y, $Z) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                const z = this._resolveValue($Z);
                return z === x * y;
            });

            this.predicate('computeDivide', ($X, $Y, $Z) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                const z = this._resolveValue($Z);
                return y !== 0 && z === x / y;
            });

            // Comparison predicates
            this.predicate('computeGreaterThan', ($X, $Y) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                return x > y;
            });

            this.predicate('computeLessThan', ($X, $Y) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                return x < y;
            });

            // Mathematical functions
            this.predicate('computeSquare', ($X, $Y) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                return y === x * x;
            });

            this.predicate('computeSqrt', ($X, $Y) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                return x >= 0 && y === Math.sqrt(x);
            });

            this.predicate('computePower', ($X, $Y, $Z) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                const z = this._resolveValue($Z);
                return z === Math.pow(x, y);
            });

            // Modulo operation
            this.predicate('computeMod', ($X, $Y, $Z) => {
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                const z = this._resolveValue($Z);
                return y !== 0 && z === x % y;
            });

            // Range constraints
            this.predicate('computeBetween', ($X, $Min, $Max) => {
                const x = this._resolveValue($X);
                const min = this._resolveValue($Min);
                const max = this._resolveValue($Max);
                return x >= min && x <= max;
            });

            // Even/Odd predicates
            this.predicate('isEven', ($X) => {
                const x = this._resolveValue($X);
                return x % 2 === 0;
            });

            this.predicate('isOdd', ($X) => {
                const x = this._resolveValue($X);
                return x % 2 === 1;
            });
        }

        _initializeUniversalLaws() {
            // Add fundamental universal laws
            this.universalLaws.addUniversalRule(
                'conservation_of_energy',
                (reality) => !reality.facts.get('energy_conservation_violated'),
                (state, reality) => {
                    // Implementation of energy conservation
                    return state;
                }
            );

            this.universalLaws.addUniversalRule(
                'causality',
                (reality) => !reality.facts.get('causality_violated'),
                (state, reality) => {
                    // Basic causality implementation
                    return state;
                }
            );

            // Add universal constants
            this.universalLaws.addConstant('speed_of_light', 299792458);
            
            // Add invariant rules that cannot be overridden
            this.universalLaws.addInvariant('logical_consistency');
        }

        _initializeWavePredicates() {
            // Define a wave function
            this.predicate('defineWave', (name, amplitude, frequency, phase = 0, type = 'sine') => {
                this.waves.set(name, new WaveFunction(amplitude, frequency, phase, type));
                return true;
            });

            // Get height at point
            this.predicate('waveHeight', (waveName, $X, $Y) => {
                const wave = this.waves.get(waveName);
                if (!wave) return false;
                
                const x = this._resolveValue($X);
                const y = this._resolveValue($Y);
                
                if (y === null) {
                    // Binding Y to the height at X
                    const height = wave.getValue(x);
                    return this._bindVariable($Y, height);
                } else {
                    // Verifying if X,Y lies on the wave
                    return Math.abs(wave.getValue(x) - y) < 0.001;
                }
            });

            // Find points with specific height
            this.predicate('findWavePoints', (waveName, $Y, $Solutions) => {
                const wave = this.waves.get(waveName);
                if (!wave) return false;
                
                const y = this._resolveValue($Y);
                const solutions = wave.findX(y);
                return this._bindVariable($Solutions, solutions);
            });

            // Relate two points on same wave
            this.predicate('relatedPoints', (waveName, $X1, $Y1, $X2, $Y2, distance) => {
                const wave = this.waves.get(waveName);
                if (!wave) return false;

                const x1 = this._resolveValue($X1);
                const y1 = this._resolveValue($Y1);
                const x2 = this._resolveValue($X2);
                const y2 = this._resolveValue($Y2);

                // If X1 and Y1 are known, find X2 and Y2
                if (x1 !== null && y1 !== null) {
                    if (Math.abs(wave.getValue(x1) - y1) > 0.001) return false;
                    
                    const expectedX2 = x1 + distance;
                    const expectedY2 = wave.getRelatedPoint(x1, distance);
                    
                    return this._bindVariable($X2, expectedX2) && 
                           this._bindVariable($Y2, expectedY2);
                }
                
                // If X2 and Y2 are known, find X1 and Y1
                if (x2 !== null && y2 !== null) {
                    if (Math.abs(wave.getValue(x2) - y2) > 0.001) return false;
                    
                    const expectedX1 = x2 - distance;
                    const expectedY1 = wave.getRelatedPoint(x2, -distance);
                    
                    return this._bindVariable($X1, expectedX1) && 
                           this._bindVariable($Y1, expectedY1);
                }

                return false;
            });

            // Find phase difference between points
            this.predicate('phaseDifference', (waveName, $X1, $X2, $Diff) => {
                const wave = this.waves.get(waveName);
                if (!wave) return false;
                
                const x1 = this._resolveValue($X1);
                const x2 = this._resolveValue($X2);
                
                const diff = (x2 - x1) * wave.frequency % (2 * Math.PI);
                return this._bindVariable($Diff, diff);
            });
        }

        _initializeCounterfactualPredicates() {
            // Define causal relationships
            this.predicate('causes', (cause, effect, mechanism) => {
                if (!this.activeReality) return false;
                if (!this.activeReality.causalModel.nodes.has(cause)) {
                    this.activeReality.causalModel.addNode(cause);
                }
                if (!this.activeReality.causalModel.nodes.has(effect)) {
                    this.activeReality.causalModel.addNode(effect);
                }
                this.activeReality.causalModel.addCause(cause, effect, mechanism);
                return true;
            });

            // Define possible states for a variable
            this.predicate('stateSpace', (variable, possibleStates) => {
                if (!this.activeReality) return false;
                if (!this.activeReality.causalModel.nodes.has(variable)) {
                    this.activeReality.causalModel.addNode(variable, null, possibleStates);
                } else {
                    this.activeReality.causalModel.nodes.get(variable).stateSpace = possibleStates;
                }
                return true;
            });

            // Assert actual state
            this.predicate('assert', (variable, state) => {
                if (!this.activeReality) return false;
                if (!this.activeReality.causalModel.nodes.has(variable)) {
                    this.activeReality.causalModel.addNode(variable);
                }
                this.activeReality.causalModel.nodes.get(variable).state = state;

                 // Also add to knowledgeBase
                const key = `${variable}`;
                this.knowledgeBase.set(key, state);

                return true;
            });

            // Counterfactual intervention
            this.predicate('intervene', (variable, state) => {
                if (!this.activeReality) return false;
                this.activeReality.causalModel.intervene(variable, state);
                return true;
            });

            // Query state after intervention
            this.predicate('queryState', (variable, $State) => {
                if (!this.activeReality) return false;
                const state = this.activeReality.causalModel.nodes.get(variable).state;
                return this._bindVariable($State, state);
            });

            // Temporal reasoning
            this.predicate('atTime', (timestamp, variable, state) => {
                const timeStep = this.timeline.find(t => t.timestamp === timestamp);
                if (timeStep) {
                    return timeStep.states.get(variable) === state;
                }
                return false;
            });

            // Counterfactual timeline
            this.predicate('inTimeline', (timeline, variable, $State) => {
                const state = this.timeline
                    .filter(t => t.timeline === timeline)
                    .find(t => t.states.has(variable))
                    ?.states.get(variable);
                return this._bindVariable($State, state);
            });
        }

        // Create a new counterfactual scenario
        createCounterfactual(name) {
            return new Counterfactual(this.activeReality, name);
        }

        // Add temporal state
        addTimeStep(timestamp, states) {
            this.timeline.push(new TimeStep(timestamp, states));
            this.timeline.sort((a, b) => a.timestamp - b.timestamp);
        }

        addSemanticRelation(term1, term2) {
            // Get or create set for term1
            if (!this.semanticRelations.has(term1)) {
                this.semanticRelations.set(term1, new Set());
            }
            // Get or create set for term2
            if (!this.semanticRelations.has(term2)) {
                this.semanticRelations.set(term2, new Set());
            }
            
            // Add bidirectional relationship
            this.semanticRelations.get(term1).add(term2);
            this.semanticRelations.get(term2).add(term1);
        }
        
        areSemanticallySimilar(term1, term2) {
            if (term1 === term2) return true;
            
            // Direct relationship check
            if (this.semanticRelations.has(term1) && 
                this.semanticRelations.get(term1).has(term2)) {
                return true;
            }
        
            // Check transitive relationships (if A->B and B->C, then A->C)
            const visited = new Set();
            const queue = [term1];
        
            while (queue.length > 0) {
                const current = queue.shift();
                if (visited.has(current)) continue;
                visited.add(current);
        
                const related = this.semanticRelations.get(current);
                if (related && related.has(term2)) return true;
        
                if (related) {
                    for (const term of related) {
                        if (!visited.has(term)) {
                            queue.push(term);
                        }
                    }
                }
            }
        
            return false;
        }

        _resolveValue(value) {
            if (typeof value === 'string' && value.startsWith('$')) {
                return this.context.bindings.get(value.slice(1));
            }
            return value;
        }

        // Add constraint to variable
        addConstraint(varName, operator, value) {
            const constraint = new MathConstraint(operator, value);
            // Try to get the variable instance from the context.
            let variable = this.context.bindings.get(varName);
            if (!variable || !(variable instanceof Variable)) {
                // If no Variable instance exists, create one and add it to the context.
                variable = createVariable(varName);
                this.context.bindings.set(varName, variable);
            }
            // Add the constraint to the variable.
            variable.addConstraint(x => constraint.evaluate(x));
            return true;
        }

        // Add mathematical rule
        addMathRule(head, expression) {
            this.addRule(head, (context) => {
                try {
                    return expression(context);
                } catch (e) {
                    return false;
                }
            });
        }

        // Solve mathematical equation
        solveEquation(equation, variable, range = { min: -1e3, max: 1000 }) {
            const solutions = [];
            for (let x = range.min; x <= range.max; x++) {
                this.context.bindings.set(variable, x);
                if (equation(this.context)) {
                    solutions.push(x);
                }
            }
            return solutions;
        }

        // Enhanced unification with occurs check
        unify(term1, term2) {
            const t1 = this._resolveTerm(term1);
            const t2 = this._resolveTerm(term2);

             // Case 1: If both terms are the same object, they are trivially unified
            if (t1 === t2) return true;

            if (t1.isVariable() && t2.isVariable()) {
                if (t1.value === t2.value) return true;
                return this._bindVariable(t1, t2);
            }

            if (t1.isVariable()) {
                return this._bindVariable(t1, t2);
            }

            if (t2.isVariable()) {
                return this._bindVariable(t2, t1);
            }

            // Case 4: If one term is a literal number and the other is an AST,
            // simply bind the AST term to the literal (we already know they are equal)
            if (typeof t1.value === "number" && t2.isExpression()) {
                return this._bindVariable(t2, t1); // Bind AST term to literal
            }
            if (typeof t2.value === "number" && t1.isExpression()) {
                return this._bindVariable(t1, t2); // Bind AST term to literal
            }

            // Case 5: If both terms have an AST, unify their ASTs as well
            if (t1.isExpression() && t2.isExpression()) {
                if (!this._unifyAST(t1.ast, t2.ast)) return false;
            }

            if (t1.isList() && t2.isList()) {
                if (t1.value.length !== t2.value.length) return false;
                return t1.value.every((item, index) => 
                    this.unify(item, t2.value[index]));
            }

            return t1.value === t2.value;
        }

        query(goal, ...args) {
            if (!this.activeReality) {
                throw new Error('No active reality');
            }

            // Handle predefined predicate types (isA, hasA)
            const predicateType = goal.split(':')[0];
            if (['isA', 'hasA'].includes(predicateType)) {
                const result = (() => {
                    switch (predicateType) {
                        case 'isA':
                            return this._queryIsA(args[0], args[1]);
                        case 'hasA':
                            return this._queryHasA(args[0], args[1]);
                    }
                })();

                // Convert result to bindings if variables are present
                if (result && args.some(arg => this._isVariable(arg))) {
                    const bindings = new Map();
                    args.forEach((arg, index) => {
                        if (this._isVariable(arg)) {
                            bindings.set(arg.slice(1), result);
                        }
                    });
                    return bindings;
                }
                return result;
            }
        
            // Handle predicate functions
            if (typeof this[goal] === 'function') {
                this.context.incrementDepth();
                try {
                    const success = this[goal](...args);
                    if (success && this.context.bindings.size > 0) {
                        return this.context.getBindings();
                    }
                    return success;
                } finally {
                    this.context.decrementDepth();
                }
            }
        
            // NEW: Check causal model first
            if (this.activeReality.causalModel.nodes.has(goal)) {
                const node = this.activeReality.causalModel.nodes.get(goal);
                if (args.length === 0) {
                    return node.state;
                }
                // If there are args, create a binding
                if (args.length === 1 && this._isVariable(args[0])) {
                    const results = new Map();
                    const solution = new Map();
                    solution.set(args[0].slice(1), node.state);
                    results.set(0, solution);
                    return solution;
                }
            }
        
            const queryKey = `${goal}:${args.join(':')}`;
            const results = new Map();
            this.context = new UnificationContext();
        
            // Rest of the existing query function...
            // Direct fact check
            for (let [key, value] of this.knowledgeBase) {
                const bindings = this._matchPattern(queryKey, key);
                if (bindings) {
                    if (value instanceof Set) {
                        Array.from(value).forEach(v => {
                            const solution = new Map(bindings);
                            solution.set('result', v);
                            results.set(results.size, solution);
                        });
                    } else {
                        const solution = new Map(bindings);
                        solution.set('result', value);
                        results.set(results.size, solution);
                    }
                }
            }
        
            // Rule-based inference with backtracking
            const findSolution = () => {
                if (this._evaluateGoal(goal, args)) {
                    const solution = new Map(this.context.bindings);
                    if (!this._hasSolution(results, solution)) {  // Only add if it's a new solution
                        results.set(results.size, solution);
                        return true;
                    }
                }
                return this._backtrack();
            };
        
            try {
                this.context.incrementDepth();
                while (findSolution()) {
                    if (results.size >= this.context.maxDepth) {
                        throw new Error('Maximum number of solutions exceeded');
                    }
                }
            } finally {
                this.context.decrementDepth();
            }
        
            if (results.size === 0) {
                return false;
            }
        
            // Extract Variables from AST and Store Them in Bindings
            for (let solution of results.values()) {
                const resultTerm = solution.get('result');
                if (resultTerm instanceof Term && resultTerm.ast) {
                    if (resultTerm.ast.left.isVariable()) {
                        solution.set("X", resultTerm.ast.left);
                    }
                    if (resultTerm.ast.right.isVariable()) {
                        solution.set("Y", resultTerm.ast.right);
                    }
                }
            }
        
            // If query contained variables
            if (args.some(arg => this._isVariable(arg))) {
                return results.size === 1 ? 
                    Array.from(results.values())[0] : 
                    Array.from(results.values());
            }
        
            return true;
        }

        // Core predicates
        isA(entity, category) {
            const key = `isA:${category}`;
            if (!this.knowledgeBase.has(key)) {
                this.knowledgeBase.set(key, new Set());
            }
            this.knowledgeBase.get(key).add(entity);
            return true;
        }

        hasA(entity, property, value) {
            const key = `hasA:${entity}:${property}`;
            this.knowledgeBase.set(key, value);
            return true;
        }

            // Rule definition and inference
            addRule(head, ...body) {
                if (!head) throw new Error('Rule head cannot be empty');
                const ruleKey = typeof head === 'string' ? head : head.toString();
                if (this.rules.has(ruleKey)) {
                    console.warn(`Overwriting existing rule for ${ruleKey}`);
                }
                this.rules.set(ruleKey, body);
            }
        
            infer(query, ...args) {
                // Direct fact check
                const directResult = this.query(query, ...args);
                if (directResult !== null && directResult !== false) {
                    return directResult;
                }

                // Rule-based inference with query term
                for (let [ruleHead, ruleBody] of this.rules) {
                    if (this._matchesRule(query, args, ruleHead)) {
                        const inferenceResult = this._evaluateRuleBody(ruleBody, args, query);  // Pass query
                        if (inferenceResult) {
                            return true;
                        }
                    }
                }

                return false;
            }

            ast(expressionLambda) {
                if (typeof expressionLambda !== "function") {
                    throw new Error("ps.ast() expects a lambda function as input.");
                }
            
                // **Step 1: Convert the function to a string**
                const functionString = expressionLambda.toString();
            
                // **Step 2: Parse the lambda into an AST using Esprima**
                const parsedAST = this._parseLambdaToAST(functionString);
            
                const hashOfParsedAST = this._hashAST(parsedAST);

                // **Step 4: Retrieve the stored AST from bound terms**
                const termForAST = this.context.bindings.get(hashOfParsedAST);
            
                // **Step 5: Compare the Esprima-parsed AST with the stored AST**
                if (!termForAST) {
                    throw new Error("AST mismatch: The parsed AST does not match the stored AST.");
                }
            
                return termForAST.binding; // Return the computed numeric result
            }

            _parseLambdaToAST = function(functionString) {
                // Extract the function body (after `=>`)
                const bodyMatch = functionString.match(/=>\s*(.*)/);
                if (!bodyMatch) {
                    throw new Error("Invalid lambda expression.");
                }
                const expression = bodyMatch[1].trim();
            
                // Use Esprima to parse the expression into an AST
                const ast = esprima.parseScript(expression).body[0].expression;
            
                return this._convertEsprimaAST(ast);
            }

            _standardizeAST = function(ast) {
                 // Recursively remove unnecessary properties and standardize keys
        function cleanAST(obj) {
            if (Array.isArray(obj)) {
                return obj.map(cleanAST);
            } else if (obj !== null && typeof obj === "object") {
                return Object.keys(obj)
                    .sort() // Ensure keys are always in the same order
                    .reduce((acc, key) => {
                        if (key !== "ast" && key !== "binding") { // Remove dynamic properties
                            acc[key] = cleanAST(obj[key]);
                        }
                        return acc;
                    }, {});
            }
            return obj;
        }

        return cleanAST(ast);
            }
            
            _convertEsprimaAST = function(esprimaAST) {
                if (esprimaAST.type === "Literal") {
                    return { type: "Literal", value: esprimaAST.value };
                }
            
                if (esprimaAST.type === "Identifier") {
                    return { type: "Variable", name: esprimaAST.name };
                }
            
                if (esprimaAST.type === "BinaryExpression") {
                    return {
                        type: "BinaryExpression",
                        operator: esprimaAST.operator,
                        left: this._convertEsprimaAST(esprimaAST.left),
                        right: this._convertEsprimaAST(esprimaAST.right)
                    };
                }
            
                // ✅ Handle function calls (e.g., `result.get("X")`)
                if (esprimaAST.type === "CallExpression") {
                    if (
                        esprimaAST.callee.type === "MemberExpression" &&
                        esprimaAST.callee.property.type === "Identifier" &&
                        esprimaAST.callee.property.name === "get"
                    ) {
                        // Extract variable name (e.g., `result.get("X")` → "X")
                        const arg = esprimaAST.arguments[0];
                        if (arg.type === "Literal" && typeof arg.value === "string") {
                            return { type: "Variable", name: arg.value };
                        }
                    }
                }
            
                throw new Error(`Unsupported AST node type: ${esprimaAST.type}`);
            }        

            _hashAST = function(ast) {
                const stdAst = this._standardizeAST(ast);
                const jsonString = JSON.stringify(stdAst);
                let hash = 0;
                for (let i = 0; i < jsonString.length; i++) {
                    hash = (hash << 5) - hash + jsonString.charCodeAt(i);
                    hash |= 0;
                }
                return `AST_${hash.toString(16)}`; // Convert hash to hex
            }

            _compareAST = function(ast1, ast2) {
                return JSON.stringify(ast1) === JSON.stringify(ast2);
            }

            _matchPattern(pattern, fact) {
                const patternParts = pattern.split(':');
                const factParts = fact.split(':');
                
                if (patternParts.length !== factParts.length) return false;
                
                const bindings = new Map();
                
                for (let i = 0; i < patternParts.length; i++) {
                    const patternPart = patternParts[i];
                    const factPart = factParts[i];
                    
                    if (this._isVariable(patternPart)) {
                        const varName = patternPart.slice(1);
                        if (bindings.has(varName)) {
                            if (bindings.get(varName) !== factPart) return false;
                        } else {
                            bindings.set(varName, factPart);
                        }
                    } else if (patternPart !== factPart) {
                        return false;
                    }
                }
                
                return bindings;
            }

            _isVariable(term) {
                return (term instanceof Term && term.isVariable()) || 
                       (typeof term === 'string' && term.startsWith('$'));
            }

        _queryIsA(entity, category) {
            const key = `isA:${category}`;
            return this.knowledgeBase.has(key) && 
                   this.knowledgeBase.get(key).has(entity);
        }

        _queryHasA(entity, property) {
            const key = `hasA:${entity}:${property}`;
            return this.knowledgeBase.has(key) ? 
                   this.knowledgeBase.get(key) : null;
        }

        _backtrack() {
            const alternative = this.context.backtrack();
            if (!alternative) return false;
            return this._evaluateGoal(alternative.goal, alternative.args);
        }

        _hasSolution(results, newSolution) {
            for (const existing of results.values()) {
                if (this._solutionsEqual(existing, newSolution)) {
                    return true;
                }
            }
            return false;
        }
        
        _solutionsEqual(sol1, sol2) {
            if (sol1.size !== sol2.size) return false;
            for (const [key, val1] of sol1) {
                const val2 = sol2.get(key);
                if (val1 !== val2) return false;
            }
            return true;
        }

        _evaluateGoal(goal, args) {
            console.log('\n_evaluateGoal:', { goal, args });

            // Check for predicate as method
            if (typeof this[goal] === 'function') {
                return this[goal](...args);
            }

            // Check for rules
            const rules = Array.from(this.rules.entries())
                .filter(([head]) => this._matchesRule(goal, args, head));

            if (rules.length > 0) {
                // Try each rule
                for (const [head, body] of rules) {
                    console.log('\nTrying rule:', head, 'with body:', body);
                    
                    const bindings = this._substituteArgs(args, head);
                    console.log('Initial bindings:', Array.from(bindings.entries()));

                    // If it's a multi-condition rule
                    if (Array.isArray(body)) {
                        // Get first condition result and its bindings
                        const [firstCondition, ...restConditions] = body;
                        console.log('Evaluating first condition:', firstCondition);
                        
                        if (this._evaluateRuleBody([firstCondition], bindings, goal)) {
                            console.log('First condition succeeded, bindings:', Array.from(bindings.entries()));
                            
                            // Use those bindings for next conditions
                            if (this._evaluateRuleBody(restConditions, bindings, goal)) {
                                return true;
                            }
                        }
                    } else {
                        if (this._evaluateRuleBody([body], bindings, goal)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        _substituteArgs(queryArgs, ruleHead) {
            const headParts = ruleHead.split(':');  // ['mortal', '$X']
            const variables = headParts.slice(1);    // ['$X']
            
            const bindings = new Map();
            variables.forEach((variable, index) => {
                if (index < queryArgs.length) {
                    // Store without $ prefix
                    const varName = variable.startsWith('$') ? variable.slice(1) : variable;
                    bindings.set(varName, queryArgs[index]);
                }
            });
            
            return bindings;
        }

        _evaluateArithmetic(term) {
            const resolved = this._resolveTerm(term);
            if (resolved.isVariable()) return null;
            return typeof resolved.value === 'number' ? resolved.value : null;
        }

        _matchesRule(query, args, ruleHead) {
            const [ruleName] = ruleHead.split(':');
            return ruleName === query;
        }

        _evaluateRuleBody(conditions, args, queryTerm) {  // Accept queryTerm parameter
            const bindings = (args instanceof Map) ? args : this._substituteArgs(args, conditions[0]);

            // Merge the local bindings into the overall context so that condition functions see them.
            const context = this.context;
            bindings.forEach((value, key) => {
                if (!(typeof value === 'string') || !value.startsWith('$')) {
                    context.bindings.set(key, value);
                }
                else if (!context.bindings.has(key))
                {
                    context.bindings.set(key, value);
                }
            });

            console.log('\n_evaluateRuleBody:', {
                conditions,
                bindings: Array.from(bindings.entries()),
                queryTerm
            });

            return conditions.every(condition => {
                console.log('\nEvaluating condition:', condition);
                if (typeof condition === 'function') {
                    return condition(context);
                }
                
                const substitutedCondition = this._substituteVariables(condition, bindings);
                console.log('After variable substitution:', substitutedCondition);

                const parts = substitutedCondition.split(':');
                console.log('Parts:', parts);
                console.log('Original query term:', queryTerm);

                // For isA predicates
                if (parts[0] === 'isA') {
                    const key = `isA:${parts[2]}`;
                    const set = this.knowledgeBase.get(key);
                    return set && set.has(parts[1]);
                }

                // For hasA predicates
                if (parts[0] === 'hasA') {
                    const entity = parts[1];
                    const requestedProp = parts[2];
                    const expectedValue = parts[3];

                    // First, try a direct lookup.
                    let key = `hasA:${entity}:${requestedProp}`;
                    console.log('Looking up fact:', key);
                    let value = this.knowledgeBase.get(key);
                    console.log('Direct lookup value:', value);

                    // If not found, search through all properties for the entity.
                    if (value === undefined) {
                        const prefix = `hasA:${entity}:`;
                        for (const factKey of this.knowledgeBase.keys()) {
                            if (factKey.startsWith(prefix)) {
                                const storedProp = factKey.split(':')[2];
                                if (this.areSemanticallySimilar(storedProp, requestedProp)) {
                                    value = this.knowledgeBase.get(factKey);
                                    console.log(`Found semantically similar fact: ${factKey} ->`, value);
                                    break;
                                }
                            }
                        }
                    }
                    
                    console.log('Final value to compare:', value);
                    if (value !== undefined) {
                        // If the value is a boolean, compare against the expected boolean.
                        if (typeof value === 'boolean') {
                            if (expectedValue && !expectedValue.startsWith('$')) {
                                return value === (expectedValue === 'true');
                            }
                            return true;
                        }
                        // For non-boolean values, if we're looking for a specific value, compare them.
                        if (expectedValue && !expectedValue.startsWith('$')) {
                            return this.areSemanticallySimilar(value, expectedValue);
                        }
                        // If we have a variable in the expected position, bind it.
                        if (expectedValue && expectedValue.startsWith('$')) {
                            const varName = expectedValue.slice(1);
                            bindings.set(varName, value);
                            return true;
                        }
                        return true;
                    }
                    return false;
                }

                // Handle recursive ancestor query
                if (parts[0] === 'ancestor') {
                    console.log('Recursive ancestor query:', parts);
                    const recursiveResult = this.query(...parts);
                    console.log('Recursive result:', recursiveResult);
                    return recursiveResult;
                }

                return false;
            });
        }    

        _substituteVariables(pattern, bindings) {
            console.log('Pattern:', pattern);
            console.log('Bindings:', bindings);
            console.log('Bindings type:', bindings instanceof Map);
            if (bindings instanceof Map) {
                console.log('Bindings contents:', Array.from(bindings.entries()));
            }
            
            return pattern.replace(/\$([A-Z][a-zA-Z0-9]*)/g, (_, varName) => {
                console.log('Found variable:', varName);
                console.log('Binding value:', bindings.get(varName));
                return bindings.get(varName) || `$${varName}`;
            });
        }

        _resolveTerm(term) {
            if (term instanceof Term) {
                if (term.isVariable() && term.binding) {
                    return this._resolveTerm(term.binding);
                }
                return term;
            }
            return new Term(term);
        }

        _bindVariable(variable, value) {

            // Case 1: Variable is a Term instance
            if (variable instanceof Term) {
                if (this._occursCheck(variable, value)) return false;
                variable.binding = value;
                if (typeof variable.value === "string" && variable.value.startsWith("$")) {
                    const varName = variable.value.slice(1);
                    this.context.bindings.set(varName, value);
                }
                return true;
            }
            
            // Case 2: Variable is a string
            if (typeof variable === 'string' && variable.startsWith('$')) {
                const varName = variable.slice(1);
                this.context.bindings.set(varName, value);
                return true;
            }
            
            // Direct value comparison
            return variable === value;
        }

        _occursCheck(variable, term) {
            if (term.isVariable()) {
                return variable.value === term.value;
            }
            if (term.isList()) {
                return term.value.some(item => this._occursCheck(variable, this._resolveTerm(item)));
            }
            return false;
        }
    }

    // Export both class and singleton instance
    const ps = new PrologScript();

    exports.PrologScript = PrologScript;
    exports.ps = ps;

}));
