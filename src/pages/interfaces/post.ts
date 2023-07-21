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
    author?: string | Author,
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

export type DatabasePost = {
    title: string;
    date: string;
    slug: string;
}

export type LatestPost = {
    slug: string;
    date: string;
    title: string;
    excerpt: string;
  };

export type NonNullablePostOptions = NonNullable<PostOptions>;