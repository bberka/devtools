declare module 'markdown-it-texmath' {
  import MarkdownIt from 'markdown-it';

  interface TexmathOptions {
    engine?: unknown;
    delimiters?: string;
    katexOptions?: Record<string, unknown>;
  }

  const texmath: (md: MarkdownIt, options?: TexmathOptions) => void;
  export default texmath;
}
