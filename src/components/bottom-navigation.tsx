"use client";

import { Home, User } from "lucide-react";
import Link from "next/link";
import React from "react";

// HOME, Profile

const BOTTOM_NAVIGATION_BAR_CONTENT = [
  {
    name: "Home",
    icon: <Home />,
    link: "/home",
  },
  {
    name: "Profile",
    icon: <User />,
    link: "/profile",
  },
];

const BottomNavigationBar = () => {
  return (
    <div className="absolute bottom-0 flex justify-between items-center h-5 w-full py-8 gap-2 bg-gray-400">
      {BOTTOM_NAVIGATION_BAR_CONTENT.map((icon) => {
        return (
          <Link href={icon.link}>
            <div className="p-4 w-full">{icon.name}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigationBar;
