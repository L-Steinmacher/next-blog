import Link from "next/link";
import Socials from "./socials";
import { useState } from "react";

export default function Footer() {
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <footer className="py-4 pt-16">
      <hr className="w-2/3 mx-auto border-b-3 border-gray-500" />
      <div className="container flex flex-col w-full items-center mx-auto max-w-2xl">
        <div className="flex flex-row w-full py-6">
          <div className="flex-1">
            <ul className="flex flex-col space-y-2">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <Socials direction="column" />
          </div>
          <div className="flex-1 flex justify-center flex-col mx-auto items-center">
            <p>
              made with ☕️ by {" "}
              <span
                className="hover:text-[#472C4C] relative animate-pulse"
                onMouseEnter={handleHover}
                onMouseLeave={handleMouseLeave}
              >
                Panz
                {isHovered && (
                  <span className="absolute left-1/2 transform -translate-x-1/2 mt-1 text-sm translate-y-4">
                    Thats Me!
                  </span>
                )}
              </span>
            </p>
            <p>© 2023</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
