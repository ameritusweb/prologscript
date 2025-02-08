// PrologScript.js - Main Library File

import { Reality } from './Reality.js';
import { Counterfactual } from './Counterfactual.js';
import { UniversalLaws } from './UniversalLaws.js';
import { UnificationContext } from './UnificationContext.js';
import { Term } from './Term.js';
import { Agent } from '../features/agents/Agent.js';
import { WaveFunction } from '../features/math/WaveFunction.js';
import esprima from 'esprima';

class PrologScript {
    constructor() {
        this.realities = new Map();
        this.activeReality = null;
        this.universalLaws = new UniversalLaws();
        this.knowledgeBase = new Map();
        this.rules = new Map();
        this.context = new UnificationContext();
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
        this.predicate('sum', ($X, $Y, $Z) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            const z = this._resolveValue($Z);
            return z === x + y;
        });

        this.predicate('multiply', ($X, $Y, $Z) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            const z = this._resolveValue($Z);
            return z === x * y;
        });

        this.predicate('divide', ($X, $Y, $Z) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            const z = this._resolveValue($Z);
            return y !== 0 && z === x / y;
        });

        // Comparison predicates
        this.predicate('greaterThan', ($X, $Y) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            return x > y;
        });

        this.predicate('lessThan', ($X, $Y) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            return x < y;
        });

        // Mathematical functions
        this.predicate('square', ($X, $Y) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            return y === x * x;
        });

        this.predicate('sqrt', ($X, $Y) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            return x >= 0 && y === Math.sqrt(x);
        });

        this.predicate('power', ($X, $Y, $Z) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            const z = this._resolveValue($Z);
            return z === Math.pow(x, y);
        });

        // Modulo operation
        this.predicate('mod', ($X, $Y, $Z) => {
            const x = this._resolveValue($X);
            const y = this._resolveValue($Y);
            const z = this._resolveValue($Z);
            return y !== 0 && z === x % y;
        });

        // Range constraints
        this.predicate('between', ($X, $Min, $Max) => {
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

    _resolveValue(value) {
        if (typeof value === 'string' && value.startsWith('$')) {
            return this.context.bindings.get(value.slice(1));
        }
        return value;
    }

    // Add constraint to variable
    addConstraint(varName, operator, value) {
        const constraint = new MathConstraint(operator, value);
        this.rules.forEach(rule => {
            if (rule.variables.has(varName)) {
                rule.variables.get(varName).addConstraint(value => constraint.evaluate(value));
            }
        });
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
    solveEquation(equation, variable, range = { min: -1000, max: 1000 }) {
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
    
        const queryKey = `${goal}:${args.join(':')}`;
        const results = new Map();  // Change to Map instead of Set
        this.context = new UnificationContext();
    
        // 1. Direct fact check
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
    
        // 2. Rule-based inference with backtracking
        const findSolution = () => {
            if (this._evaluateGoal(goal, args)) {
                const solution = new Map(this.context.bindings);
                results.set(results.size, solution);
                return true;
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
    
        // Handle different return types based on the query
         // Handle return types
        if (results.size === 0) {
            return false;
        }

        // **NEW: Extract Variables from AST and Store Them in Bindings**
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

        // For verification queries
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
    
            // Rule-based inference
            for (let [ruleHead, ruleBody] of this.rules) {
                if (this._matchesRule(query, args, ruleHead)) {
                    const inferenceResult = this._evaluateRuleBody(ruleBody, args);
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

    _evaluateGoal(goal, args) {
        // Check for predicate as method
        if (typeof this[goal] === 'function') {
            return this[goal](...args);
        }
    
        // Check for rules
        const rules = Array.from(this.rules.entries())
            .filter(([head]) => this._matchesRule(goal, args, head));
    
        if (rules.length > 0) {
            this.context.addChoicePoint(rules.map(([head, body]) => ({
                goal: body,
                args: this._substituteArgs(args, head)
            })));
            
            const [, body] = rules[0];
            return this._evaluateRuleBody(body, args);
        }
    
        return false;
    }

    _evaluateArithmetic(term) {
        const resolved = this._resolveTerm(term);
        if (resolved.isVariable()) return null;
        return typeof resolved.value === 'number' ? resolved.value : null;
    }

    _matchesRule(query, args, ruleHead) {
        // Implement rule matching logic
        // This is a simplified version
        return ruleHead.startsWith(query);
    }

    _evaluateRuleBody(conditions, context) {
        return conditions.every(condition => {
            if (typeof condition === 'function') {
                return condition(context);
            }
            
            const substitutedCondition = this._substituteVariables(condition, context.bindings);
            return this.query(...substitutedCondition.split(':'));
        });
    }

    _substituteVariables(pattern, bindings) {
        return pattern.replace(/\$([A-Z][a-zA-Z0-9]*)/g, (_, varName) => {
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
export { PrologScript, ps };