// TemporalRule.js

export class TemporalRule {
    constructor(name, timeFn, effectFn) {
        this.name = name;
        this.timeFn = timeFn;
        this.effectFn = effectFn;
        this.history = new Map();
        this.lastEvaluation = null;
        this.evaluationFrequency = 1;  // How often to evaluate (in time units)
    }

    evaluate(time, state) {
        // Check if we need to evaluate based on frequency
        if (this.lastEvaluation !== null && 
            time - this.lastEvaluation < this.evaluationFrequency) {
            return this.history.get(this.lastEvaluation);
        }

        // Calculate time effect
        const timeEffect = this.timeFn(time);

        // Calculate state effect
        const effect = this.effectFn(state, timeEffect);

        // Store in history
        this.history.set(time, effect);
        this.lastEvaluation = time;

        return effect;
    }

    // Get historical effects
    getHistory(startTime, endTime) {
        return Array.from(this.history.entries())
            .filter(([t, _]) => t >= startTime && t <= endTime)
            .sort(([t1, _], [t2, _]) => t1 - t2);
    }

    // Get effect at specific time
    getEffectAt(time) {
        // If exact time exists in history
        if (this.history.has(time)) {
            return this.history.get(time);
        }

        // Find nearest recorded times
        const times = Array.from(this.history.keys());
        const nearest = times.reduce((prev, curr) => 
            Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev
        );

        return this.history.get(nearest);
    }

    // Set evaluation frequency
    setEvaluationFrequency(frequency) {
        if (frequency <= 0) {
            throw new Error('Frequency must be positive');
        }
        this.evaluationFrequency = frequency;
    }

    // Clear history before a certain time
    clearHistoryBefore(time) {
        for (const t of this.history.keys()) {
            if (t < time) {
                this.history.delete(t);
            }
        }
    }

    // Get trend analysis
    analyzeTrend(startTime, endTime) {
        const history = this.getHistory(startTime, endTime);
        if (history.length < 2) return null;

        const values = history.map(([_, effect]) => this._extractNumericValue(effect));
        
        return {
            start: values[0],
            end: values[values.length - 1],
            min: Math.min(...values),
            max: Math.max(...values),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            trend: this._calculateTrend(history)
        };
    }

    // Helper method to extract numeric value from effect
    _extractNumericValue(effect) {
        if (typeof effect === 'number') {
            return effect;
        }
        if (typeof effect === 'object') {
            // Take first numeric value found
            for (const value of Object.values(effect)) {
                if (typeof value === 'number') {
                    return value;
                }
            }
        }
        return 0;
    }

    // Calculate trend (positive or negative)
    _calculateTrend(history) {
        if (history.length < 2) return 'stable';

        const values = history.map(([_, effect]) => this._extractNumericValue(effect));
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (Math.abs(secondAvg - firstAvg) < 0.001) return 'stable';
        return secondAvg > firstAvg ? 'increasing' : 'decreasing';
    }

    // Interpolate effect between two times
    interpolateEffect(time1, time2, interpolationTime) {
        const effect1 = this.getEffectAt(time1);
        const effect2 = this.getEffectAt(time2);

        if (!effect1 || !effect2) return null;

        const ratio = (interpolationTime - time1) / (time2 - time1);
        
        if (typeof effect1 === 'number' && typeof effect2 === 'number') {
            return effect1 + (effect2 - effect1) * ratio;
        }

        // For object effects, interpolate each numeric property
        const interpolatedEffect = {};
        for (const key in effect1) {
            if (typeof effect1[key] === 'number' && typeof effect2[key] === 'number') {
                interpolatedEffect[key] = effect1[key] + (effect2[key] - effect1[key]) * ratio;
            }
        }

        return interpolatedEffect;
    }

    // Reset the rule
    reset() {
        this.history.clear();
        this.lastEvaluation = null;
    }

    // Serialization
    toJSON() {
        return {
            name: this.name,
            evaluationFrequency: this.evaluationFrequency,
            history: Array.from(this.history.entries())
        };
    }
}