import { PrologScript } from "./src/core/PrologScript.js";

// Initialize the PrologScript class
const ps = new PrologScript();
console.log("PrologScript initialized!");

ps.createReality("Debug");
ps.switchReality("Debug");

// Define causal relationships
ps.causes('rain', 'wetGrass', (rainState) => rainState ? 'wet' : 'dry');
ps.causes('sprinkler', 'wetGrass', (sprinklerState) => sprinklerState ? 'wet' : 'dry');

// Define possible states
ps.stateSpace('rain', [true, false]);
ps.stateSpace('sprinkler', [true, false]);
ps.stateSpace('wetGrass', ['wet', 'dry']);

// Assert actual world
ps.assert('rain', false);
ps.assert('sprinkler', false);
ps.assert('wetGrass', 'dry');

// Create counterfactual
const cf = ps.createCounterfactual('whatIfRain')
    .intervene('rain', true)
    .compute();

console.log(cf.getEffect('wetGrass')); // 'wet'

// Temporal reasoning
ps.addTimeStep(1, new Map([['rain', false], ['wetGrass', 'dry']]));
ps.addTimeStep(2, new Map([['rain', true], ['wetGrass', 'wet']]));

console.log(ps.query('atTime', 2, 'wetGrass', 'wet')); // true

console.log('Finish');