"use client";

import ErrorPage from "@/components/common/ErrorPage/ErrorPage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="h-screen flex justify-center items-center ">
          <ErrorPage error={error} reset={reset} />
        </div>
        {/* <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
        <div className="justify-center items-center p-3">{error?.message}</div> */}
      </body>
    </html>
  );
}
