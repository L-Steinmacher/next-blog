import { type Author } from "./author";

export type PostOptions = {
    title?: string,
    date?: string,
    slug?: string,
    content?: string,
    author?: string | Author,
    coverImage?: string,
    excerpt?: string,
}

export type NonNullablePostOptions = NonNullable<PostOptions>;
