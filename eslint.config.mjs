/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/sw.js"],
  },
];

export default eslintConfig;
