import "./globals.css";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Navbar from "./components/navigation/navigation.component";
import Footer from "./components/footer/footer.component";
import { EncryptionKeyProvider } from "./contexts/keys";
import "font-awesome/css/font-awesome.min.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <EncryptionKeyProvider>
            <Navbar />
            <div className="flex-grow">{children}</div>
            <Footer />
          </EncryptionKeyProvider>
        </Providers>
      </body>
    </html>
  );
}
