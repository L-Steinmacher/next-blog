import Nav from "./nav";

type Props = {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <div className="container mx-auto">
            <Nav />
            {children}
        </div>
    )
}