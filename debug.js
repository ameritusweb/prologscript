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

// Define rules - need to flip the condition to match fact storage
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
console.log(ps.query('ancestor', 'carol', 'alice')); // is returning false instead of: true
// console.log(ps.query('ancestor', '$X', 'alice')); // is returning false instead of: ['bob', 'carol']

// Custom predicates
ps.predicate('greaterThan', (x, y) => x > y);
console.log(ps.greaterThan(5, 3)); // true

console.log('Finish');