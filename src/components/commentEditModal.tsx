import { api } from "~/utils/api";

export default function CommentEditModal({ commentId }: { commentId: string}) {
    const utils = api.useContext();
    const translateMutation = api.translations.translateComment.useMutation({
            async onSuccess() {
                await utils.comments.invalidate();
            },
        });

    function handleTranslate() {
        translateMutation.mutate({ commentId, caseType: "spanish"});
    }

    return (
        <>

                <button
                    className=""
                    type="submit"
                    onClick={() => {
                        handleTranslate();
                    }}
                >
                        translate
                </button>
        </>
    );
}
