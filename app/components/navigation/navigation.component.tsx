import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-red-500 p-4">
      <a className="text-xl font-bold text-white">HODL Drive</a>

      <ul className="flex space-x-4 items-center">
        <li>
          <Link href="/" className="text-white hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/uploads" className="text-white hover:underline">
            Uploads
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
