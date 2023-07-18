import Footer from "./footer";
import Nav from "./nav";

type Props = {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <div className="flex flex-col min-h-screen justify-between mx-auto bg-[#f7f7f7]">
            <Nav />
            <div className="flex-grow w-2/3 items-center mx-auto max-w-4xl">
                {children}
            </div>
            <Footer />
        </div>
    )
}