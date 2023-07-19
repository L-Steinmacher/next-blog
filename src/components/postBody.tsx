import markdownStyles from './markdown-styles.module.css';

type Props = {
  content: string;
};

export default function PostBody({ content }: Props) {
  return (
    <div
      className={markdownStyles['markdown']}
      role="article"
      aria-label="Post Content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}