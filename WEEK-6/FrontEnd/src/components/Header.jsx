import { NavLink } from "react-router";

function Header() {
  return (
    <nav className="flex justify-end text-3xl p-7 bg-violet-200 text-white gap-6">
      <NavLink to="" className={({ isActive }) => (isActive ? "text-pink-700" : "")}>
        Home
      </NavLink>
      <NavLink to="create-emp" className={({ isActive }) => (isActive ? "text-pink-700" : "")}>
        CreateEmp
      </NavLink>
      <NavLink to="list" className={({ isActive }) => (isActive ? "text-pink-700" : "")}>
        Employees
      </NavLink>
    </nav>
  );
}

export default Header;