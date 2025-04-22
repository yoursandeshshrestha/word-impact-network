"use client";
import ApplyPage from "@/components/Auth/ApplyPage";
import React, { useState, useEffect } from "react";

function Page() {
  const [isVisible, setIsVisible] = useState(false);

  // Set visibility to true after component mounts for animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <ApplyPage isVisible={isVisible} />
    </>
  );
}

export default Page;
