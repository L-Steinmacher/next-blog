import { getAllPosts } from "lib/blogApi";
import Head from "next/head";
import { type LatestPost } from "./interfaces/post";
import Link from "next/link";
import Image from "next/image";


type Props = {
  latestPosts: LatestPost[];
};

export default function Home({latestPosts}: Props) {

  return (
    <>
    <Head>
      <title>Lucas Steinmacher</title>
      <meta name="description" content="Personal site of Lucas Steinmacher" />
      <link rel="icon" href="favicon.ico" />
    </Head>
    <main className="flex flex-col items-center px-4">
      <div className="container flex flex-col items-start justify-center py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl text-[#d68401d6] h-full font-extrabold sm:text-[5rem] tracking-tight leading-none">
              lucas steinmacher
            </h1>
            <p className="text-xl">
              Hey there! Names Lucas, I am a software engineer based in the PNW.
            </p>
            <Link className="text-xl hover:underline hover:text-[#d68401d6]" href={"/about"}>
              To learn more about me check out my About page.
            </Link>
          </div>
          <div className="flex items-center justify-center sm:mt-0 mt-8">
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
          <div className="flex flex-col pt-10">
            <p className="text-xl">
              I write sometimes about things I am working on, and things I am learning. Here's the latest:
            </p>
            {latestPosts.map(({ slug, date, title }) => (
              <div key={slug} className="w-full">
                <Link className="text-[#d68501]" href={`/blog/${slug}`}>
                  {title}
                </Link>
                <span className="text-xs px-2">{date}</span>
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
