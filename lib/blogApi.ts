import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { type PostOptions } from '../src/interfaces/post'
import { LRUCache } from 'lru-cache'

const postsDirectory = join(process.cwd(), '/src/_posts')

export async function getPostSlugs() {
    return await fs.promises.readdir(postsDirectory)
}

const ttl = 1000 * 60 * 60 * 24 * 30 // 30 days

const LRUOptions = {
    max: 100,
    ttl,
}

const cache = new LRUCache<string, string>(LRUOptions)

export async function getPostBySlug<T extends keyof PostOptions>(slug: string, fields: T[]): Promise<Pick<PostOptions, T>> {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = join(postsDirectory, `${realSlug}.md`)
    let fileContents: string

    if (cache.has(fullPath)) {
        fileContents = cache.get(fullPath) ?? ''
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

    const items: Partial<PostOptions> = {slug: realSlug}

    fields.forEach((field) => {
        if (fields.length === 0 || fields.includes(field)) {
            if (field === 'content') {
                items[field] = content || ""
            } else if (data[field]) {
                items[field] = data[field] as string
            }
        }
    })
    return items as Pick<PostOptions, T>
}

export async function getAllPosts <T extends keyof PostOptions> (fields: T[] = []) : Promise<Array<Pick<PostOptions, T>>> {
    const slugs = await getPostSlugs()
    if (slugs.length === 0) {
        return []
    }

    const posts = await Promise.all(
        slugs.map(async (slug) => {
            const post = await getPostBySlug(slug, fields);
            return post ;
        })
    );

    if((fields as Array<keyof PostOptions>).includes('date')) {
        posts.sort((post1, post2) => {
            const date1 = (post1 as Pick<PostOptions, 'date'>).date;
            const date2 = (post2 as Pick<PostOptions, 'date'>).date;

            if (date1 && date2) {
                return date1.localeCompare(date2) < 0 ? 1 : -1;
            } else if (date1 && !date2) {
                return -1;  // place posts with a date before posts without a date
            } else if (!date1 && date2) {
                return 1;   // place posts with a date before posts without a date
            } else {
                return 0;  // both posts are without a date, so order doesn't matter
            }
        })
    }

    return posts as Array<Pick<PostOptions, T>>
}