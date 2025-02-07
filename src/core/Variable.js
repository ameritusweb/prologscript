// Variable.js

export class Variable {
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

// Helper functions for working with variables
export const isVariable = (x) => x instanceof Variable;

export const createVariable = (name) => new Variable(name);

export function unify(term1, term2, context) {
    // If both are variables
    if (isVariable(term1) && isVariable(term2)) {
        if (term1.name === term2.name) return true;
        if (term1.isBound(context)) return unify(term1.getValue(context), term2, context);
        if (term2.isBound(context)) return unify(term1, term2.getValue(context), context);
        return term1.bind(term2, context);
    }

    // If only term1 is a variable
    if (isVariable(term1)) {
        if (term1.occursIn(term2, context)) return false;
        return term1.bind(term2, context);
    }

    // If only term2 is a variable
    if (isVariable(term2)) {
        if (term2.occursIn(term1, context)) return false;
        return term2.bind(term1, context);
    }

    // If both are arrays
    if (Array.isArray(term1) && Array.isArray(term2)) {
        if (term1.length !== term2.length) return false;
        return term1.every((t1, i) => unify(t1, term2[i], context));
    }

    // Otherwise, direct comparison
    return term1 === term2;
}