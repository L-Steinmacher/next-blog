---
title: "Ground Up"
excerpt: "In the waning weeks of June 2023, a simple yet compelling idea took root: breathing new life into my portfolio. The aging Hugo template-generated site that had served me well needed a contemporary touch—a reflection of who I've become. With an added twist this time—a blog. Since I'm adding the blog I thought I'd talk about how it all went down—the ups, the downs, and the..."
date: "2023-07-25T18:27:24.604Z"
author:
  name: Lucas Steinmacher
---

## Adding a Personal Touch

In the waning weeks of June 2023, a simple yet compelling idea took root: breathing new life into my portfolio. The aging Hugo template-generated site that had served me well needed a contemporary touch—a reflection of who I've become. With an added twist this time—a blog. Since I'm adding the blog I thought I'd talk about how it all went down—the ups, the downs, and the "oh, I probably shouldn't have done that" moments. No time to waste, let's dive right into the story.

## Navigating Remix Challenges and Pivot

 I've been working for a company on a contract for about a year, working on a project based in the Remix ecosystem. When things had slowed down and my contract was coming to an end, I decided to update my portfolio with some of the skills that I learned and realized that yeah, the old Hugo needed to go… pun maybe intended. I knew I wanted to build and learn as opposed to just doing something simple with a template, and since I had already been learning Remix, I decided to give it a shot! I loaded up a new app, found the MDX bundler written by Kent C Dodds, and started on my way! I immediately started running into issues with it, mainly from the outdated version of Remix that the MDX bundler was based on and the newer version of Remix that I was building with. I put in about three hours into that project and decided to pivot and switch direction. Not to be deterred from my intention of building something cool and learning along the way, I opened up my horizons.

## Building with Next and the T3 Stack

 The company that I previously worked for, Skilled Recordings, used Next.js for the majority of their applications that they produced, so I decided to go down that direction. I decided to use the T3 stack for its “simplicity, modularity, and type safety across the full stack”. I had also come across the packages Gray Matter and Unified for parsing Markdown into HTML that I wanted to use. After installing everything, after about 3 hours I had my Markdown parser setup and blog posts ready to go. I was using Tailwind, of course, for styling, TRPC for my API, and Next Auth with Discord to authorize my users. All said and done, a pretty quick start to get a prototype up of the project and no major bugs to try and work around!

> The Markdown is parsed using unified and remark
``` ts line-numbers=true
import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse/lib'
import { type Plugin, unified } from 'unified'

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse as Plugin)
    .use(remarkHtml as Plugin)
    .process(markdown)
  return result.toString()
```
 > Then the Markdown is simply rendered in a div using dangerouslySetInnerHTML and styles are applied from a css module

```typescript
import markdownStyles from './markdown-styles.module.css';

type Props = {
  content: string;
};

export default function PostBody({ content }: Props) {
  return (
    <div
      className={markdownStyles['markdown']}
      role="article"
      aria-label="Post Content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
```
> Then finally I fetch the postData content in the [slug].tsx page and parse it in getStaticProps then render it in the PostBody component.
```ts
export const getStaticProps = async ({ params }: Params) => {
  const postData = await getPostBySlug(params.slug);
  const parsedContent = await markdownToHtml(postData.content || '');

  return {
    props: {
      post: {
        content: parsedContent,
      },
    },
  };
};

export default function Post({ post, stats }: Props) {
  // [slug].ts logic here...
  return (
    <>
    // XML here
      <PostBody content={post.content} />
    // the rest of the XML
    <>
  )
}
```

## The Comment Conundrum

 After prototyping and sitting on what I was going to do with the authorization that the T3 stack afforded me, I decided to add a comment section, thus making one of the quintessential mistakes as a software engineer, thinking to myself, “Ahh, this will probably just take me a day or two…” Three weeks later, I was finished with the feature! Completed with authorization through Discord, rate limiting on the front and back end, Google reCAPTCHA V2 to make sure that bots don't spam my comment section, language moderation using the Bad Words NPM package (which asterisks out words on the bad word list), and setting up a PostgreSQL database hosted on Vercel! Well, to be fair, I did get married during the three weeks and took a week off.

## Conclusion

 All in all, things went rather smoothly and I'm excited to make the domain name switch from the old Hugo to this version that you're reading this on when I deploy this blog post. There's still a lot of work to be done and features that I'd like to implement. For instance, I'm new to TRPC and some of my backend calls with state changes are kind of ugly. I'd like to clean them up and abstract them into their own utility files, as well as implement a language change using Langchain and connecting to ChatGPT for instance, as well as on the comment section.  Oh and I'm working on custom syntax highlighting for code blocks in the markdown,  I'll update this when I get the css figured out. I'll also be making bi-weekly blog posts if not monthly blog posts on what I've been up to, but until then, I hope you enjoy!
