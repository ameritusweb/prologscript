// StochasticRule.js

import { ProbabilityDistribution } from '../math/ProbabilityDistribution.js';

export class StochasticRule {
    constructor(name, distribution, effectFn) {
        this.name = name;
        this.distribution = this._createDistribution(distribution);
        this.effectFn = effectFn;
        this.samples = new Map();
        this.cache = new Map();
        this.cacheSize = 1000;  // Maximum cache size
    }

    evaluate(state, time = null) {
        // Use cached value if available and time matches
        if (time !== null && this.cache.has(time)) {
            return this.cache.get(time);
        }

        // Generate new sample
        const sample = this.distribution.sample();
        
        // Store sample if time is provided
        if (time !== null) {
            this.samples.set(time, sample);
            // Cache the result
            this._cacheResult(time, sample);
        }

        // Apply effect function with the sample
        return this.effectFn(state, sample);
    }

    // Get historical samples for analysis
    getSamples(startTime = null, endTime = null) {
        if (startTime === null || endTime === null) {
            return Array.from(this.samples.values());
        }
        
        return Array.from(this.samples.entries())
            .filter(([t, _]) => t >= startTime && t <= endTime)
            .map(([_, v]) => v);
    }

    // Get statistics about the rule's behavior
    getStatistics(startTime = null, endTime = null) {
        const samples = this.getSamples(startTime, endTime);
        
        if (samples.length === 0) return null;

        const sum = samples.reduce((a, b) => a + b, 0);
        const mean = sum / samples.length;
        
        const squaredDiffs = samples.map(x => Math.pow(x - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
        
        return {
            count: samples.length,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance),
            min: Math.min(...samples),
            max: Math.max(...samples)
        };
    }

    // Reset the rule's state
    reset() {
        this.samples.clear();
        this.cache.clear();
    }

    // Private methods
    _createDistribution(config) {
        if (config instanceof ProbabilityDistribution) {
            return config;
        }

        return new ProbabilityDistribution(
            config.type,
            config.params
        );
    }

    _cacheResult(time, result) {
        // Implement LRU caching
        if (this.cache.size >= this.cacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(time, result);
    }

    // Correlation analysis between this rule and another
    calculateCorrelation(otherRule, timeRange) {
        const samples1 = this.getSamples(timeRange.start, timeRange.end);
        const samples2 = otherRule.getSamples(timeRange.start, timeRange.end);

        if (samples1.length !== samples2.length || samples1.length === 0) {
            return null;
        }

        const mean1 = samples1.reduce((a, b) => a + b, 0) / samples1.length;
        const mean2 = samples2.reduce((a, b) => a + b, 0) / samples2.length;

        const covariance = samples1.reduce((sum, _, i) => 
            sum + (samples1[i] - mean1) * (samples2[i] - mean2), 0
        ) / samples1.length;

        const stdDev1 = Math.sqrt(samples1.reduce((sum, x) => 
            sum + Math.pow(x - mean1, 2), 0
        ) / samples1.length);

        const stdDev2 = Math.sqrt(samples2.reduce((sum, x) => 
            sum + Math.pow(x - mean2, 2), 0
        ) / samples2.length);

        return covariance / (stdDev1 * stdDev2);
    }

    // Serialization
    toJSON() {
        return {
            name: this.name,
            distribution: this.distribution.toJSON(),
            samples: Array.from(this.samples.entries())
        };
    }

    // Create a copy of this rule
    clone() {
        return new StochasticRule(
            this.name,
            this.distribution.clone(),
            this.effectFn
        );
    }
}