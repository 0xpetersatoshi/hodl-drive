// components/Footer.js or components/Footer.tsx
import React from "react";
import { config } from "@/app/config";

const Footer = () => {
  const githubUsername = config.GITHUB_USERNAME;
  const githubProfileURL = `https://github.com/${githubUsername}`;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 text-center py-4">
      <footer className="bg-gray-900 p-4 text-center">
        <p className="text-sm">
          Made by {githubUsername}
          <a
            href={githubProfileURL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-block align-baseline"
          >
            <i className="fa fa-github" aria-hidden="true"></i>
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Footer;
