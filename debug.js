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

// Custom predicates
ps.predicate('greaterThan', (x, y) => x > y);
console.log(ps.greaterThan(5, 3)); // true

console.log('Finish');