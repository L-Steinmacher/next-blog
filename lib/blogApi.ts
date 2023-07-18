import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { type DatabasePost, type PostOptions } from '../src/pages/interfaces/post'
import { LRUCache } from 'lru-cache'

const postsDirectory = join(process.cwd(), '/src/_posts')

export async function getPostSlugs() {
    return await fs.promises.readdir(postsDirectory)
}

type Items = {
    [key: string]: string,
}

const ttl = 1000 * 60 * 60 * 24 * 30 // 30 days

const LRUOptions = {
    max: 100,
    ttl,
}

const cache = new LRUCache<string, string>(LRUOptions)

export async function getPostBySlug(slug: string, fields: string[] = []) {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = join(postsDirectory, `${realSlug}.md`)
    let fileContents: string

    if (cache.has(fullPath)) {
        fileContents = cache.get(fullPath) || ''
    }else {
        try {
            fileContents = await fs.promises.readFile(fullPath, 'utf8')
            cache.set(fullPath, fileContents)
        } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err)
            throw err
        }
    }

    const { data, content } =  matter(fileContents)

    const items: Items = {}
    items['slug'] = realSlug

    fields.forEach((field) => {
        if (fields.length === 0 || fields.includes(field)) {
            if (field === 'content') {
                items[field] = content
            }

            if (typeof data[field] !== 'undefined') {
                items[field] = data[field] as string
            }
        }
    })
    return items
}

export async function getAllPosts(fields: string[] = []) : Promise<PostOptions[]> {
    const slugs = await getPostSlugs()
    if (slugs.length === 0) {
        return []
    }

    const posts: PostOptions[] = await Promise.all(
        slugs.map(async (slug) => {
            const post = await getPostBySlug(slug, fields);
            return post as PostOptions;
        })
    );

    posts.sort((post1, post2) => {
        if (post1.date && post2.date) {
            return post1.date.localeCompare(post2.date) < 0 ? 1 : -1;
        } else if (post1.date && !post2.date) {
            return -1;  // place posts with a date before posts without a date
        } else if (!post1.date && post2.date) {
            return 1;   // place posts with a date before posts without a date
        } else {
            return 0;  // both posts are without a date, so order doesn't matter
        }
    })

    return posts
}


export async function getLatestPost(fields: string[]) {
    const post = await getAllPosts(fields)
    return post[0]
  }

export async function getPostsForSeed() {
    const slugs = await getPostSlugs()
    if (slugs.length === 0) {
        return []
    }

    const posts: DatabasePost[] = await Promise.all(
        slugs.map(async (slug) => {
            const post = await getPostBySlug(slug, ["title", "slug", "date"])
            return post as DatabasePost
        })
    )
    return posts
}
