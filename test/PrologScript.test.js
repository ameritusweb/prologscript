import { PrologScript } from "../src/core/PrologScript.js";

describe("PrologScript Tests", () => {
    let ps;

    beforeEach(() => {
        ps = new PrologScript();
    });

    // Direct Computation Tests
    describe("Direct Computation", () => {
        test("adds two numbers correctly", () => {
            expect(ps.computeAdd(3, 5)).toBe(8);
        });

        test("subtracts two numbers correctly", () => {
            expect(ps.computeSubtract(10, 4)).toBe(6);
        });

        test("handles variable references in computation", () => {
            ps.context.bindings.set("X", 5);
            expect(ps.computeAdd("$X", 3)).toBe(8);
        });
    });

    // Reality Management Tests
    describe("Reality Management", () => {
        test("creates and switches realities", () => {
            ps.createReality("Quantum");
            expect(ps.switchReality("Quantum")).toBe(true);
        });

        test("fails to switch to a non-existent reality", () => {
            expect(ps.switchReality("NonExistent")).toBe(false);
        });

        test("maintains separate facts for different realities", () => {
            ps.createReality("Reality1");
            ps.createReality("Reality2");
            
            ps.switchReality("Reality1");
            ps.assert("gravity", "strong");
            
            ps.switchReality("Reality2");
            ps.assert("gravity", "weak");
            
            ps.switchReality("Reality1");
            expect(ps.query("gravity")).toBe("strong");
            
            ps.switchReality("Reality2");
            expect(ps.query("gravity")).toBe("weak");
        });
    });

    // Logical Predicates Tests
    describe("Logical Predicates", () => {
        test("unifies addition results", () => {
            expect(ps.query("add", 5, 3, "$Result").get("Result")).toBe(8);
        });

        test("finds missing addend", () => {
            const result = ps.query("add", "$X", 3, 8);
            expect(result.get("X")).toBe(5);
        });

        test("verifies arithmetic relationships", () => {
            ps.createReality("Logic3");
            ps.switchReality("Logic3");
            
            // Simple verification
            expect(ps.query("add", 5, 3, 8)).toBe(true);
            expect(ps.query("add", 5, 3, 9)).toBe(false);
            
            // Variable binding
            const result1 = ps.query("add", 5, 3, "$Result");
            expect(result1.get("$Result").value).toBe(8); // This works instead
            
            // Find missing addend
            const result2 = ps.query("add", "$X", 3, 8);
            console.log('res2: ' + typeof result2); // is a boolean
            expect(result2.get("X")).toBe(5);
            
            // Multiple variables
            const result3 = ps.query("add", "$X", "$Y", 10);
            expect(result3.get("X") + result3.get("Y")).toBe(10);
        });
    });

    // List Operations Tests
    describe("List Operations", () => {
        test("cons adds element to list", () => {
            const result = ps.query("cons", 1, [2, 3], "$Result");
            expect(result.get("Result")).toEqual([1, 2, 3]);
        });

        test("head gets first element", () => {
            const result = ps.query("head", [1, 2, 3], "$First");
            expect(result.get("First")).toBe(1);
        });

        test("tail gets rest of list", () => {
            const result = ps.query("tail", [1, 2, 3], "$Rest");
            expect(result.get("Rest")).toEqual([2, 3]);
        });

        test("append combines lists", () => {
            const result = ps.query("append", [1, 2], [3, 4], "$Result");
            expect(result.get("Result")).toEqual([1, 2, 3, 4]);
        });
    });

    // Universal Laws Tests
    describe("Universal Laws", () => {
        test("adds and applies universal law", () => {
            ps.addUniversalLaw(
                "gravity",
                (reality) => true,
                (state) => ({ force: state.mass * 9.81 })
            );
            
            ps.createReality("Earth");
            ps.switchReality("Earth");
            
            const result = ps.query("gravity", { mass: 1 });
            expect(result.force).toBeCloseTo(9.81);
        });

        test("overrides universal law in specific reality", () => {
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
            expect(result.force).toBeCloseTo(1.62);
        });
    });

    // Wave Function Tests
    describe("Wave Functions", () => {
        test("creates and evaluates wave function", () => {
            const wave = ps.createWave({
                amplitude: 1,
                frequency: 1,
                phase: 0,
                type: 'sine'
            });
            
            expect(wave.getValue(Math.PI/2)).toBeCloseTo(1);
            expect(wave.getValue(Math.PI)).toBeCloseTo(0);
        });

        test("finds wave points at specific height", () => {
            const wave = ps.createWave({
                amplitude: 1,
                frequency: 1,
                phase: 0,
                type: 'sine'
            });

            const points = wave.findX(0.5, 0, 2 * Math.PI);
            expect(points.length).toBe(2);
            expect(points[0]).toBeCloseTo(0.524); // π/6
            expect(points[1]).toBeCloseTo(2.618); // 5π/6
        });
    });

    // Counterfactual Tests
    describe("Counterfactuals", () => {
        test("computes effects of intervention", () => {
            ps.createReality("TestReality");
            ps.switchReality("TestReality");
            
            ps.assert("light", "off");
            ps.causes("switch", "light", 
                (state) => state === "on" ? "on" : "off"
            );

            const cf = ps.createCounterfactual("switchOn")
                .intervene("switch", "on")
                .compute();

            expect(cf.getEffect("light")).toBe("on");
        });
    });
});
