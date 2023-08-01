import type { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
  token: string;
}

interface RecaptchaAPIResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

const validateRecaptcha = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const SECRET_KEY = process.env.GOOGLE_RECATPTCHA_SECRET_KEY;

  if (!SECRET_KEY) {
    res.status(500).json({ message: "Server error: No secret key provided" });
    return;
  }

  const { token  } = req.body as RequestBody;
  console.log(`recaptchaResponse: ${token}`)

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`;

    fetch(verifyUrl, { method: "POST" })
    .then((recaptchaRes: Response) => {
      return recaptchaRes.json();
    })
    .then((recaptchaJson: RecaptchaAPIResponse) => {
      res.status(200).json({recaptchaJson });
    })
    .catch((error: Error) => {
      res.status(400).json(error.message);
    })
    .finally(() => {
      res.end();
    });
  };


  export default validateRecaptcha;