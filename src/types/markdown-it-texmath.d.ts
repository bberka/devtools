declare module 'markdown-it-texmath' {
  import MarkdownIt from 'markdown-it';

  interface TexmathOptions {
    engine?: any;
    delimiters?: string;
    katexOptions?: any;
  }

  const texmath: (md: MarkdownIt, options?: TexmathOptions) => void;
  export default texmath;
}
