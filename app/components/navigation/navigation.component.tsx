import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-custom-navbar-color p-4">
      <Link href="/" className="text-xl font-bold text-white">
        <div className="flex items-center text-xl font-bold text-white">
          <Image
            src="/hodl-drive.svg"
            alt="HODL Drive Logo"
            width={48}
            height={48}
          />
          HODL Drive
        </div>
      </Link>

      <ul className="flex space-x-4 items-center">
        <li>
          <Link href="/upload" className="text-white hover:underline">
            Upload
          </Link>
        </li>
        <li>
          <Link href="/uploads" className="text-white hover:underline">
            MyDrive
          </Link>
        </li>
        <li>
          <Link href="/keys" className="text-white hover:underline">
            Manage Keys
          </Link>
        </li>
        <li>
          <ConnectButton />
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
