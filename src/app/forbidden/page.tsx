"use client";
import { Button } from "@/components/ui/custom_ui/button";
import Image from "next/image";
import NotFoundImage from "/public/assets/notFound/notfound.svg";
import { useRouter } from "next/navigation";

const ForbiddenPage = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center p-5 h-screen">
      <div className="flex justify-between items-center w-full max-w-[1100px]">
        <div className="flex flex-col gap-4 w-[50%]">
          <h2 className="font-sans font-black tracking-normal leading-none capitalize text-[32px] text-[#000000]">
            Forbidden !
          </h2>
          <p className="font-normal text-[20px]">
            You don’t have permission to access this page.
          </p>
          <Button onClick={() => router.back()} variant="primary">
            Go Back
          </Button>
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
};
export default ForbiddenPage;
