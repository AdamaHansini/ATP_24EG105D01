// Shared simple theme for the blog app.

// Layout
export const pageBackground = "bg-[#f7efe5] min-h-screen";
export const pageWrapper = "max-w-5xl mx-auto px-4 sm:px-6 py-10";
export const section = "mb-10";

// Cards
export const cardClass =
  "bg-white border border-slate-200 rounded-lg p-5 shadow-sm";

// Typography
export const pageTitleClass =
  "text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2";
export const headingClass = "text-2xl font-semibold text-slate-900";
export const subHeadingClass = "text-lg font-semibold text-slate-900";
export const bodyText = "text-slate-700 leading-relaxed";
export const mutedText = "text-sm text-slate-500";
export const linkClass = "text-amber-800 hover:text-amber-900";

// Buttons
export const primaryBtn =
  "bg-[#8a5a2b] text-white font-medium px-4 py-2 rounded-md hover:bg-[#6f451f] transition-colors cursor-pointer text-sm";
export const secondaryBtn =
  "border border-[#d7b98d] bg-white text-[#6f451f] font-medium px-4 py-2 rounded-md hover:bg-[#fff8ef] transition-colors cursor-pointer text-sm";
export const ghostBtn =
  "text-amber-800 font-medium hover:text-amber-900 cursor-pointer text-sm";

// Forms
export const formCard =
  "bg-white border border-slate-200 rounded-lg p-6 sm:p-8 w-full max-w-xl mx-auto shadow-sm";
export const formTitle =
  "text-2xl font-semibold text-slate-900 text-center mb-6";
export const labelClass = "text-sm font-medium text-slate-700 mb-1.5 block";
export const inputClass =
  "w-full bg-white border border-[#d7b98d] rounded-md px-3 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#8a5a2b] focus:ring-2 focus:ring-[#ead7bd] transition";
export const formGroup = "mb-4";
export const submitBtn =
  "w-full bg-[#8a5a2b] text-white font-medium py-2.5 rounded-md hover:bg-[#6f451f] transition-colors cursor-pointer mt-2 text-sm";

// Navbar
export const navbarClass =
  "bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center sticky top-0 z-50";
export const navContainerClass =
  "max-w-5xl mx-auto w-full flex items-center justify-between";
export const navBrandClass = "text-lg font-semibold text-slate-900";
export const navLinksClass = "flex items-center gap-4 sm:gap-6";
export const navLinkClass =
  "text-sm text-slate-600 hover:text-slate-900 transition-colors";
export const navLinkActiveClass = "text-sm text-amber-800 font-medium";

// Articles
export const articleGrid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5";
export const articleCardClass =
  "bg-white border border-[#ead7bd] rounded-lg p-5 shadow-sm hover:border-[#c99f63] transition-colors flex flex-col gap-2.5 cursor-pointer";
export const articleTitle = "text-base font-semibold text-slate-900 leading-snug";
export const articleExcerpt = "text-sm text-slate-600 leading-relaxed";
export const articleMeta = "text-xs text-slate-500";
export const articleBody = "text-slate-700 leading-8 text-base max-w-2xl";
export const timestampClass = "text-xs text-slate-500";
export const tagClass =
  "text-xs font-semibold text-amber-800 uppercase tracking-wide w-fit";

// Article page
export const articlePageWrapper = "max-w-3xl mx-auto px-4 sm:px-6 py-10";
export const articleHeader = "mb-8 flex flex-col gap-3";
export const articleCategory =
  "text-xs font-semibold uppercase tracking-wide text-amber-800";
export const articleMainTitle =
  "text-3xl sm:text-4xl font-bold text-slate-900 leading-tight";
export const articleAuthorRow =
  "flex items-center justify-between border-y border-slate-200 py-3 text-sm text-slate-500";
export const authorInfo = "flex items-center gap-2 font-medium text-slate-800";
export const articleContent =
  "text-slate-800 leading-8 text-base whitespace-pre-line mt-6";
export const articleFooter = "border-t border-slate-200 mt-10 pt-5 text-sm text-slate-500";
export const articleActions = "flex gap-3 mt-6";
export const editBtn =
  "bg-[#8a5a2b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#6f451f] transition";
export const deleteBtn =
  "bg-[#b4532a] text-white text-sm px-4 py-2 rounded-md hover:bg-[#913f1d] transition";

// Article status
export const articleStatusActive =
  "absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded bg-green-50 text-green-700";
export const articleStatusDeleted =
  "absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-700";

// Feedback
export const errorClass =
  "bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm";
export const successClass =
  "bg-green-50 text-green-700 border border-green-200 rounded-md px-3 py-2 text-sm";
export const loadingClass = "text-amber-800 text-sm text-center py-10";
export const emptyStateClass = "text-center text-slate-500 py-12 text-sm";

// Comments
export const commentsWrapper = "mt-10 flex flex-col gap-4";
export const commentCard = "bg-white border border-slate-200 rounded-lg p-4";
export const commentHeader = "flex items-center justify-between mb-2";
export const commentUser = "text-sm font-semibold text-slate-900";
export const commentTime = "text-xs text-slate-500";
export const commentText = "text-slate-700 text-sm leading-relaxed mt-1";
export const avatar =
  "w-9 h-9 rounded-full bg-[#f1dfc8] text-[#6f451f] flex items-center justify-center text-sm font-semibold";
export const commentUserRow = "flex items-center gap-3";

// Divider
export const divider = "border-t border-slate-200 my-8";
