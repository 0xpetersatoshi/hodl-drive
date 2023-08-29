"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between bg-custom-navbar-color p-4">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center text-xl font-bold text-white cursor-pointer">
            <Image
              src="/hodl-drive.svg"
              alt="HODL Drive Logo"
              width={48}
              height={48}
            />
            HODL Drive
          </div>
        </Link>
      </div>

      {/* Hamburger */}
      <div className="lg:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          <i className="fa fa-bars text-white"></i>
        </button>
      </div>

      {/* Menu */}
      <ul
        className={`${
          isOpen ? "block" : "hidden"
        } lg:flex lg:space-x-4 w-full lg:w-auto`}
      >
        <li className="lg:mt-0 mt-2 text-white hover:underline">
          <Link href="/upload">Upload</Link>
        </li>
        <li className="lg:mt-0 mt-2 text-white hover:underline">
          <Link href="/uploads">MyDrive</Link>
        </li>
        <li className="lg:mt-0 mt-2 text-white hover:underline">
          <Link href="/keys">Manage Keys</Link>
        </li>
        <li className="lg:mt-0 mt-2">
          <ConnectButton />
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
