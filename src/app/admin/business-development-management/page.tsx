"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const BusinessManagement = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/business-development-management/agent");
  }, [router]);

  return null;
};

export default BusinessManagement;
