interface RecaptchaResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
}

export default async function validateToken(token: string): Promise<RecaptchaResponse> {
  try {
    const response = await fetch('/api/validateRecaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json() as RecaptchaResponse;
    console.log('Recaptcha response:', data);
    return data
  } catch (error) {
    console.error('Recaptcha validation error:', error);
    return {
      success: false,
      "error-codes": ["validation-error"],
    };
  }
}

