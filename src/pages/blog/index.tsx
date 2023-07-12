import { getAllPosts } from "lib/api"
import { type PostOptions } from "../interfaces/post"
import Link from "next/link"

type Props = {
    allPosts: PostOptions[]
}

export default function Blog({ allPosts } : Props) {
    return (
        <div>
            <details>
                <summary>Blog</summary>
                <pre>{JSON.stringify(allPosts, null, 2)}</pre>
            </details>
            <ul>
                {allPosts.map(({ slug, date }) => (

                    <li key={slug}>
                        {date}
                        {slug &&
                            <Link href={`/blog/${slug}`}>
                                {slug}
                            </Link>
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}

export const getStaticProps =  () => {
    const allPosts = getAllPosts([
      'date',
      'slug',
    ])

    return {
      props: { allPosts },
    }
  }
