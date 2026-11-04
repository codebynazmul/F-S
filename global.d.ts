// Lets TypeScript accept plain CSS imports like `import "./globals.css"`.
// Next.js bundles them; newer TypeScript versions (e.g. the one in VS Code) otherwise flag them.
declare module '*.css';
