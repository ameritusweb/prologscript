export class WaveFunction {
    constructor(amplitude, frequency, phase = 0, type = 'sine') {
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.phase = phase;
        this.type = type;
    }

    getValue(x) {
        switch (this.type) {
            case 'sine':
                return this.amplitude * Math.sin(this.frequency * x + this.phase);
            case 'cosine':
                return this.amplitude * Math.cos(this.frequency * x + this.phase);
            case 'square':
                return this.amplitude * Math.sign(Math.sin(this.frequency * x + this.phase));
            case 'sawtooth':
                return this.amplitude * ((x % (2 * Math.PI / this.frequency)) / (2 * Math.PI / this.frequency) * 2 - 1);
            default:
                return this.amplitude * Math.sin(this.frequency * x + this.phase);
        }
    }

    findX(y, rangeStart = 0, rangeEnd = 2 * Math.PI, precision = 0.01) {
        const solutions = [];
        for (let x = rangeStart; x <= rangeEnd; x += precision) {
            const currentY = this.getValue(x);
            if (Math.abs(currentY - y) < precision) {
                solutions.push(x);
            }
        }
        return solutions;
    }

    getRelatedPoint(x, distance) {
        return this.getValue(x + distance);
    }
}