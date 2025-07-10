// components/ui/LoadingState.tsx

import React from "react";
import { DashboardLayout } from "../users/DashboardLayout";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  useLayout?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  useLayout = true,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const content = (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        <p className={`${textSizes[size]} text-gray-600 font-medium`}>{message}</p>
      </div>
    </div>
  );

  if (useLayout) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
};
