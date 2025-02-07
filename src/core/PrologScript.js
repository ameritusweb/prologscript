// PrologScript.js - Main Library File

import { Reality } from './Reality.js';
import { Variable } from './Variable.js';
import { CausalModel } from '../features/causality/CausalModel.js';
import { Agent } from '../features/agents/Agent.js';
import { WaveFunction } from '../features/math/WaveFunction.js';

class PrologScript {
    constructor() {
        this.realities = new Map();
        this.activeReality = null;
        this.universalLaws = new Map();
        this.knowledgeBase = new Map();
        this.rules = [];
        this.context = new UnificationContext();
        this._initializePredicates();
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
        this.universalLaws.set(name, { condition, mechanism });
        // Apply to all realities
        for (const reality of this.realities.values()) {
            reality.addRule(name, condition, mechanism);
        }
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
            return false;
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

    // Enhanced unification with occurs check
    unify(term1, term2) {
        const t1 = this._resolveTerm(term1);
        const t2 = this._resolveTerm(term2);

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

        if (t1.isList() && t2.isList()) {
            if (t1.value.length !== t2.value.length) return false;
            return t1.value.every((item, index) => 
                this.unify(item, t2.value[index]));
        }

        return t1.value === t2.value;
    }

    // Backtracking query system
    query(goal, ...args) {
        if (!this.activeReality) {
            throw new Error('No active reality');
        }
        
        const results = [];
        this.context = new UnificationContext();

        const findSolution = () => {
            if (this._evaluateGoal(goal, args)) {
                results.push(new Map(this.context.bindings));
                return true;
            }
            return this._backtrack();
        };

        while (findSolution()) {
            // Continue finding solutions
        }

        return results;
    }

    _backtrack() {
        const alternative = this.context.backtrack();
        if (!alternative) return false;
        return this._evaluateGoal(alternative.goal, alternative.args);
    }

    _evaluateGoal(goal, args) {
        const predicate = this.predicates.get(goal);
        if (predicate) {
            return predicate(...args);
        }

        const rules = this.rules.filter(r => r.head === goal);
        if (rules.length > 0) {
            this.context.addChoicePoint(rules.map(r => ({
                goal: r.body,
                args: r.args
            })));
            return this._evaluateGoal(rules[0].body, rules[0].args);
        }

        return false;
    }

    _evaluateArithmetic(term) {
        const resolved = this._resolveTerm(term);
        if (resolved.isVariable()) return null;
        return typeof resolved.value === 'number' ? resolved.value : null;
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

    _bindVariable(var1, var2) {
        if (this._occursCheck(var1, var2)) return false;
        var1.binding = var2;
        this.context.bindings.set(var1.value, var2);
        return true;
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
export { PrologScript, ps };