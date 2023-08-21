import Footer from "./footer";
import Nav from "./nav";

type Props = {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <div className="flex flex-col min-h-screen justify-between mx-auto bg-[#f7f7f7]">
            <Nav />
            <div className="flex-grow md:w-2/3 w-4/5 items-center mx-auto max-w-4xl">
                {children}
            </div>
            <Footer />
        </div>
    )
}