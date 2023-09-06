export async function sendEmail(email: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = 'dasai.sacul@gmail.com'
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
    try {
        const res = fetch('https://api.resend.io/emails', {
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
        return res
    } catch (error) {
        console.error('Error sending email:', error)
        return error
    }

}