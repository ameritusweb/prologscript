import { PrologScript } from "./src/core/PrologScript.js";

// Initialize the PrologScript class
const ps = new PrologScript();
console.log("PrologScript initialized!");

ps.createReality("Debug");
ps.switchReality("Debug");

// Define semantic relationships
ps.addSemanticRelation('mortality', 'mortal');
ps.addSemanticRelation('alive', 'living');
ps.addSemanticRelation('living', 'life');

// Define facts
ps.isA('socrates', 'human');
ps.hasA('human', 'mortality', true);

// Define rules
ps.addRule('mortal:$X',
    'isA:$X:human',
    'hasA:human:mortality:true'
);

// Now this should work
console.log(ps.infer('mortal', 'socrates')); // true

// And you can do more complex semantic relationships
ps.hasA('plant', 'alive', true);
ps.addRule('living:$X',
    'hasA:$X:life:true'
);
console.log(ps.infer('living', 'plant')); // true

// Define family relationships
ps.isA('alice', 'person');
ps.isA('bob', 'person');
ps.isA('carol', 'person');
ps.hasA('alice', 'parent', 'bob');
ps.hasA('bob', 'parent', 'carol');

ps.addRule(
    'ancestor:$X:$Y',            // X is ancestor of Y
    'hasA:$Y:parent:$X'         // Y has parent X (means X is parent of Y)
);

ps.addRule(
    'ancestor:$X:$Z',            // X is ancestor of Z
    'hasA:$Z:parent:$Y',        // Z has parent Y
    'ancestor:$X:$Y'            // and X is ancestor of Y
);

// Queries
console.log(ps.query('ancestor', 'carol', 'alice'));
console.log(ps.query('ancestor', '$X', 'alice'));

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