import { Button } from "@/components/ui/custom_ui/button";
import Image from "next/image";
import Link from "next/link";
import NotFoundImage from "/public/assets/notFound/notfound.svg";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center p-8 h-screen">
      <div className="flex justify-between items-center w-full max-w-[1100px]">
        <div className="flex flex-col gap-4 w-[29%]">
          <h2 className="font-sans font-black tracking-normal leading-none capitalize text-[32px] text-[#000000]">
            Page Not Found
          </h2>
          <p className="font-normal text-[20px]">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <Link href="/">
            <Button variant="primary">Back To Home</Button>
          </Link>
        </div>
        <div className="w-[50%] flex justify-center">
          <Image
            src={NotFoundImage}
            alt="404 Not Found"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
