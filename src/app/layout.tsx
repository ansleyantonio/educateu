import TanStackQueryWrapper from "@/components/tan_stack_query/query_wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import Providers from "@/components/ProgressBar/progressBar";
import { UserAuthProvider } from "@/hooks/userContext";
import localFont from "next/font/local";
import { BreadcrumbProvider } from "./hook/breadcrumb/useBreadcrumb";

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Inter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Inter-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

const adventPro = localFont({
  src: [
    {
      path: "./fonts/AdventPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/AdventPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/AdventPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/AdventPro-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-adentPro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EducateU",
    template: "EducateU | %s",
  },
  // title: "EducateU",
  description: "EducateU System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable}  ${adventPro.variable}`}
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* // hot Toaster  */}
        <Toaster />
        <BreadcrumbProvider>
          <TanStackQueryWrapper>
            <UserAuthProvider>
              {/* <AuthProvider> */}
              <TooltipProvider>
                <Providers>
                  <AntdRegistry>{children}</AntdRegistry>
                </Providers>
              </TooltipProvider>
              {/* </AuthProvider> */}
            </UserAuthProvider>
          </TanStackQueryWrapper>
        </BreadcrumbProvider>
        {/* custom authProvider   */}
      </body>
    </html>
  );
}
