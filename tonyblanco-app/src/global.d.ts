declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'svg2pdf.js' {
  export const svg2pdf: (svg: any, pdf: any, options?: any) => any;
  const _default: any;
  export default _default;
}
