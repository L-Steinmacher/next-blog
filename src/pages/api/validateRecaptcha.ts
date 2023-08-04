import type { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
  token: string;
}

interface RecaptchaAPIResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

const SECRET_KEY = process.env.GOOGLE_RECATPTCHA_SECRET_KEY;

const validateRecaptcha = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!SECRET_KEY) {
    res.status(500).json({ message: "Server error: No secret key provided" });
    return;
  }

  const { token } = req.body as RequestBody;
  console.log(`###################### ValidateToken: ${token}`);

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`;

  try {
    const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
    const recaptchaJson = await recaptchaRes.json() as RecaptchaAPIResponse;

    if (recaptchaJson.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, errors: recaptchaJson["error-codes"] });
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types here if needed
      res.status(500).json(error.message);
    } else {
      // Handle other unknown errors here
      res.status(500).json("Unknown error occurred");
    }
  }
};

export default validateRecaptcha;
