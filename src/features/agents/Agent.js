// Agent.js
import { Strategy } from './Strategy.js';

export class Agent {
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