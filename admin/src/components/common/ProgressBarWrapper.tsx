"use client";

import { useSelector } from "react-redux";
import { selectLoading } from "@/redux/features/loadingSlice";
import ProgressBar from "./ProgressBar";

const ProgressBarWrapper = () => {
  const isLoading = useSelector(selectLoading);
  return <ProgressBar isLoading={isLoading} />;
};

export default ProgressBarWrapper;
