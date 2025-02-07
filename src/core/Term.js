// Term.js

export class Term {
    constructor(value, ast = null) {
        this.value = value;
        this.binding = null;
        this.ast = ast;
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
            left: left instanceof Term ? { type: "Variable", name: left.value.replace("$", "") } : left,
            right: right instanceof Term ? { type: "Variable", name: right.value.replace("$", "") } : right
        };
    };
    
}