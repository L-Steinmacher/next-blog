import { useSession } from "next-auth/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { type Comment } from "~/interfaces/comments";
import { api } from "~/utils/api";

export default function useController({ slug }: { slug: string}) {
    const { data: commentsData } = api.comments.getCommentsForPost.useQuery({
        slug,
    });

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>('');
    const [comment, setComment] = useState<string>('');
    const [allComments, setAllComments] = useState<Comment[]>(
        commentsData || [],
    );
    const [errors, setErrors] = useState<string[]>([]);
    const [gotime, setGotime] = useState<boolean>(false);

    const { data: sessionData } = useSession();

    const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);
    const userIsLoggedIn = !!sessionData;

    const utils = api.useContext();
    // const createCommentMutation = api.comments.createComment.useMutation();

    useEffect(() => {
        if (commentsData) {
            setAllComments(commentsData);
        }
    }, [commentsData]);

    const addComment = api.comments.createComment.useMutation({
        onSuccess: async () => {
            await utils.comments.getCommentsForPost.refetch({ slug });
            const lastComment = commentContainerRef.current
                ?.lastElementChild as HTMLElement | null;
            if (lastComment) {
                lastComment.scrollIntoView({ behavior: 'smooth' });
            }
        },
        onError: error => {
            console.error('Error adding comment:', error);
            setErrors(prevErrors => [...prevErrors, error.message]);
        },
        onSettled: () => {
            setSubmitting(false);
            setComment('');
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
        addComment,
        allComments,
        comment,
        commentContainerRef,
        errors,
        gotime,
        setComment,
        setGotime,
        setToken,
        setSubmitting,
        submitting,
        token,
        userIsLoggedIn,
    };
}
