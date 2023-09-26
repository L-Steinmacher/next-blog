import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { type Plugin, unified } from 'unified'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse as Plugin)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)
  return result.toString()
}
