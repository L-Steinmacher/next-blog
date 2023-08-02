import Link from 'next/link';
import { type NonNullablePostOptions } from '~/interfaces/post';
import { getPostBySlug, getPostSlugs } from 'lib/blogApi';
import markdownToHtml from 'lib/markdownToHtml';
import PostBody from '~/components/postBody';
import readingTime, { type ReadTimeResults } from 'reading-time';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { type Comment } from '~/interfaces/comments';
import { CommentLayout } from '~/components/commentLayout';

type Props = {
  post: NonNullablePostOptions;
  stats: ReadTimeResults;
  comments: Comment[];
};

export default function Post({ post, stats }: Props) {
  const router = useRouter();
  if (!post.slug) throw router.push('/404');

  return (
    <>
      <Head>
        <title>{post.title} - Lucas Steinmacher </title>
        <meta
          name="description"
          content={post.excerpt || 'A Blog Post by Lucas Steinmacher'}
        />
        <link rel="icon" href="favicon.ico" />
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="py-16">
        <details>
          <summary>Post Data</summary>
          <pre>{JSON.stringify({ ...post, id: undefined }, null, 2)}</pre>
        </details>
        {post.content ? (
          <section aria-labelledby="post-heading">
            <div className="container mx-auto min-h-full max-w-2xl px-5">
              <h1
                id="post-heading"
                className="md:text-6 3xl mb-12 text-center text-3xl font-bold leading-tight tracking-tighter md:text-left md:leading-none lg:text-4xl"
              >
                {post.title}
              </h1>
              <p>{post.date?.split('T')[0]}</p>
              <span>{stats.text}</span>
              {typeof post.author === 'string' ? (
                // When post.author is a string (name of the author)
                <p>Written by: {post.author}</p>
              ) : (
                // When post.author is an Author object
                <p>Written by: {post.author?.name}</p>
              )}
              <PostBody content={post.content} />
              <Link href="/blog">Back to blogs →</Link>
            </div>
          </section>
        ) : null}
        <hr className="mt-16 h-[3px] bg-gradient-to-r from-[#d68501] to-[#6b2b6f]" />
        <CommentLayout slug={post.slug} />
      </div>
    </>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  const postData: NonNullablePostOptions = await getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
  ]);

  const parsedContent = await markdownToHtml(postData.content || '');
  const stats = readingTime(postData.content || '');
  if (!postData.slug) throw new Error('No slug found for post');

  return {
    props: {
      post: {
        title: postData.title,
        date: postData.date,
        slug: postData.slug,
        author: postData.author,
        content: parsedContent,
      },
      stats,
    },
  };
};

export async function getStaticPaths() {
  const slugs = await getPostSlugs();
  const paths = slugs.map(slug => {
    return {
      params: {
        slug: slug.replace(/\.md$/, ''), // Remove file extension for each post slug
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}
