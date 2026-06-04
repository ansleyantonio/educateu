"use client";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { ArrowLeft, LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apk_home from "/public/assets/logo/agent/admin/logo.svg";

export default function Home() {
  const data = useAuths();
  const router = useRouter();
  const user = data?.user;
  const portName = data?.user?.portName;
  console.log("user", user);

  return (
    <div className="flex flex-col justify-center items-center space-y-5 w-full h-screen text-3xl font-bold">
      <Image src={apk_home} alt="logo" width={80} height={80} />

      <h1>EducateU</h1>

      <p className="font-serif text-lg font-semibold text-cyan-800">
        Upcoming Features
      </p>
      {user === null ? (
        <>
          <Button onClick={() => router.push("/admin/login")} variant="primary">
            <LogIn />
            Login as Admin
          </Button>

          <Button onClick={() => router.push("/agent/login")} variant="primary">
            <LogIn />
            Login as Agent
          </Button>

          <Button
            onClick={() => router.push("/faculty/login")}
            variant="primary"
          >
            <LogIn />
            Login as Faculty
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => data?.logout(portName)} variant="primary">
            <LogOut />
            Logout
          </Button>

          <Link href={`/${portName}`}>
            <Button variant="primary">
              <ArrowLeft />
              Go Back
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
