// Reality.js

import { CausalModel } from '../features/causality/CausalModel.js';
import { TemporalRule } from '../features/temporal/TemporalRule.js';
import { StochasticRule } from '../features/temporal/StochasticRule.js';

export class Reality {
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