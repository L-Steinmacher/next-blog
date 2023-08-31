import { Analytics } from '@vercel/analytics/react';
import Footer from './footer';
import Nav from './nav';

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <body>
            <div className="mx-auto flex min-h-screen flex-col justify-between bg-[#f7f7f7]">
                <Nav />
                <div className="mx-auto w-4/5 max-w-4xl flex-grow items-center md:w-2/3">
                    {children}
                    <Analytics />
                </div>
                <Footer />
            </div>
        </body>
    );
}
