import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchPopup from "./SearchPopup";
import Login from "./LoginPopup";
import api from "../service/api";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [location]);

  const isAdmin = user && user.email === 'admin@gmail.com';

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const getUserImage = () => {
    if (!user?.profile) return "https://via.placeholder.com/150";
    if (user.profile.startsWith("http")) return user.profile;
    let cleanPath = user.profile.replace(/\\/g, '/').split('images/').pop();
    return `http://localhost:4000/images/${cleanPath}`;
  };

  const menuItems = [
    { name: "Home", link: "/", icon: "bi-house" },
    { name: "Game", link: "/game", icon: "bi-controller" },
    { name: "Community", link: "/community", icon: "bi-people-fill" },
    { name: "Search", link: "", icon: "bi-search" },
    { name: "News", link: "/News", icon: "bi-newspaper" },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Admin", link: "/admin", icon: "bi-shield-lock" });
  }

  const handleSearchClick = (e) => {
    e.preventDefault();
    setIsSearchPopupOpen(true);
    setOpen(false);
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md p-4 flex items-center justify-between border-b border-zinc-800 h-16">
        <div className="flex items-center gap-4">
            <button
            className="text-white hover:text-red-500 transition-colors"
            onClick={() => setOpen(!open)}
            >
            <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-3xl`}></i>
            </button>
            <img src="/images/logo.png" alt="logo" className="w-20 h-20 object-contain" />
        </div>
        {user && (
             <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700">
                <img src={getUserImage()} alt="profile" className="w-full h-full object-cover" />
             </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-64 bg-black text-white flex flex-col border-r border-zinc-800 z-50 transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full pt-20 md:pt-0">
          
          <div className="hidden md:flex flex-col items-center py-8">
            <img src="/images/logo.png" alt="logo" className="w-35 h-35 mb-2 object-contain" />
          </div>

          <div className="px-4 mb-6">
            {user ? (
              <div
                onClick={() => setShowAuthModal(true)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-red-600 transition-all group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-red-600 shrink-0">
                   <img src={getUserImage()} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                   <p className="font-bold text-sm truncate text-white">{user.username}</p>
                   <p className="text-[10px] text-zinc-500 group-hover:text-red-500">Edit Profile</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all"
              >
                <i className="bi bi-box-arrow-in-right"></i> Login
              </button>
            )}
          </div>

          <hr className="border-t border-zinc-900 w-full mb-2" />

          <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;

              if (item.name === "Search") {
                return (
                  <button
                    key={item.name}
                    onClick={handleSearchClick}
                    className={`flex items-center gap-4 text-base rounded-lg py-3 px-4 transition-all w-full text-left
                    ${isActive ? "text-red-500 bg-zinc-900" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"}`}
                  >
                    <i className={`bi ${item.icon} text-xl`}></i>
                    {item.name}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.link}
                  className={`flex items-center gap-4 text-base rounded-lg py-3 px-4 transition-all
                  ${isActive ? "text-red-500 bg-zinc-900 border-r-2 border-red-500" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"}`}
                  onClick={() => setOpen(false)}
                >
                  <i className={`bi ${item.icon} text-xl`}></i>
                  {item.name}
                </Link>
              );
            })}
          </nav>

           <div className="p-6 text-xs text-zinc-600 border-t border-zinc-900 bg-black mt-auto">
              <p className="font-bold text-zinc-500 mb-1">CONTACT US</p>
              <p>Sitthichok kiddee</p>
              <p>061-592-9399</p>
           </div>
        </div>
      </aside>

      {isSearchPopupOpen && (
        <SearchPopup
          onClose={() => setIsSearchPopupOpen(false)}
          gameData={api.get("/games").then(res => res.data)}
        />
      )}

      {showAuthModal && (
        <Login
          user={user}
          setUser={setUser}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;