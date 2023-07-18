import { getAllPosts } from "lib/blogApi"
import { type PostOptions } from "../interfaces/post"
import Link from "next/link"

type Props = {
    allPosts: PostOptions[]
}

export default function Blog({ allPosts } : Props) {
    return (
        <div className="">
            <details>
                <summary>Blog</summary>
                <pre>{JSON.stringify(allPosts, null, 2)}</pre>
            </details>
            <ul>
                {allPosts.map(({ slug, date }) => (
                    slug && (
                        <li key={slug}>
                            {date}
                            {slug &&
                                <Link href={`/blog/${slug}`}>
                                    {slug}
                                </Link>
                            }
                        </li>
                    )
                ))}
            </ul>
        </div>
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
