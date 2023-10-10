import { getAllPosts } from 'lib/blogApi';
import Link from 'next/link';
import { type Metadata } from 'next';

export const metaData: Metadata = {
    title: 'Blog list',
    description: 'Check out Blog Posts from Lucas Steinmacher',
};

export default async function Blog() {
    const allPosts = await getPostsList();
    return (
        <>
            <div className="">
                <details>
                    <summary>Blog</summary>
                    <pre>{JSON.stringify(allPosts, null, 2)}</pre>
                </details>
                <h2 className="text-2xl font-bold">Blog Posts</h2>
                <p className="py-8 text-xl">
                    Hey! You made it to the blog list! Thanks for checking this
                    out!
                </p>
                <ul>
                    {allPosts.map(
                        ({ slug, date }) =>
                            slug && (
                                <li key={slug}>
                                    <span>{date?.split('T')[0]}</span>
                                    {slug && (
                                        <Link
                                            className="pl-3  text-[#d68501] transition-colors hover:text-[#d68401bb] hover:underline"
                                            href={`/blog/${slug}`}
                                        >
                                            {slug}
                                        </Link>
                                    )}
                                </li>
                            ),
                    )}
                </ul>
            </div>
        </>
    );
}

export const getPostsList = async () => {
    return await getAllPosts(['date', 'slug']);
};
