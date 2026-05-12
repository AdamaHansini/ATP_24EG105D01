import { useForm } from "react-hook-form";
import {
  pageBackground,
  formGroup,
  errorClass,
  mutedText,
  linkClass,
  loadingClass,
} from "../styles/common";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useEffect } from "react";
import {toast} from 'react-hot-toast'

function Login() {
  const authCard =
    "w-full max-w-sm bg-white border border-[#ead7bd] rounded-md px-6 py-7";
  const authTitle = "text-xl font-semibold text-slate-900 mb-1";
  const authSubtitle = "text-sm text-slate-500 mb-6";
  const authLabel = "text-sm text-slate-700 mb-1 block";
  const authInput =
    "w-full border-0 border-b border-[#d7b98d] bg-transparent px-0 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#8a5a2b] focus:ring-0 focus:outline-none";
  const authButton =
    "w-full bg-[#8a5a2b] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#6f451f] transition-colors";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  //get state from auth store
  const { login, currentUser, loading, error, isAuthenticated } = useAuth((state) => state);
  //on user login
  const onUserLogin = (userCredObj) => {
    //call login() of auth store
    login(userCredObj);
  };

  useEffect(() => {
    //navigation logic
    if (isAuthenticated === true) {
      if (currentUser.role === "USER") {
        //show cuccess toast
        toast.success("Login success and redirecting to User Profile",{duration:2000})
        navigate("/user-profile");
      }
      if (currentUser.role === "AUTHOR") {
         toast.success("Login success and redirecting to Author Profile",{duration:2000})
        navigate("/author-profile");
      }
      if (currentUser.role === "ADMIN") {
         toast.success("Login success and redirecting to Admin Profile",{duration:2000})
        navigate("/admin-profile");
      }
    }
  }, [isAuthenticated]);

  //deal with loading
  if (loading) {
    return <p className={loadingClass}>Loading....</p>;
  }

  return (
    <div className={`${pageBackground} flex items-center justify-center py-14 px-4`}>
      <div className={authCard}>
        {/* Title */}
        <h2 className={authTitle}>Sign in</h2>
        <p className={authSubtitle}>Welcome back to Blog App.</p>

        {/* API error */}
        {error && <p className={errorClass}>{error}</p>}

        <form onSubmit={handleSubmit(onUserLogin)}>
          {/* Email */}
          <div className={formGroup}>
            <label className={authLabel}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={authInput}
              {...register("email", {
                required: "Email is required",

                validate: (value) => value.trim().length > 0 || "Email cannot be empty",
              })}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className={formGroup}>
            <label className={authLabel}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={authInput}
              {...register("password", {
                required: "Password is required",
                validate: (value) => value.trim().length > 0 || "Password cannot be empty",
              })}
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {/* Forgot password */}
          <div className="text-right -mt-2 mb-4">
            <a href="/forgot-password" className={`${linkClass} text-xs`}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button type="submit" className={authButton}>
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className={`${mutedText} text-center mt-5`}>
          Don't have an account?{" "}
          <NavLink to="/register" className={linkClass}>
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
