import type { NextApiRequest, NextApiResponse } from 'next';

interface RequestBody {
    token: string;
}

interface RecaptchaResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
}

export default async function validateToken(token: string): Promise<boolean> {
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

    const data = await response.json() as RecaptchaResponse;

    if (!data.success) {
      // Token validation failed
      console.error('Recaptcha validation failed:', data);
      return false;
    } else {
      // Token is valid
      console.log('Recaptcha validated successfully');
      return true;
    }
  } catch (error) {
    console.error('Recaptcha validation error:', error);
    return false;
  }
}
