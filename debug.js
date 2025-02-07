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

const result3 = ps.query("add", "$X", "$Y", 10);
            
const X = result3.get("X");
const Y = result3.get("Y");

const astResult = ps.ast(() => result3.get("X") + result3.get("Y"));
            // Expected AST structure
            const expectedAST = {
                type: "BinaryExpression",
                operator: "+",
                left: { type: "Variable", name: "$X" },
                right: { type: "Variable", name: "$Y" }
            };
console.log('World');