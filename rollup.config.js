import typescript from "@rollup/plugin-typescript";
import { nodeExternals } from "rollup-plugin-node-externals";
/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  {
    input: "./src/index.ts",
    plugins: [typescript(), nodeExternals()],
    output: {
      format: "es",
      dir: "./dist",
    },
  },
];
