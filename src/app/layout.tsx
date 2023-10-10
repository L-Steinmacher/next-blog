import '~/styles/globals.css';
import '~/styles/footnote.css';
import { type Metadata } from 'next';
import Layout from '~/app/pageLayout';
import Provider from './context/client-provider';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '~/server/auth';

export const metaData: Metadata = {
    title: 'Lucas Steinmacher - Software Engineering Blog',
    description:
        'Explore articles by Lucas Steinmacher, a Seattle-based software engineer, covering various topics in technology and development.',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session: Session | null = await getServerSession(authOptions);
    return (
        <html lang="en">
            <body>
                <Provider session={session}>
                    <Layout>{children}</Layout>
                </Provider>
            </body>
        </html>
    );
}
