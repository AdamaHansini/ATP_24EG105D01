import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

import { pageWrapper, navLinkClass, divider } from "../styles/common";

function AuthorProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  //call t6his function on logout
  const onLogout = async () => {
    //call login route
    await logout();
    //navigate to login component
    navigate("/login");
  };

  return (
    <div className={pageWrapper}>
      {/* PROFILE HEADER */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-8 shadow-sm flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {currentUser?.profileImageUrl ? (
            <img
              src={currentUser.profileImageUrl}
              className="w-14 h-14 rounded-full object-cover border"
              alt="profile"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#f1dfc8] text-[#6f451f] flex items-center justify-center text-xl font-semibold">
              {currentUser?.firstName?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name */}
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="text-xl font-semibold text-slate-900">{currentUser?.firstName}</h2>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          className="bg-[#b4532a] text-white text-sm px-4 py-2 rounded-md hover:bg-[#913f1d] transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* NAVIGATION (TABS STYLE) */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <NavLink
          to="articles"
          className={({ isActive }) =>
            isActive
              ? "bg-white px-4 py-2 rounded-md text-amber-800 text-sm font-medium shadow-sm"
              : `${navLinkClass} px-5 py-2`
          }
        >
          Articles
        </NavLink>

        <NavLink
          to="write-article"
          className={({ isActive }) =>
            isActive
              ? "bg-white px-4 py-2 rounded-md text-amber-800 text-sm font-medium shadow-sm"
              : `${navLinkClass} px-5 py-2`
          }
        >
          Write Article
        </NavLink>
      </div>

      <div className={divider}></div>

      {/* CONTENT */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthorProfile;
