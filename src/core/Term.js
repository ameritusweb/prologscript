// Term.js

export class Term {
    constructor(value) {
        this.value = value;
        this.binding = null;
    }

    _isVariable(term) {
        return (term instanceof Term && term.isVariable()) || 
               (typeof term === 'string' && term.startsWith('$'));
    }

    isList() {
        return Array.isArray(this.value);
    }
}