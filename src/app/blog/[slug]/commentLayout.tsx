import CommentForm from './commentForm';
import CommentList from './commentList';

export function CommentLayout({ slug }: { slug: string }) {
    return (
        <div>
            <section aria-labelledby="comments-heading" className="pt-16">
                <CommentForm  slug={slug}>
                    <CommentList slug={slug} />
                </CommentForm>
            </section>
        </div>
    );
}
