import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.{ts,tsx}"], // Automatically includes all .ts and .tsx files inside src/
  format: ["esm"], // Only output ESM format
  dts: true, // Generate TypeScript declaration files
  clean: true, // Remove previous build files before bundling
  sourcemap: true, // Enable source maps for debugging
  outDir: "dist", // Output directory
  splitting: false, // Keep files bundled together
  minify: false, // No minification (better for debugging)
  treeshake: true, // Remove unused code
});
