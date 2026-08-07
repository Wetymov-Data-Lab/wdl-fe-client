/** @type {import('prettier').Config} */
export default {
  bracketSameLine: true, // Keep JSX/HTML closing bracket on the same line
  arrowParens: "always", // Always wrap arrow function parameters in ()
  trailingComma: "all", // Add trailing comma wherever possible
  printWidth: 124, // Wrap lines longer than 124 characters
  endOfLine: "lf", // Enforce LF (Unix line endings)
  tabWidth: 2, // Indent with 4 spaces
  semi: true, // Always insert semicolons
};
