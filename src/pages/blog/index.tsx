import { getAllPosts } from "lib/blogApi"
import { type PostOptions } from "../../interfaces/post"
import Link from "next/link"
import Head from "next/head"

type Props = {
    allPosts: PostOptions[]
}

export default function Blog({ allPosts } : Props) {
    return (
        <>
        <Head>
        <title>Blog list</title>
        <meta name="description" content="Blog Posts for Lucas Steinmacher" />
        <link rel="icon" href="favicon.ico" />
      </Head>
        <div className="">
            <details>
                <summary>Blog</summary>
                <pre>{JSON.stringify(allPosts, null, 2)}</pre>
            </details>
            <h2 className="text-2xl font-bold">Blog Posts</h2>
            <p className="py-8 text-xl">Hey!  You made it to the blog list! Thanks for checking this out!</p>
            <ul>
                {allPosts.map(({ slug, date }) => (
                    slug && (
                        <li key={slug}>
                            <span>{date?.split("T")[0]}</span>
                            {slug &&
                                <Link className="pl-3  text-[#d68501] transition-colors hover:text-[#d68401bb] hover:underline" href={`/blog/${slug}`}>
                                    {slug}
                                </Link>
                            }
                        </li>
                    )
                ))}
            </ul>
        </div>
        </>
    )
}

export const getStaticProps =  async () => {
    const allPosts = await getAllPosts([
      'date',
      'slug',
    ])

    return {
      props: { allPosts },
    }
  }
