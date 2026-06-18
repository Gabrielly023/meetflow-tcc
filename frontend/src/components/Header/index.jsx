import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = ({
  title = "MeetFlow",
  links = [
    { label: "Home", href: "/" },
    { label: "Login", href: "/login" },
  ],
  user,
  onLogout,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="text-gray-400 bg-[linear-gradient(to_right,#fb923c_0%,#ec4899_25%,#f472b6_30%,#a855f7_60%,#60a5fa_70%,#38bdf8_85%,#22c55e_100%)] body-font">
      <div className="w-full flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          to="/"
          className="flex title-font font-medium items-center text-white mb-4 md:mb-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          >
            <path d="M16 44 V20 L32 34 L48 20 V44" />
          </svg>
          <span className="ml-3 text-xl">{title}</span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="mr-5 text-white hover:text-violet-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="flex items-center">
            <span className="text-white mr-4">{user.name}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

//roxo rosa laranja verde
