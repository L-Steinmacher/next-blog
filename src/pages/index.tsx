import { getAllPosts } from "lib/blogApi";
import Head from "next/head";
import { type LatestPost } from "./interfaces/post";
import Link from "next/link";
import Image from "next/image";

type Props = {
  latestPosts: LatestPost[];
};

export default function Home({latestPosts}: Props) {
  const latestPost = latestPosts[0];
  const remainingLatestPosts = latestPosts.slice(1);

  return (
    <>
    <Head>
      <title>Lucas Steinmacher</title>
      <meta name="description" content="Personal site of Lucas Steinmacher" />
      <link rel="icon" href="favicon.ico" />
    </Head>
    <main className="flex flex-col items-center px-4 max-w-4xl mx-auto">
      <div className="container flex flex-col items-start justify-center py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl text-[#d68401bb] h-full font-extrabold sm:text-[5rem] tracking-tight leading-none">
              lucas steinmacher
            </h1>
            <p className="text-lg pt-4">
              Hey there! Names Lucas, I am a software engineer based in the PNW. <br />
              I'm excited about <a href="https://www.latent.space/p/ai-engineer" className="hover:text-[#d68401bb] hover:underline">AI Engineering</a>,<br/>
              Making cool things with Typescrip,<br/>
              I also write about whatever is on my mind from time to time.
            </p>
            <Link className="text-lg pt-4 hover:underline hover:text-[#d68401bb]" href={"/about"}>
              To learn more about me check out my About page.
            </Link>
          </div>
          <div className="flex items-center justify-center sm:mt-0 mt-8 md:pl-4">
            <div className="min-w-[100px]">
              <Image
                src="/images/Lucas_web.jpg"
                className="rounded-full"
                width={100}
                height={100}
                alt="Lucas Steinmacher photo"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full items-start mx-auto">
          <div className="flex flex-col py-8">
            <p className="text-lg">
              I write sometimes about things I am working on, and things I am learning. Here's the latest:
            </p>
            <div className="w-3/4 mx-auto py-4">
              <Link className="text-[#d68501] hover:text-[#d68401bb] text-lg hover:underline transition-colors" href={`/blog/${latestPost.slug}`}>
                {latestPost?.title}
              </Link>
              <span className="text-xs px-2">{latestPost?.date.split("T")[0]}</span>
              <p className="text-lg"> {latestPost?.excerpt}</p>
              <Link className="text-[#d68501] text-lg hover:text-[#d68401bb] hover:underline transition-colors" href={`/blog/${latestPost.slug}`}>
                Read more
              </Link>
            </div>
            {remainingLatestPosts.map(({ slug, date, title }) => (
              <div key={slug} className="w-full">
                <Link className="text-[#d68501] hover:text-[#d68401bb] hover:underline transition-colors" href={`/blog/${slug}`}>
                  {title}
                </Link>
                <span className="text-xs px-2">{date?.split("T")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </>
  );
}

 export async function getStaticProps  () {
  // get the latest blog post
  const latestPosts = await getAllPosts([
    "title",
    "date",
    "slug",
    "excerpt",
  ]);

  // if latest post is not found, return 404 page
  if (!latestPosts) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      latestPosts,
    },
  };
 }
