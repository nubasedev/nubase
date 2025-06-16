// TypeScript declarations for CSS modules and workspace CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

// Specific declaration for workspace CSS imports
declare module '@repo/ui/styles.css' {
  const content: string;
  export default content;
}
