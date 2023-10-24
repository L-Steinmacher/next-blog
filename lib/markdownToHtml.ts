import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { type Plugin, unified } from 'unified'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse as Plugin)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown)
  return String(result)
}
