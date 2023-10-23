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

export type CommentSelect = {
  id: string;
  content: string;
  postSlug: string;
  commenter: {
      id: string;
      name: string;
      image: string;
  };
  createdAt: Date;
} | undefined;