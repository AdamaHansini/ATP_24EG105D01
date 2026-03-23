function NavBar() {
  return (
    <div
      className="flex justify-between items-center p-3 bg-gray-400">
      <h1>NavBar</h1>
      <ul className="flex list-none justify-between gap-4">
        <li>Home</li>
         <li>Signup</li>
        <li>Login</li>
      </ul>
    </div>
  );
}

export default NavBar;