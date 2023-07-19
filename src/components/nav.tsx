import Link from "next/link";
import Socials from "./socials";

export default function Nav() {
   return (
        <div className="container flex flex-col items-center mx-auto pt-4 px-4 max-w-2xl ">
            <div className="flex flex-row  w-full ">
                <ul className="flex flex-row justify-between items-center w-full mx-auto pr-4">
                    <Link href="/">Home</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>

                </ul>
            <Socials direction="row" />
            </div>
        </div>
    );
}