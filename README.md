# prologscript

PrologScript is a JavaScript library bringing the power of logic programming to the web and beyond. Inspired by Prolog, it's designed for exploring cause and effect chains, simulating alternate realities, and performing counterfactual reasoning through logical inference.  Beyond basic Prolog, PrologScript integrates features for agent-based simulation, advanced mathematical computations, symbolic AST manipulation, and even wave function modeling.  Imagine exploring "what if" scenarios using structured knowledge, potentially uncovering insights that traditional Large Language Models might initially miss. Dive in to build rule-based systems, explore knowledge from sources like Wikipedia, and unlock a new dimension of logical exploration in JavaScript.

## Features
- 🧠 **Logical Reasoning** - Define facts, rules, and perform logical inference
- 🌎 **Multiple Realities** - Create and manage parallel realities with different rules
- 🔄 **Counterfactual Analysis** - Explore "what-if" scenarios through interventions
- 📊 **Wave Functions** - Handle wave-like behavior and computations
- ⚖️ **Universal Laws** - Define and override physical laws in different realities
- 🌳 **Semantic Relations** - Handle similar terms and concepts
- ⏱️ **Temporal Reasoning** - Model and query time-dependent states

## Installation

```bash
npm install prologscript
```

## Basic Usage

```javascript
import { PrologScript } from 'prologscript';

const ps = new PrologScript();

// Create and switch to a reality
ps.createReality("MainReality");
ps.switchReality("MainReality");
```

## Examples

### 1. Logical Reasoning

```javascript
// Define facts and rules
ps.isA('socrates', 'human');
ps.hasA('human', 'mortality', true);

ps.addRule('mortal:$X',
    'isA:$X:human',
    'hasA:human:mortality:true'
);

// Query
console.log(ps.infer('mortal', 'socrates')); // true
```

### 2. Arithmetic and Variable Binding

```javascript
// Direct computation
console.log(ps.computeAdd(3, 5)); // 8

// Logical queries with variables
const result1 = ps.query("add", 5, 3, "$Result");
console.log(result1.get("Result").value); // 8

// Find missing values
const result2 = ps.query("add", "$X", 3, 8);
console.log(result2.get("X").value); // 5
```

### 3. Multiple Realities with Different Physical Laws

```javascript
// Define a universal law
ps.addUniversalLaw(
    "gravity",
    reality => true,
    state => ({ force: state.mass * 9.81 })
);

// Create Earth reality
ps.createReality("Earth");
ps.switchReality("Earth");
const earthResult = ps.query("gravity", { mass: 1 });
console.log(earthResult.force); // ≈ 9.81

// Create and customize Moon reality
ps.createReality("Moon");
ps.switchReality("Moon");
ps.overrideUniversalLaw(
    "gravity",
    state => ({ force: state.mass * 1.62 })
);
const moonResult = ps.query("gravity", { mass: 1 });
console.log(moonResult.force); // ≈ 1.62
```

### 4. Family Relationships with Recursive Rules

```javascript
// Define relationships
ps.isA('alice', 'person');
ps.isA('bob', 'person');
ps.isA('carol', 'person');
ps.hasA('alice', 'parent', 'bob');
ps.hasA('bob', 'parent', 'carol');

// Define recursive ancestor rule
ps.addRule(
    'ancestor:$X:$Y',            // X is ancestor of Y
    'hasA:$Y:parent:$X'         // Direct parent
);

ps.addRule(
    'ancestor:$X:$Z',            // X is ancestor of Z
    'hasA:$Z:parent:$Y',        // Z has parent Y
    'ancestor:$X:$Y'            // X is ancestor of Y
);

// Query ancestors
console.log(ps.query('ancestor', 'carol', 'alice')); // true
console.log(ps.query('ancestor', '$X', 'alice')); // Lists all ancestors
```

### 5. Counterfactual Reasoning

```javascript
// Define causal relationships
ps.causes('rain', 'wetGrass', rainState => rainState ? 'wet' : 'dry');
ps.causes('sprinkler', 'wetGrass', sprinklerState => sprinklerState ? 'wet' : 'dry');

// Define state spaces
ps.stateSpace('rain', [true, false]);
ps.stateSpace('sprinkler', [true, false]);
ps.stateSpace('wetGrass', ['wet', 'dry']);

// Set actual world state
ps.assert('rain', false);
ps.assert('sprinkler', false);
ps.assert('wetGrass', 'dry');

// Create and compute counterfactual
const cf = ps.createCounterfactual('whatIfRain')
    .intervene('rain', true)
    .compute();

console.log(cf.getEffect('wetGrass')); // 'wet'
```

### 6. Wave Functions

```javascript
// Create a wave
const wave = ps.createWave({
    amplitude: 1,
    frequency: 1,
    phase: 0,
    type: 'sine'
});

// Get value at specific point
console.log(wave.getValue(Math.PI/2)); // ≈ 1

// Find points with specific height
const points = wave.findX(0.5, 0, 2 * Math.PI);
console.log(points); // Points where wave height = 0.5
```

### 7. Temporal Reasoning

```javascript
// Add time steps
ps.addTimeStep(1, new Map([
    ['rain', false],
    ['wetGrass', 'dry']
]));

ps.addTimeStep(2, new Map([
    ['rain', true],
    ['wetGrass', 'wet']
]));

// Query state at specific time
console.log(ps.query('atTime', 2, 'wetGrass', 'wet')); // true
```

### 8. Semantic Relations

```javascript
// Define semantic relationships
ps.addSemanticRelation('mortality', 'mortal');
ps.addSemanticRelation('alive', 'living');
ps.addSemanticRelation('living', 'life');

// Use semantically related terms
ps.hasA('plant', 'alive', true);
ps.addRule('living:$X',
    'hasA:$X:life:true'
);

console.log(ps.infer('living', 'plant')); // true
```
