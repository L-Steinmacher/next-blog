import { useState } from 'react';
import { TRPCClientError } from '@trpc/client';
import { api } from '~/utils/api';
import { useSession } from 'next-auth/react';

type RecaptchaAPIResponse = {
    recaptchaJson: {
        success: boolean;
        challenge_ts?: string;
        hostname?: string;
        score?: number;
        action?: string;
        'error-codes'?: string[];
    };
}

type CustomErrorShape = {
    code: string;
    message: string;
}

interface tempComment {
    id: string;
    commenter: {
        name: string | null | undefined;
        image: string | null | undefined;
        // Add other properties from sessionData.user if needed
    };
    content: string;
    postSlug: string;
    createdAt: Date;
}

export function useSubmitComment() {
    const [comment, setComment] = useState<string>('');
    const [errors, setErrors] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(null);

    const [tempComment, setTempComment] = useState<tempComment | null>(null);
    const { data: sessionData } = useSession();

    if (!sessionData || !sessionData.user.name) return null

    const addComment = api.comments.createComment.useMutation({
        onMutate({ content, postSlug }) {
            // Predict the successful outcome of the mutation
             setTempComment({
                id: `${Math.random()}`,
                commenter: {
                    ...sessionData.user,
                    name: sessionData.user.name,
                    image: sessionData.user.image,
                },
                content,
                postSlug,
                createdAt: new Date(),
            });

            // Optimistically update the UI to reflect the prediction
            setTempComment(tempComment);
        },
        onSuccess() {
            // On success, we don't need to do anything since we've already updated the UI optimistically
        },
        onError() {
            // On error, roll back the optimistic UI update
            setTempComment(null);
        },
    });


    const submitComment = async (
        content: string,
        postSlug: string,
        commenterId: string,
        onSettled: () => void,
    ) => {
        setErrors([]);
        if (!token) {
            console.error('No recaptcha token');
            return;
        }

        setToken(null);

        if (comment.length < 2) {
            setErrors(['Comment must be at least 2 characters long']);
            return;
        }

        try {
            const response = await fetch('/api/validateRecaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                throw new Error('Failed to validate token');
            }

            const recaptchaData = await response.json() as RecaptchaAPIResponse;

            if (!recaptchaData.recaptchaJson.success) {
                console.error('Recaptcha validation failed:', recaptchaData);
                token && setToken(null);
                return;
            }

            addComment.mutate(
                {
                    content,
                    postSlug,
                },
                {
                    onSettled,
                    onError: error => {
                        if (error instanceof TRPCClientError && error.shape) {
                            const errorShape = error.shape as CustomErrorShape;
                            if (errorShape && errorShape.code === 'TOO_MANY_REQUESTS') {
                                alert("you're doing that too much in five minutes");
                            } else {
                                alert(errorShape.message);
                            }
                        }
                    },
                },
            );
        } catch (error) {
            console.error('Recaptcha validation error:', error);
        }
    };

    return {
        comment,
        setComment,
        errors,
        setErrors,
        token,
        setToken,
        submitComment,
    };
}
