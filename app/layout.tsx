import "./globals.css";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Navbar from "./components/navigation/navigation.component";
import { EncryptionKeyProvider } from "./contexts/keys";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <EncryptionKeyProvider>
            <Navbar />
            {children}
          </EncryptionKeyProvider>
        </Providers>
      </body>
    </html>
  );
}
