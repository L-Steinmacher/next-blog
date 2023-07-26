export type Commenter = {
    id: string;
    name: string | null;
    image: string | null;
  };

export type Comment = {
    id: string;
    content: string;
    postSlug: string;
    commenter: Commenter;
    createdAt: Date;
  };