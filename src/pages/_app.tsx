import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import Layout from '~/components/layout';
import Head from 'next/head';
import { ReCaptchaProvider } from 'next-recaptcha-v3';

const ReCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Lucas Steinmachers Blog | Next.js + NextAuth.js </title>
        <meta name="description" content="Personal site of Lucas Steinmacher" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ReCaptchaProvider reCaptchaKey={ReCaptchaKey}>
        <SessionProvider session={session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </ReCaptchaProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
