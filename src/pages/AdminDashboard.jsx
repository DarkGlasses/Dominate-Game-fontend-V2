import React, { useState, useEffect } from "react";
import api from "../service/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("games");
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [preview, setPreview] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Form State รวมสำหรับทุกประเภท
  const initialFormState = {
    id: null,
    // Games
    title: "", developer: "", publisher: "", rating: "", releaseDate: "", genre: "", platform: "", detail: "",
    // News & Community
    headline: "", content: "",
    // Users
    username: "", email: "", password: "", role: "user",
    // Images
    picture: null, existingPicture: null,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
    setView("list");
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Endpoint map: games -> /games, news -> /news, users -> /users, community -> /community
      const endpoint = `/${activeTab}`;
      const res = await api.get(endpoint);
      
      // รองรับโครงสร้างข้อมูลที่อาจจะต่างกัน (res.data หรือ res.data.data)
      const items = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDataList(items);
    } catch (err) {
      console.error("Fetch error:", err);
      // กรณี Error 404 หรืออื่นๆ ให้ set เป็น array ว่าง
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/150?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;
    let clean = imgPath.replace(/\\/g, "/").split("images/").pop();
    return `${import.meta.env.VITE_API_URL}/images/${clean}`;
  };

  // --- Selection Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(dataList.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- Delete Logic ---
  const handleDelete = async (id) => {
    if (!window.confirm(`⚠️ Delete this item?`)) return;
    await performDelete([id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`⚠️ Are you sure you want to delete ${selectedIds.length} items?`)) return;
    await performDelete(selectedIds);
  };

  const performDelete = async (idsToDelete) => {
    setLoading(true);
    try {
      const endpointBase = `/${activeTab}`;
      await Promise.all(
        idsToDelete.map((id) => api.delete(`${endpointBase}/${id}`))
      );
      alert("Deleted successfully ✅");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Some items could not be deleted ❌");
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  // --- Edit & Form Logic ---
  const handleEdit = (item) => {
    // Reset form first
    const newForm = { ...initialFormState, id: item.id };

    if (activeTab === "users") {
      newForm.username = item.username || "";
      newForm.email = item.email || "";
      newForm.role = item.role || "user";
      newForm.existingPicture = item.profile;
      setPreview(getImageUrl(item.profile));
    } else {
      // Games / News
      newForm.title = item.title || "";
      newForm.developer = item.developer || "";
      newForm.publisher = item.publisher || "";
      newForm.rating = item.rating || "";
      newForm.releaseDate = item.releaseDate ? new Date(item.releaseDate).toISOString().split("T")[0] : "";
      newForm.genre = item.genre ? (typeof item.genre === 'string' ? item.genre : JSON.stringify(item.genre)) : "";
      newForm.platform = item.platform ? (typeof item.platform === 'string' ? item.platform : JSON.stringify(item.platform)) : "";
      newForm.detail = item.detail || "";
      
      newForm.headline = item.headline || "";
      newForm.content = item.content || "";
      
      newForm.existingPicture = item.picture || item.image;
      setPreview(getImageUrl(item.picture || item.image));
    }

    setFormData(newForm);
    setView("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      const endpoint = `/${activeTab}`;

      if (activeTab === "users") {
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("role", formData.role);
        if (formData.password) data.append("password", formData.password);
        if (formData.picture) data.append("profile", formData.picture); // Backend User ใช้ 'profile'
      } 
      else if (activeTab === "games") {
        data.append("title", formData.title);
        data.append("developer", formData.developer);
        data.append("publisher", formData.publisher);
        data.append("rating", formData.rating);
        data.append("detail", formData.detail);
        if (formData.releaseDate) data.append("releaseDate", new Date(formData.releaseDate).toISOString());
        data.append("genre", formData.genre || "[]");
        data.append("platform", formData.platform || "[]");
        if (formData.picture) data.append("picture", formData.picture);
      } 
      else if (activeTab === "news") {
        data.append("headline", formData.headline);
        data.append("content", formData.content);
        if (formData.picture) data.append("picture", formData.picture);
      }

      if (formData.id) {
        await api.put(`${endpoint}/${formData.id}`, data, { headers: { "Content-Type": "multipart/form-data" }});
        alert(`Updated ${activeTab} successfully! 🎉`);
      } else {
        await api.post(endpoint, data, { headers: { "Content-Type": "multipart/form-data" }});
        alert(`Created new ${activeTab} successfully! 🎉`);
      }

      setFormData(initialFormState);
      setPreview(null);
      fetchData();
      setView("list");
    } catch (err) {
      console.error(err);
      alert("Operation failed ❌: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-[100px] px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <span className="text-red-600 text-4xl">Admin</span> Dashboard
          </h1>
          <div className="bg-zinc-900 p-1 rounded-xl flex overflow-x-auto custom-scrollbar">
            {["games", "news", "community", "users"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-zinc-300 uppercase tracking-wide">Manage {activeTab}</h2>
                {selectedIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg text-sm font-bold transition-all">
                    <i className="bi bi-trash-fill mr-1"></i> Delete ({selectedIds.length})
                    </button>
                )}
            </div>
            
            {view === "list" && activeTab !== "community" && (
                <button onClick={() => { setFormData(initialFormState); setPreview(null); setView("form"); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
                  <i className="bi bi-plus-lg"></i> Add New
                </button>
            )}
            {view === "form" && (
                <button onClick={() => setView("list")} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
                    <i className="bi bi-arrow-left"></i> Back
                </button>
            )}
          </div>

          {/* --- List View --- */}
          {view === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 text-zinc-400 border-b border-zinc-700 text-sm uppercase">
                    <th className="p-4 w-10"><input type="checkbox" className="accent-red-600" checked={dataList.length > 0 && selectedIds.length === dataList.length} onChange={handleSelectAll} /></th>
                    <th className="p-4">Image/Profile</th>
                    <th className="p-4">{activeTab === "users" ? "Username" : "Title / Headline"}</th>
                    <th className="p-4">{activeTab === "users" ? "Role" : activeTab === "games" ? "Rating" : "Detail"}</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {dataList.map((item) => (
                    <tr key={item.id} className={`transition-colors ${selectedIds.includes(item.id) ? "bg-red-900/10" : "hover:bg-zinc-800/50"}`}>
                      <td className="p-4"><input type="checkbox" className="accent-red-600" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} /></td>
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black border border-zinc-700">
                          <img src={getImageUrl(item.picture || item.image || item.profile)} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-200">{item.title || item.headline || item.username || "No Title"}</div>
                        <div className="text-xs text-zinc-500">{item.email || (item.content ? item.content.substring(0, 40) + "..." : "")}</div>
                      </td>
                      <td className="p-4">
                        {activeTab === "users" ? (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.role === 'admin' ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>{item.role}</span>
                        ) : activeTab === "games" ? (
                            <span className="text-yellow-500 font-bold">{item.rating || "-"}</span>
                        ) : (
                            <span className="text-xs text-zinc-500">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {activeTab !== "community" && (
                          <button onClick={() => handleEdit(item)} className="text-blue-400 hover:bg-blue-900/30 p-2 rounded-lg"><i className="bi bi-pencil-square"></i></button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-900/30 p-2 rounded-lg"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                  {dataList.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-zinc-500">No data found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* --- Form View --- */}
          {view === "form" && activeTab !== "community" && (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto animate-fade-in space-y-6">
              
              {/* Image Upload Area */}
              <div className="flex flex-col items-center">
                <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden border-2 border-dashed border-zinc-700 hover:border-red-600 transition-colors group">
                  <img src={preview || "https://via.placeholder.com/400x300?text=Upload+Image"} alt="Preview" className={`w-full h-full object-cover ${!preview && "opacity-30 p-20"}`} />
                  <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/60 transition-opacity text-white font-bold">
                    <i className="bi bi-cloud-upload text-4xl mb-2 text-red-500"></i>
                    <span>Click to Upload</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setFormData({ ...formData, picture: file }); setPreview(URL.createObjectURL(file)); }}} />
                  </label>
                </div>
              </div>

              {/* Conditional Inputs */}
              {activeTab === "users" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><label className="label">Username</label><input type="text" required className="input-field" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} /></div>
                  <div><label className="label">Email</label><input type="email" required className="input-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Password {formData.id && <span className="text-xs text-zinc-500 font-normal">(Leave blank to keep current)</span>}</label>
                    <input type="password" required={!formData.id} className="input-field" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              ) : activeTab === "games" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="label">Title</label><input type="text" required className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                    <div><label className="label">Developer</label><input type="text" className="input-field" value={formData.developer} onChange={(e) => setFormData({...formData, developer: e.target.value})} /></div>
                    <div><label className="label">Publisher</label><input type="text" className="input-field" value={formData.publisher} onChange={(e) => setFormData({...formData, publisher: e.target.value})} /></div>
                    <div><label className="label">Rating (0-10)</label><input type="number" step="0.1" max="10" className="input-field" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} /></div>
                    <div><label className="label">Release Date</label><input type="date" className="input-field" value={formData.releaseDate} onChange={(e) => setFormData({...formData, releaseDate: e.target.value})} /></div>
                  </div>
                  <div><label className="label">Description</label><textarea rows="4" className="input-field resize-y" value={formData.detail} onChange={(e) => setFormData({...formData, detail: e.target.value})} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="label">Genre (e.g. ["Action"])</label><input type="text" className="input-field" value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})} /></div>
                    <div><label className="label">Platform (e.g. ["PC"])</label><input type="text" className="input-field" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} /></div>
                  </div>
                </>
              ) : (
                <>
                  <div><label className="label">Headline</label><input type="text" required className="input-field" value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} /></div>
                  <div><label className="label">Content</label><textarea rows="10" required className="input-field resize-y" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} /></div>
                </>
              )}

              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50">
                {loading ? "Processing..." : formData.id ? "Update Data" : "Create New"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`.label { display: block; font-size: 0.875rem; font-weight: bold; color: #a1a1aa; margin-bottom: 0.5rem; } .input-field { width: 100%; background-color: #18181b; border: 1px solid #3f3f46; padding: 0.75rem; border-radius: 0.75rem; color: white; transition: all; } .input-field:focus { border-color: #dc2626; outline: none; }`}</style>
    </div>
  );
};

export default AdminDashboard;