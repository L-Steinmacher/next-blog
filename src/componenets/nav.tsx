import Socials from "./socials";

export default function Nav() {
   return (
        <div className="container flex flex-col items-center mx-auto pt-4 px-4 max-w-2xl ">
            <div className="flex flex-row  w-full ">
                <ul className="flex flex-row justify-between items-center w-full mx-auto">
                    <li>Home</li>
                    <li>About</li>
                    <li>Projects</li>
                    <li>Contact</li>
                    <li>Blog</li>
                </ul>
            <Socials />
            </div>
        </div>
    );
}