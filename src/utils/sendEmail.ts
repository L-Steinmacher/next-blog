import { z } from "zod"

const resendErrorSchema = z.union([
    z.object({
        name: z.string(),
        message: z.string(),
        statusCode: z.number(),
    }),
    z.object({
        name: z.literal('UnknownError'),
        message: z.literal('Unknown Error'),
        statusCode: z.literal(500),
        cause: z.any(),
    }),
])
type ResendError = z.infer<typeof resendErrorSchema>

const resendSuccessSchema = z.object({
    id: z.string(),
})

export async function sendEmail(email: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = 'Panz <panz@steinmacher.dev>'
    const resendAPIKey = process.env.RESEND_API_KEY
    if (!resendAPIKey) {
        console.error(`RESEND_API_KEY not set and we're not in mocks mode.`)
        console.error(
            `To send emails, set the RESEND_API_KEY environment variable.`,
        )
        console.error(`Would have sent the following email:`, JSON.stringify(email))

        return {
            status: 'success',
            data: { id: 'mocked' },
        } as const
    }
    const res = await fetch('https://api.resend.io/emails', {
        method: 'POST',
        body: JSON.stringify({
            from,
            ...email,
        }),
        headers: {
            Authorization: `Bearer ${resendAPIKey}`,
            'Content-Type': 'application/json',
        },
    })
    const data: unknown = await res.json();
    const parsedData = resendSuccessSchema.safeParse(data)

	if (res.ok && parsedData.success) {
		return {
			status: 'success',
			data: parsedData,
		} as const
	} else {
		const parseResult = resendErrorSchema.safeParse(data)
		if (parseResult.success) {
			return {
				status: 'error',
				error: parseResult.data,
			} as const
		} else {
			return {
				status: 'error',
				error: {
					name: 'UnknownError',
					message: 'Unknown Error',
					statusCode: 500,
					cause: data,
				} satisfies ResendError,
			} as const
		}
	}
}
