import React from "react";
import { LoadingState, LoadingStateProps } from "./LoadingState";
import { ErrorState, ErrorStateProps } from "./ErrorState";

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  loadingProps?: Partial<LoadingStateProps>;
  errorProps?: Partial<ErrorStateProps>;
  children: React.ReactNode;
}

export const PageState: React.FC<PageStateProps> = ({
  loading = false,
  error = null,
  loadingProps = {},
  errorProps = {},
  children
}) => {
  if (loading) {
    return <LoadingState {...loadingProps} />;
  }

  if (error) {
    return <ErrorState message={error} {...errorProps} />;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const PageLoading: React.FC<LoadingStateProps> = (props) => (
  <LoadingState {...props} />
);

export const PageError: React.FC<ErrorStateProps> = (props) => (
  <ErrorState {...props} />
); 