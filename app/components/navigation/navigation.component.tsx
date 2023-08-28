import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-custom-navbar-color p-4">
      <Link href="/" className="text-xl font-bold text-white">
        HODL Drive
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
