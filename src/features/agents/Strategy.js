// Strategy.js

export class Strategy {
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