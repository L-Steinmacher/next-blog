import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse/lib'
import { type Plugin, unified } from 'unified'

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse as Plugin)
    .use(remarkHtml as Plugin)
    .process(markdown)
  return result.toString()
}