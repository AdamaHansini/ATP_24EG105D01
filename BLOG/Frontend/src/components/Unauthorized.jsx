

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

const Unauthorized = ({ delay = 5000 }) => {
  console.log("unauthorized");
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirectTo from state
  const redirectTo = location.state?.redirectTo || "/login";
  console.log("redirect",redirectTo)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, delay);

    return () => clearTimeout(timer);
  }, [navigate, redirectTo, delay]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f7efe5]">
      <h1 className="text-4xl font-bold text-[#b4532a] mb-4">403 - Unauthorized</h1>
      <p className="text-lg text-gray-700 mb-2">You don’t have permission to access this page.</p>
      <p className="text-sm text-slate-500">Redirecting...</p>
    </div>
  );
};

export default Unauthorized;
