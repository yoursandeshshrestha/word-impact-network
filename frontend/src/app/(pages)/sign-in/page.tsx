"use client";
import SignInPage from "@/components/Auth/SignInPage";
import React, { useState, useEffect } from "react";

function Page() {
  const [isVisible, setIsVisible] = useState(false);

  // Set visibility to true after component mounts for animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <SignInPage isVisible={isVisible} />
    </>
  );
}

export default Page;
