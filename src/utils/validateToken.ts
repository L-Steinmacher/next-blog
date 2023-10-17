interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}
const BASE_URL = process.env.BASE_URL;
const isDev = process.env.NODE_ENV === 'development';

export default async function validateToken(token: string): Promise<RecaptchaResponse> {
  try {
    const url = BASE_URL || 'http://localhost:3000';
    if (isDev) {
      console.log('Recaptcha validation skipped in development');
      return {
        success: true,
      } as const;
    }

    const response = await fetch(`${url}/api/validateRecaptcha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json() as RecaptchaResponse;
    return data
  } catch (error) {
    console.error('Recaptcha validation error:', error);
    return {
      success: false,
      "error-codes": ["validation-error"],
    };
  }
}

