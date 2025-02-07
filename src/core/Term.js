// Term.js

export class Term {
    constructor(value) {
        this.value = value;
        this.binding = null;
    }

    isVariable() {
        return typeof this.value === 'string' && this.value.startsWith('$');
    }

    isList() {
        return Array.isArray(this.value);
    }
}