// components/ui/ErrorState.tsx

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DashboardLayout } from "../users/DashboardLayout";
import { Button } from "./button";

export interface ErrorStateProps {
  message: string;
  useLayout?: boolean;
  onRetry?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  useLayout = true, 
  onRetry,
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] ${className}`}>
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className={`${sizeClasses[size]} text-red-500`} />
        </div>
        <div className="space-y-2">
          <p className={`${textSizes[size]} text-red-600 font-medium`}>{message}</p>
          <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
        </div>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );

  if (useLayout) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
};
