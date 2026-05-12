import {
  errorClass,
  formGroup,
  pageBackground,
  mutedText,
} from "../styles/common";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

function Register() {
  const authCard =
    "w-full max-w-lg bg-white border border-[#ead7bd] rounded-md px-6 py-7";
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
  const [, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview, setPriview] = useState(null);
  const navigate = useNavigate();

  //When user registration submitted
  const onUserRegister = async (userObj) => {
    console.log(userObj);
    let { profileImageUrl } = userObj;
    // file + userObj -->FormData
    //create ForMData object
    const formData = new FormData();
    //add all user properties and file to this formdata object
    formData.append("role", userObj.role);
    formData.append("firstName", userObj.firstName);
    formData.append("lastName", userObj.lastName);
    formData.append("email", userObj.email);
    formData.append("password", userObj.password);
    //Append if image is exists
    if (profileImageUrl?.[0]) {
      formData.append("profileImageUrl", profileImageUrl[0]);
    }
    console.log(profileImageUrl);
    try {
      //start loading
      setLoading(true);
      //make HTTP POST req to create User in backend
      let res = await axios.post("http://localhost:5000/auth/users", formData, {
        withCredentials: true,
      });

      if (res.status === 201) {
        //navigate to Login
        navigate("/login");
      }
    } catch (err) {
      console.log("err in registration", err);
      setApiError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${pageBackground} flex items-center justify-center py-14 px-4`}
    >
      <div className={authCard}>
        <h2 className={authTitle}>Create account</h2>
        <p className={authSubtitle}>Start reading or publishing articles.</p>

        {/* API Error */}
        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>
          {/* ROLE */}
          <div className="mb-5">
            <p className={authLabel}>Register as</p>

            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="USER"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-[#8a5a2b] w-4 h-4"
                />
                <span className="text-sm">User</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="AUTHOR"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-[#8a5a2b] w-4 h-4"
                />
                <span className="text-sm">Author</span>
              </label>
            </div>

            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div className="border-t border-[#ead7bd] my-6" />

          {/* NAME */}
          <div className="sm:flex gap-4 mb-4">
            <div className="flex-1">
              <label className={authLabel}>First Name</label>
              <input
                type="text"
                className={authInput}
                placeholder="First name"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "At least 2 characters required",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max 30 characters allowed",
                  },
                  validate: (v) => v.trim().length > 0 || "Cannot be empty",
                })}
              />
              {errors.firstName && (
                <p className={errorClass}>{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex-1">
              <label className={authLabel}>Last Name</label>
              <input
                type="text"
                className={authInput}
                placeholder="Last name"
                {...register("lastName", {
                  maxLength: {
                    value: 30,
                    message: "Max 30 characters allowed",
                  },
                })}
              />
              {errors.lastName && (
                <p className={errorClass}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div className={formGroup}>
            <label className={authLabel}>Email</label>
            <input
              type="email"
              className={authInput}
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className={formGroup}>
            <label className={authLabel}>Password</label>
            <input
              type="password"
              className={authInput}
              placeholder="Min. 8 characters"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <p className={errorClass}>{errors.password.message}</p>
            )}
          </div>

          {/* PROFILE IMAGE */}
          <div className={formGroup}>
            <label className={authLabel}>Profile Image</label>

            <input
              type="file"
              className={`${authInput} file:mr-3 file:border-0 file:bg-[#f1dfc8] file:px-3 file:py-1 file:text-sm file:text-[#6f451f]`}
              accept="image/png, image/jpeg"
              {...register("profileImageUrl", {
                validate: {
                  fileType: (files) => {
                    if (!files?.[0]) return true;
                    return (
                      ["image/png", "image/jpeg"].includes(files[0].type) ||
                      "Only JPG/PNG allowed"
                    );
                  },
                  fileSize: (files) => {
                    if (!files?.[0]) return true;
                    return files[0].size <= 2 * 1024 * 1024 || "MAx size 2MB";
                  },
                },
              })}
              onChange={(event) => {
                let file = event.target.files[0];
                if (file) {
                  setPriview(URL.createObjectURL(file));
                }
              }}
            />

            {errors.profileImageUrl && (
              <p className={errorClass}>{errors.profileImageUrl.message}</p>
            )}
            {/* image preview */}
            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button type="submit" className={authButton}>
            Create Account
          </button>
        </form>

        {/* FOOTER */}
        <p className={`${mutedText} text-center mt-5`}>
          Already have an account?{" "}
          <NavLink to="/login" className="text-amber-800 font-medium">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
