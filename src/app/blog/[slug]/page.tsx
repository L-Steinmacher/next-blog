import Link from 'next/link';
import { type NonNullablePostOptions } from '~/interfaces/post';
import { getPostBySlug, getPostSlugs } from 'lib/blogApi';
import markdownToHtml from 'lib/markdownToHtml';
import PostBody from '~/components/postBody';
import readingTime from 'reading-time';
import { CommentLayout } from '~/app/blog/[slug]/commentLayout';

// export const metaData: Metadata = {
//   title: post?.title
//     ? `Blog Post: ${post.title}`
//     : 'Blog Post by Lucas Steinmacher',
//   description: post?.excerpt || 'A Blog Post by Lucas Steinmacher',
// };
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  const paths = slugs.map(slug => {
    return {
      params: {
        slug: slug.replace(/\.md$/, ''), // Remove file extension for each post slug
      },
    };
  });

  return paths;
}

export default async function Post({
  params
 }: { params: { slug: string; }; }) {
  const { slug } = params;
  const { post, stats } = await getPostData( { slug } );

  return (
    <>
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


export async function getPostData( params: { slug: string; } ) {

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
      post: {
        title: postData.title,
        date: postData.date,
        slug: postData.slug,
        author: postData.author,
        content: parsedContent,
      },
      stats,
  };
};

