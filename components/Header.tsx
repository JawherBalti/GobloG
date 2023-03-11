import Link from "next/link";
import React from "react";

interface Props {
  handleClick?: React.MouseEventHandler;
}

function Header(props: Props) {
  return (
    <header className="flex justify-between p-5 w-full mx-auto bg-pink-800">
      <Link href="/">
        <img
          className="w-44 h-16 object-contain cursor-pointer"
          src="/goblog.png"
          alt="GobloG"
        />
      </Link>

      <div className="flex justify-between space-x-5">
        <div className="flex items-center space-x-5 text-white">
          <a
            className="text-xs sm:text-sm lg:text-base font-bold px-4 py-1 rounded-full border-white border-2 hover:text-pink-800 cursor-pointer transition ease-in-out delay-100 hover:bg-white duration-500"
            target="_blank"
            href="https://goblogsanity.sanity.studio/desk"
            rel="noopener noreferrer"
          >
            Create Blogs
          </a>
        </div>
        <div className="flex items-center space-x-5 text-white">
          <h3
            onClick={props.handleClick}
            className="text-xs sm:text-sm lg:text-base font-bold px-4 py-1 rounded-full border-white border-2 hover:text-pink-800 cursor-pointer transition ease-in-out delay-100 hover:bg-white duration-500"
          >
            Start Reading
          </h3>
        </div>
      </div>
    </header>
  );
}

export default Header;
