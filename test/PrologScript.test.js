import { PrologScript } from "../src/core/PrologScript.js";

describe("PrologScript Tests", () => {
    let ps;

    beforeEach(() => {
        ps = new PrologScript();
    });

    test("adds two numbers correctly", () => {
        expect(ps.add(3, 5)).toBe(8);
    });

    test("subtracts two numbers correctly", () => {
        expect(ps.subtract(10, 4)).toBe(6);
    });

    test("creates and switches realities", () => {
        ps.createReality("Quantum");
        expect(ps.switchReality("Quantum")).toBe(true);
    });

    test("fails to switch to a non-existent reality", () => {
        expect(ps.switchReality("NonExistent")).toBe(false);
    });
});
