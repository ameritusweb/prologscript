import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/core/PrologScript.js",
  external: ["esprima"], // Mark esprima as an external dependency
  output: [
    {
      file: "dist/PrologScript.esm.js",
      format: "esm",
    },
    {
      file: "dist/PrologScript.umd.js",
      format: "umd",
      name: "PrologScript",
      globals: {
        esprima: "esprima", // Define global variable for browser
      }
    }
  ],
  plugins: [
    resolve(), // Resolves node_modules imports
    commonjs(), // Converts CommonJS modules to ES6
  ]
};
