import { type Author } from "./author";

export type Post = {
    title: string;
    date: string;
    slug: string;
    author: Author;
    coverImage: string;
    excerpt: string;
    content: string;
}

export type PostOptions = {
    title?: string,
    date?: string,
    slug?: string,
    content?: string,
    author?: Author,
    coverImage?: string,
    excerpt?: string,
}

export type PostFrontMatter = {
    title: string,
    date: string,
    slug: string,
    author: Author,
    coverImage: string,
    excerpt: string,
}
