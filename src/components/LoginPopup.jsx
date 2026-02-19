import React, { useState, useEffect } from "react";
import api from "../service/api";

const Login = ({ user, setUser, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const [editUsername, setEditUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/150";
    if (typeof imgPath === "string" && imgPath.startsWith("blob:")) return imgPath;
    let cleanPath = imgPath.replace(/\\/g, "/").split("images/").pop();
    return `${import.meta.env.VITE_API_URL}/images/${cleanPath}`;
  };

  useEffect(() => {
    requestAnimationFrame(() => setShowPopup(true));
    if (user) {
      setView("profile");
      setEditUsername(user.username);
    } else {
      setView("login");
    }
  }, [user]);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(() => onClose(), 300);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null); 
    handleClose(); 
    
    window.location.href = "/"; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user || res.data.data;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      if (setUser) setUser(userData);
      handleClose();
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { username, email, password });
      setSuccessMsg("Account created! Please login.");
      setView("login");
      setPassword("");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("username", editUsername);
      if (newPassword && newPassword.trim() !== "") {
        formData.append("password", newPassword);
      }
      if (selectedFile) {
        formData.append("profile", selectedFile);
      }

      const res = await api.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      setSuccessMsg("Profile updated successfully!");
      setNewPassword("");
      setCurrentPassword("");

    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9999] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${showPopup ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl transform transition-all duration-300 relative overflow-hidden ${showPopup ? "scale-100 translate-y-0" : "scale-95 translate-y-10"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors z-10"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {view === "login" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-6">Login to continue</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">{error}</div>}
              {successMsg && <div className="p-3 bg-green-50 text-green-500 text-sm rounded-lg border border-green-100">{successMsg}</div>}
              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all">{loading ? "Logging in..." : "Login"}</button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account? <button onClick={() => setView("register")} className="text-red-600 font-bold hover:underline">Sign Up</button>
            </div>
          </div>
        )}

        {view === "register" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">{error}</div>}
              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all">{loading ? "Creating..." : "Register"}</button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account? <button onClick={() => setView("login")} className="text-red-600 font-bold hover:underline">Login</button>
            </div>
          </div>
        )}

        {view === "profile" && (
          <div className="animate-fade-in flex flex-col h-full">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4 mb-4 mt-2">
              <h2 className="text-3xl font-black text-gray-900 leading-none">Edit Profile</h2>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-500 border border-red-500 px-3 mr-10 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-bold flex items-center gap-1"
              >
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 flex-1">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-2 group cursor-pointer">
                  <img src={preview || getImageUrl(user?.profile || user?.picture)} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:border-red-500 transition-all" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white cursor-pointer">
                    <i className="bi bi-camera-fill text-2xl"></i>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }} />
                  </label>
                </div>
                <p className="text-xs text-gray-400">Click image to change</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Username</label>
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 text-gray-900 outline-none" />
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><i className="bi bi-shield-lock"></i> Change Password</p>
                <div className="space-y-3">
                  <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" />
                  <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none" />
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">{error}</div>}
              {successMsg && <div className="p-3 bg-green-50 text-green-500 text-sm rounded-lg border border-green-100">{successMsg}</div>}

              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all mt-4">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;