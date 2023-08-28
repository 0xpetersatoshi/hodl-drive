import React from "react";

type ErrorProps = {
  message: string;
};

const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <section className="bg-red-600 text-white p-4 rounded-lg mb-2 mx-auto max-w-full">
      <h2 className="font-bold text-2xl mb-2">Error:</h2>
      <p className="text-lg">{message}</p>
    </section>
  );
};

export default Error;
