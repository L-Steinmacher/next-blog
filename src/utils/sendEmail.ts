import { Resend } from "resend"
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

export async function sendEmail(email: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = 'info@steinmacher.dev'
    const body = {
        from,
        ...email,
    }
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
    const resend = new Resend(resendAPIKey)
    try {
        const data = await resend.emails.send(body);
        return {
            status: 'success',
            data: data,
        } as const
    } catch (error) {
        console.error(`Error sending email:`, error)
        return {
            status: 'error',
            error: {
                name: 'UnknownError',
                message: 'Unknown Error',
                statusCode: 500,
                cause: error,
            } as ResendError,
        } as const
    }

}

