declare module "*.mdx" {
  const MDXComponent: React.ComponentType;
  export default MDXComponent;

  export const metadata: {
    title: string;
    category: string;
    readTime: string;
    excerpt: string;
  };
}
