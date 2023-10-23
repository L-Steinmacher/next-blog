import '~/styles/globals.css';
import '~/styles/footnote.css';
import { type Metadata } from 'next';
import Layout from '~/app/pageLayout';
import { TRPCReactProvider } from '~/trpc/react';
import { headers } from 'next/headers';


export const metadata: Metadata = {
    title: 'Lucas Steinmacher - Software Engineering Blog',
    description:
        'Explore articles by Lucas Steinmacher, a Seattle-based software engineer, covering various topics in technology and development.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html lang="en">
            <body>
                <TRPCReactProvider  headers={headers()}>
                    <Layout>{children}</Layout>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
