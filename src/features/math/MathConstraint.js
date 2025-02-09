export class MathConstraint {
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