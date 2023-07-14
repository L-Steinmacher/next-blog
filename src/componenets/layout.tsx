import Footer from "./footer";
import Nav from "./nav";

type Props = {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow bg-[#f7f7f7]">
                <Nav />
                {children}
                <Footer />
            </div>
        </div>
    )
}