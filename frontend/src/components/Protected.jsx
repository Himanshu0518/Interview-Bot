import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    // Ensure navigation happens only if auth doesn't match
    if (authentication && !authStatus) {
      // Save the location they were trying to access
      navigate("/login", { state: { from: location }, replace: true });
    } else if (!authentication && authStatus) {
      navigate("/");
    }
    setLoader(false);
  }, [authStatus, navigate, authentication, location]);

  // While checking auth, show loader
  if (loader) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
