import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingSpinner from "./loaders/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute() {
  const [loadingTime, setLoadingTime] = useState(0);
  const {checkToken, isAuthenticated} = useAuth();


  useEffect(() => {

    checkToken();
  }, []);

  useEffect(() => {
    let timerId: number | undefined;
    if (isAuthenticated === null) {
      timerId = window.setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <LoadingSpinner message="Checking Authentication" elapsedSeconds={loadingTime} />
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
