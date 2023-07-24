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

export default function validateRecaptcha(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.body as RequestBody;

  const query = new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY as string,
    response: token,
  }).toString();

  fetch(`https://www.google.com/recaptcha/api/siteverify?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data: RecaptchaResponse) => {
    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  })
  .catch((error: Error) => {
    res.status(500).json({ error: error.message });
  });
}
