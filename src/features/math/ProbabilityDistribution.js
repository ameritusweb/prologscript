// ProbabilityDistribution.js

export class ProbabilityDistribution {
    constructor(type, params) {
        this.type = type;
        this.params = params;
        this.validateParams();
    }

    sample() {
        switch (this.type) {
            case 'normal':
                return this._sampleNormal();
            case 'uniform':
                return this._sampleUniform();
            case 'exponential':
                return this._sampleExponential();
            case 'poisson':
                return this._samplePoisson();
            case 'bernoulli':
                return this._sampleBernoulli();
            case 'discrete':
                return this._sampleDiscrete();
            case 'gamma':
                return this._sampleGamma();
            case 'beta':
                return this._sampleBeta();
            default:
                throw new Error(`Unknown distribution type: ${this.type}`);
        }
    }

    // Normal distribution using Box-Muller transform
    _sampleNormal() {
        const { mean = 0, stdDev = 1 } = this.params;
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + stdDev * z;
    }

    // Uniform distribution
    _sampleUniform() {
        const { min = 0, max = 1 } = this.params;
        return min + Math.random() * (max - min);
    }

    // Exponential distribution
    _sampleExponential() {
        const { rate = 1 } = this.params;
        return -Math.log(1 - Math.random()) / rate;
    }

    // Poisson distribution using Knuth's algorithm
    _samplePoisson() {
        const { lambda = 1 } = this.params;
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;

        do {
            k++;
            p *= Math.random();
        } while (p > L);

        return k - 1;
    }

    // Bernoulli distribution
    _sampleBernoulli() {
        const { p = 0.5 } = this.params;
        return Math.random() < p ? 1 : 0;
    }

    // Discrete distribution
    _sampleDiscrete() {
        const { values = [], probabilities = [] } = this.params;
        if (values.length !== probabilities.length) {
            throw new Error('Values and probabilities must have same length');
        }

        const r = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < values.length; i++) {
            cumulative += probabilities[i];
            if (r <= cumulative) return values[i];
        }
        
        return values[values.length - 1];
    }

    // Gamma distribution using Marsaglia and Tsang method
    _sampleGamma() {
        const { shape = 1, scale = 1 } = this.params;
        if (shape < 1) {
            const r = this._sampleGamma({ shape: shape + 1, scale }) * Math.pow(Math.random(), 1 / shape);
            return scale * r;
        }

        const d = shape - 1/3;
        const c = 1 / Math.sqrt(9 * d);
        let v, x;
        
        do {
            do {
                x = this._sampleNormal();
                v = 1 + c * x;
            } while (v <= 0);
            
            v = v * v * v;
            const u = Math.random();
            
        } while (
            u > 1 - 0.331 * Math.pow(x, 4) &&
            Math.log(u) > 0.5 * x * x + d * (1 - v + Math.log(v))
        );

        return scale * d * v;
    }

    // Beta distribution using gamma distributions
    _sampleBeta() {
        const { alpha = 1, beta = 1 } = this.params;
        const x = this._sampleGamma({ shape: alpha, scale: 1 });
        const y = this._sampleGamma({ shape: beta, scale: 1 });
        return x / (x + y);
    }

    // Parameter validation
    validateParams() {
        switch (this.type) {
            case 'normal':
                if (this.params.stdDev <= 0) {
                    throw new Error('Standard deviation must be positive');
                }
                break;
            case 'exponential':
                if (this.params.rate <= 0) {
                    throw new Error('Rate must be positive');
                }
                break;
            case 'poisson':
                if (this.params.lambda <= 0) {
                    throw new Error('Lambda must be positive');
                }
                break;
            case 'bernoulli':
                if (this.params.p < 0 || this.params.p > 1) {
                    throw new Error('Probability must be between 0 and 1');
                }
                break;
            case 'discrete':
                if (!Array.isArray(this.params.values) || !Array.isArray(this.params.probabilities)) {
                    throw new Error('Values and probabilities must be arrays');
                }
                const sum = this.params.probabilities.reduce((a, b) => a + b, 0);
                if (Math.abs(sum - 1) > 1e-10) {
                    throw new Error('Probabilities must sum to 1');
                }
                break;
            case 'gamma':
                if (this.params.shape <= 0 || this.params.scale <= 0) {
                    throw new Error('Shape and scale must be positive');
                }
                break;
            case 'beta':
                if (this.params.alpha <= 0 || this.params.beta <= 0) {
                    throw new Error('Alpha and beta must be positive');
                }
                break;
        }
    }

    // Get distribution parameters
    getParams() {
        return { ...this.params };
    }

    // Calculate distribution mean
    getMean() {
        switch (this.type) {
            case 'normal':
                return this.params.mean;
            case 'uniform':
                return (this.params.min + this.params.max) / 2;
            case 'exponential':
                return 1 / this.params.rate;
            case 'poisson':
                return this.params.lambda;
            case 'bernoulli':
                return this.params.p;
            case 'discrete':
                return this.params.values.reduce(
                    (sum, value, i) => sum + value * this.params.probabilities[i],
                    0
                );
            default:
                return null;
        }
    }

    // Create a copy of this distribution
    clone() {
        return new ProbabilityDistribution(
            this.type,
            { ...this.params }
        );
    }

    // Serialization
    toJSON() {
        return {
            type: this.type,
            params: this.params
        };
    }
}