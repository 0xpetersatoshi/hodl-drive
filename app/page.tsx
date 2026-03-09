"use client";

import Link from "next/link";
import { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { AlertTriangle, KeyRound, Wallet, Upload, HardDrive } from "lucide-react";

const steps = [
  {
    title: "Step 1: Manage Keys",
    icon: KeyRound,
    description: "Create or upload your existing encryption key.",
    linkText: "Manage Keys",
    href: "/keys",
  },
  {
    title: "Step 2: Connect Wallet",
    icon: Wallet,
    description:
      "Connect your Ethereum wallet to associate your file uploads with your wallet address.",
    linkText: null,
    href: null,
  },
  {
    title: "Step 3: Upload File",
    icon: Upload,
    description:
      "Upload a file. Your files will be client-side encrypted and securely stored on Arweave.",
    linkText: "Upload",
    href: "/upload",
  },
  {
    title: "Step 4: Access MyDrive",
    icon: HardDrive,
    description: "Access and manage your uploaded files.",
    linkText: "MyDrive",
    href: "/uploads",
  },
];

const Home: FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This app is experimental and still in development. App is currently
          using Bundlr&#39;s devnet network so uploads are not permanent!
        </AlertDescription>
      </Alert>

      <section className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Welcome to HODL Drive</h1>
        <p className="text-xl text-muted-foreground">
          Your decentralized storage solution, powered by Arweave.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-semibold mb-6">How to Use HODL Drive</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-semibold leading-none">
                  <step.icon className="h-5 w-5" />
                  {step.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {step.description}
                </p>
                {step.href && step.linkText && (
                  <Button variant="link" asChild>
                    <Link href={step.href}>{step.linkText}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
