// app/login/UnauthorizedAlert.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UnauthorizedAlert() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("unauthorized") === "1") {
      alert("⚠️ You must log in to access that page!");
    }
  }, [searchParams]);

  return null; // this component does not render anything
}
