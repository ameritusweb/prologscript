import { PrologScript } from "./src/core/PrologScript.js";

// Initialize the PrologScript class
const ps = new PrologScript();
console.log("PrologScript initialized!");

// Test basic arithmetic functions
console.log("3 + 5 =", ps.computeAdd(3, 5));
console.log("10 - 4 =", ps.computeSubtract(10, 4));

// Test reality creation
ps.createReality("Quantum Realm");
console.log("Switched to Quantum Realm:", ps.switchReality("Quantum Realm"));

// const result1 = ps.query("add", 5, 3, "$Result");
console.log('Hello');

ps.addUniversalLaw(
    "gravity",
    (reality) => true,
    (state) => ({ force: state.mass * 9.81 })
);

ps.createReality("Moon");
ps.switchReality("Moon");
ps.overrideUniversalLaw(
    "gravity",
    (state) => ({ force: state.mass * 1.62 })
);

const result = ps.query("gravity", { mass: 1 });
console.log('World');