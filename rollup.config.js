export default {
    input: "src/core/PrologScript.js",
    output: [
      {
        file: "dist/PrologScript.esm.js",
        format: "esm",
      },
      {
        file: "dist/PrologScript.umd.js",
        format: "umd",
        name: "PrologScript",
      }
    ]
  };
  