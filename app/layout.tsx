import "./globals.css";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { EncryptionKeyProvider } from "./contexts/keys";
import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/app-header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <EncryptionKeyProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <AppHeader />
                    <main className="flex-1 p-4">{children}</main>
                  </SidebarInset>
                </SidebarProvider>
              </TooltipProvider>
            </EncryptionKeyProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
