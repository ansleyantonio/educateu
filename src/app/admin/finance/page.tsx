"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const FinanceManagement = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("finance/certificate-course-fee");
  }, [router]);

  return null;
};

export default FinanceManagement;
