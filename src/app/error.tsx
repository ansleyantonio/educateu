"use client"; // Error components must be Client Components

import ErrorPage from "@/components/common/ErrorPage/ErrorPage";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen flex justify-center items-center ">
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}
