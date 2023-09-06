export async function sendEmail(email: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = 'dasai.sacul@gmail.com'
    const resendAPIKey = process.env.RESEND_API_KEY
    if (!resendAPIKey) {
        console.error('Missing RESEND_API_KEY environment variable.')
        return
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