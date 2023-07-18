import { getAllPosts } from "lib/blogApi";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";
import { type LatestPost } from "./interfaces/post";
import Link from "next/link";
import Image from "next/image";


type Props = {
  latestPosts: LatestPost[];
};

export default function Home({latestPosts}: Props) {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  return (
    <>
        <Head>
          <title>Lucas Steinmacher</title>
          <meta name="description" content="Personal site of Lucas Steinmacher" />
          <link rel="icon" href="favicon.ico" />
        </Head>
        <main className="flex flex-col items-center px-4 ">
          <div className="container flex flex-col items-start justify-center py-16  ">
            <div className="flex flex-row h-full w-full items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl text-[#d68501] h-full font-extrabold sm:text-[5rem] tracking-tight leading-none">
                  lucas steinmacher
                </h1>
                <p className=" text-xl ">
                    Hey there!  Names Lucas, I am a software engineer based in the PNW.
                </p>
                <Link className=" text-xl hover:underline hover:text-[#d68401d6]" href={"/about"}>
                  To learn more about me check out my About page.
                </Link>
              </div>
              <Image src="/images/Lucas_web.jpg" className="rounded-full " width={100} height={100} alt="Lucas Steinmacher photo"/>
            </div>
            <div className="flex flex-col w-full items-start mx-auto">

              <div className="flex flex-col pt-10 ">
                <p className="text-xl ">
                  I write sometimes about things I am working on, and things I am learning. Heres the latests:
                </p>
                {latestPosts.map(({ slug, date, title }) => (
                  <div key={slug} className="w-full">
                    <Link className="text-[#d68501]" href={`/blog/${slug}`}>
                      {title}
                    </Link><span className="text-xs px-2">{date}</span>
                  </div>
                )
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">

                <AuthShowcase />
            </div>
            </div>
          </div>
        </main>

    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center  gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
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
