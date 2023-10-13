import { getAllPosts } from 'lib/blogApi';
import Link from 'next/link';
import Image from 'next/image';
import { type Metadata } from 'next';

export const metaData: Metadata = {
    title: 'Lucas Steinmacher - Software Engineering Blog',
    description:
        'Explore articles by Lucas Steinmacher, a Seattle-based software engineer, covering various topics in technology and development.',
    robots: 'index,follow',
    keywords: 'Lucas Steinmacher, Panz, Panzer, Software Developer, Software Engineer',
    };

export default async function Home() {
  const latestPosts = await getBlogPosts();
  const latestPost = latestPosts[0];
  const remainingLatestPosts = latestPosts.slice(1);

  return (
    <>
      <main className="flex flex-col items-center max-w-4xl px-4 mx-auto">
        <div className="container flex flex-col items-start justify-center py-16">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="flex flex-col gap-2">
              <h1 className="h-full text-2xl font-extrabold leading-none tracking-tight text-[#d68401bb] sm:text-[5rem]">
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
                Making cool things with Typescript,
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
            <div className="flex items-center justify-center mt-8 sm:mt-0 md:pl-4">
              <div className="min-w-[100px] ">
                <Image
                  src="/images/Lucas_web.jpg"
                  className="object-cover rounded-full"
                  width={120}
                  height={100}
                  alt="Lucas Steinmacher photo"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start w-full mx-auto">
            <div className="flex flex-col py-8">
              <p className="text-xl text-justify">
                I write sometimes about things I am working on, and things I am
                learning. Here&apos;s the latest:
              </p>
              <div className="w-3/4 max-w-2xl py-4 mx-auto">
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
                    <p className="text-lg text-justify">
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
                  <p className="text-lg text-justify">No posts found</p>
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

export async function getBlogPosts() {
  // sort by date in descending order
  let allPosts = await getAllPosts(['title', 'date', 'slug', 'excerpt']);
    allPosts = allPosts.sort((a, b) => {
        if (a.date && b.date) {
            return b.date.localeCompare(a.date);
        } else if (a.date) {
            return -1;
        } else if (b.date) {
            return 1;
        }
        return 0;
    });
    return allPosts;
}
