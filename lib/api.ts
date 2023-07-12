import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

const postsDirectory = join(process.cwd(), '_posts')

export function getPostSlugs() {
    return fs.readdirSync(postsDirectory)
}

type Items = {
    [key: string]: string,
}

type ItemWithDate = Items & {
    date?: string
}


export function getPostBySlug(slug: string, fields: string[] = []) {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = join(postsDirectory, `${realSlug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const items: Items = {}

    fields.forEach((field) => {
        if (field === 'slug') {
            items[field] = realSlug
        }

        if (field === 'content') {
            items[field] = content
        }

        if (typeof data[field] !== 'undefined') {
            items[field] = data[field] as string
        }
    })

    return items
}

export function getAllPosts(fields: string[] = []) {
    const slugs = getPostSlugs()
    if (slugs.length === 0) {
        return []
    }
    const posts : ItemWithDate[] = slugs
        .map((slug) => getPostBySlug(slug, fields) as ItemWithDate)
        // sort posts by date in descending order
        .sort((post1, post2) => {
            if (post1.date && post2.date) {
                return post1.date.localeCompare(post2.date) < 0 ? 1 : -1
            } else if (post1.date && !post2.date) {
                return -1  // place posts with a date before posts without a date
            } else if (!post1.date && post2.date) {
                return 1   // place posts with a date before posts without a date
            } else {
                return 0  // both posts are without a date, so order doesn't matter
            }
        })
    return posts
}