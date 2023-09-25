import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import '~/styles/footnote.css';
import Layout from '~/components/layout';
import Head from 'next/head';

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <>
            <Head>
                <title>Lucas Steinmacher - Software Engineering Blog</title>
                <meta
                    name="description"
                    content="Explore articles by Lucas Steinmacher, a Seattle-based software engineer, covering various topics in technology and development."
                />
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>

            <SessionProvider session={session}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </SessionProvider>
        </>
    );
};

export default api.withTRPC(MyApp);
