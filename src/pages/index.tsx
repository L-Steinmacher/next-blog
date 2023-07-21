import { getAllPosts } from 'lib/blogApi';
import Head from 'next/head';
import { type NonNullablePostOptions } from '../interfaces/post';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  latestPosts: NonNullablePostOptions[];
};

export default function Home({ latestPosts }: Props) {
  if (!latestPosts || latestPosts.length === 0) {
    return <p>No posts found!</p>
  }

  const latestPost = latestPosts[0] as NonNullablePostOptions;
  const remainingLatestPosts = latestPosts.slice(1);

  return (
    <>
      <Head>
        <title>Lucas Steinmacher</title>
        <meta name="description" content="Personal site of Lucas Steinmacher" />
        <link rel="icon" href="favicon.ico" />
        <meta name="robots" content="index,follow" />
      </Head>
      <main className="mx-auto flex max-w-4xl flex-col items-center px-4">
        <div className="container flex flex-col items-start justify-center py-16">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="flex flex-col gap-2">
              <h1 className="h-full text-xl font-extrabold leading-none tracking-tight text-[#d68401bb] sm:text-[5rem]">
                lucas steinmacher
              </h1>
              <p className="pt-4 text-lg">
                Hey there! Names Lucas, a.k.a. Panz. I am a software engineer based in the
                Greater Seattle area. <br />
                I&apos;m excited about{' '}
                <a
                  href="https://www.latent.space/p/ai-engineer"
                  className="hover:text-[#d68401bb] hover:underline"
                >
                  AI Engineering
                </a>
                <br />
                Making cool things with Typescrip,
                <br />
                I also write about whatever is on my mind from time to
                time.
              </p>
              <Link
                className="pt-4 text-lg hover:text-[#d68401bb] hover:underline"
                href={'/about'}
              >
                To learn more about me check out my About page.
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center sm:mt-0 md:pl-4">
              <div className="min-w-[100px] ">
                <Image
                  src="/images/Lucas_web.jpg"
                  className="rounded-full object-cover"
                  width={120}
                  height={100}

                  alt="Lucas Steinmacher photo"
                />
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full flex-col items-start">
            <div className="flex flex-col py-8">
              <p className="text-justify text-xl">
                I write sometimes about things I am working on, and things I am
                learning. Here&apos;s the latest:
              </p>
              <div className="mx-auto max-w-2xl w-3/4 py-4">
                {latestPost ? (
                  <>
                    <Link
                      className="text-lg text-[#d68501] transition-colors hover:text-[#d68401bb] hover:underline"
                      href={`/blog/${latestPost.slug  ?? ""}`}
                    >
                      {latestPost?.title}
                    </Link>
                    <span className="px-2 text-xs">
                      {latestPost.date ? latestPost.date.split('T')[0] : ''}
                    </span>
                    <p className="text-justify text-lg">
                      {' '}
                      {latestPost?.excerpt}
                    </p>
                    <Link
                      className="text-lg text-[#d68501] transition-colors hover:text-[#d68401bb] hover:underline"
                      href={`/blog/${latestPost.slug ?? ""}`}
                    >
                      Continue Reading →
                    </Link>
                  </>
                ) : (
                  <p className="text-justify text-lg">No posts found</p>
                )}
              </div>
              {remainingLatestPosts.map(({ slug, date, title }) => (
                <div key={slug} className="w-full">
                  <Link
                    className="text-[#d68501] transition-colors hover:text-[#d68401bb] hover:underline"
                    href={`/blog/${slug ?? ""}`}
                  >
                    {title}
                  </Link>
                  <span className="px-2 text-xs">{date?.split('T')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  // get the latest blog post
  const latestPosts = await getAllPosts(['title', 'date', 'slug', 'excerpt']);

  return {
    props: {
      latestPosts,
    },
  };
}
