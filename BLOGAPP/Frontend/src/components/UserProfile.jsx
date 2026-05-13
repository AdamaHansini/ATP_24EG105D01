import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";

import axios from "axios";
import { useEffect, useState } from "react";

import {
  articleGrid,
  articleCardClass,
  articleTitle,
  ghostBtn,
  loadingClass,
  errorClass,
  timestampClass,
} from "../styles/common.js";

function UserProfile() {
  const logout = useAuth((state) => state.logout);
  const currentUser = useAuth((state) => state.currentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const getArticles = async () => {
      setLoading(true);
      try {
        //read articles of all authors
        let res = await axios.get("http://localhost:5000/user-api/articles", {
          withCredentials: true,
        });
        //update articles state
        if (res.status === 200) {
          setArticles((await res).data.payload);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, []);

  // convert UTC → IST
  const formatDateIST = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const onLogout = async () => {
    await logout();

    navigate("/login");
  };

  const navigateToArticleByID = (articleObj) => {
    navigate(`/article/${articleObj._id}`, {
      state: articleObj,
    });
  };

  if (loading) {
    return <p className={loadingClass}>Loading articles...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* ERROR */}
      {error && <p className={errorClass}>{error}</p>}

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
            <h2 className="text-xl font-semibold text-slate-900">
              {currentUser?.firstName}
            </h2>
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

      {/* ARTICLES SECTION */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Latest Articles
        </h3>

        {/* EMPTY STATE */}
        {articles.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">
            No articles available yet
          </p>
        ) : (
          <div className={articleGrid}>
            {articles.map((articleObj) => (
              <div className={articleCardClass} key={articleObj._id}>
                <div className="flex flex-col h-full">
                  {/* TOP */}
                  <div>
                    <p className={articleTitle}>{articleObj.title}</p>

                    <p className="text-sm text-slate-600 mt-1">
                      {articleObj.content.slice(0, 80)}...
                    </p>

                    <p className={`${timestampClass} mt-2`}>
                      {formatDateIST(articleObj.createdAt)}
                    </p>
                  </div>

                  {/* ACTION */}
                  <button
                    className={`${ghostBtn} mt-auto pt-4`}
                    onClick={() => navigateToArticleByID(articleObj)}
                  >
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
