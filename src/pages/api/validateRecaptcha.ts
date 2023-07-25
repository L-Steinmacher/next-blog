import { type NextApiRequest, type NextApiResponse } from "next";

interface RequestBody {
   token: string;
}

interface RecaptchaAPIResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
  }

const validateRecaptcha =  (
    req: NextApiRequest,
    res: NextApiResponse,
     ) => {
    const SECRET_KEY = process.env.GOOGLE_RECATPTCHA_SECRET_KEY;

    if (!SECRET_KEY) throw new Error("No secret key provided")

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