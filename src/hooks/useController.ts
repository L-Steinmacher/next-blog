import { useRouter } from "next/navigation";
import { type RefObject, useRef, useState, useEffect } from "react";
import { type Comment } from "~/interfaces/comments";
import { api } from "~/utils/api";

export default function useController({ slug }: {
        slug: string,
    }) {
    const allComments = api.comments.getCommentsForPost.useQuery({ slug }).data || [];
    const router = useRouter();
    const user = api.user.getUserSession.useQuery().data;
    const userIsLoggedIn = !!user;
    const [postComments, setPostComments] = useState<Comment[]>(allComments);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>('');
    const [comment, setComment] = useState<string>('');

    const [errors, setErrors] = useState<string[]>([]);
    const [gotime, setGotime] = useState<boolean>(false);

    const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);

    let newComment: Comment

    const addComment = api.comments.createComment.useMutation({
        onMutate: () => {
            setErrors([]);
            newComment = {
                content: comment,
                createdAt: new Date(),
                id: '',
                postSlug: slug,
                commenter: {
                    id: user?.id || 'default-id',
                    name: user?.name || '',
                    image: user?.image || '',
                },
            };

            setPostComments(prevComments => [...prevComments, newComment]);
        },
        onSuccess:  () => {
            setComment('');
            const lastComment = commentContainerRef.current
            ?.lastElementChild as HTMLElement | null;
            if (lastComment) {
                lastComment.scrollIntoView({ behavior: 'smooth' });
            }
            router.refresh();
        },
        onError: error => {
            setErrors(prevErrors => [...prevErrors, error.message]);
            setPostComments(postComments.filter(comment => comment.id !== newComment.id))
        },
        onSettled: () => {
            setSubmitting(false);
            setGotime(false);
        },
    });

    const submitComment = () => {
        setErrors([]);

        addComment.mutate({
            content: comment,
            postSlug: slug,
            token: token || '',
        });
        router.refresh();
    };

    // First we wait for the recaptcha token to be set, only then will the boolean gotime to be true
    useEffect(() => {
        if (!gotime) {
            return;
        }
        submitComment();
        // linkter wants submitComment in dep array but that causes issues.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gotime]);



    return {
        commentContainerRef,
        postComments,
        setPostComments,
        submitting,
        setSubmitting,
        token,
        setToken,
        comment,
        setComment,
        errors,
        setErrors,
        gotime,
        setGotime,
        user,
        userIsLoggedIn,
    };
}