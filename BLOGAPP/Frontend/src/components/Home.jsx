import { NavLink } from "react-router";
import {
  bodyText,
  pageBackground,
  pageTitleClass,
  pageWrapper,
  primaryBtn,
  secondaryBtn,
} from "../styles/common";

function Home() {
  return (
    <div className={pageBackground}>
      <div className={`${pageWrapper} text-center`}>
        <h1 className={pageTitleClass}>Blog App</h1>
        <h2 className={pageTitleClass}>Read, write, and manage blogs easily.</h2>
        <p className={`${bodyText} max-w-2xl mx-auto mt-4`}>
          A simple blog platform for users, authors, and admins.
        </p>

        
      </div>
    </div>
  );
}

export default Home;
