import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../service/api";

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/community");
      if (res.data.status === "success") {
        setPosts(res.data.data.reverse());
      }
    } catch (err) {
      console.error("🔥 Error Fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenCreateModal = () => {
    handleCancelEdit();
    setIsModalOpen(true);
  };

  const handleEditClick = (post) => {
    setEditPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPreview(post.picture ? `http://localhost:4000/${post.picture}` : null);
    setImage(null);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setTitle("");
    setContent("");
    setImage(null);
    setPreview(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !token) return alert("กรุณาเข้าสู่ระบบก่อนดำเนินการ");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image instanceof File) {
      formData.append("picture", image);
    }

    try {
      if (editPostId) {
        await api.put(`/community/${editPostId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("อัปเดตโพสต์เรียบร้อย!");
      } else {
        formData.append("userId", currentUser.id);
        await api.post("/community", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Create post successfully!");
      }

      handleCancelEdit();
      fetchPosts();
    } catch (err) {
      alert(
        "Something went wrong: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this post?")) return;
    try {
      await api.delete(`/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Delete post successfully!");
      fetchPosts();
    } catch (err) {
      alert(
        "Failed to delete post: " +
          (err.response?.data?.message || "Unauthorized"),
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white p-20 text-center">
        Loading...
      </div>
    );

  return (
    <div
      className="min-h-screen text-white pt-24 px-4 md:px-20 pb-10 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url('/images/unnamed.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-red-600">
          COMMUNITY <span className="text-white">BOARD</span>
        </h1>

        <button
          onClick={handleOpenCreateModal}
          className="fixed bottom-10 right-10 bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl z-40 transition-transform hover:scale-110 active:scale-95"
        >
          +
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCancelEdit}
            ></div>
            <div
              className={`relative w-full max-w-2xl p-6 rounded-2xl border z-10 ${editPostId ? "bg-zinc-800 border-blue-600" : "bg-zinc-900 border-zinc-800"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editPostId ? "✏️ Edit Post" : "🚀 Create New Post"}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Topic Title..."
                  className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-white focus:border-red-600 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="What's on your mind?"
                  className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-white h-48 focus:border-red-600 outline-none resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                      <i className="bi bi-image"></i>{" "}
                      {editPostId ? "Change" : "Add Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {preview && (
                      <div className="relative h-14 w-14">
                        <img
                          src={preview}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className={`font-bold py-3 px-10 rounded-xl text-white transition-all ${editPostId ? "bg-blue-600 hover:bg-blue-700" : "bg-red-700 hover:bg-red-600"}`}
                  >
                    {editPostId ? "UPDATE" : "POST"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-700/50 transition-all"
            >
              {currentUser &&
                (currentUser.id === post.userId ||
                  currentUser.role === "admin") && (
                  <div className="absolute top-4 right-4 flex gap-3 z-10">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="text-zinc-500 hover:text-blue-400"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-zinc-500 hover:text-red-500"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                )}

              <Link to={`/community/${post.id}`} className="block">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 font-bold text-xl border border-red-900/50 flex-shrink-0">
                    {post.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors pr-10 break-all">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1 mb-2">
                      By {post.user?.username} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-zinc-400 line-clamp-2 mb-4 break-all">
                      {post.content}
                    </p>
                    {post.picture && (
                      <img
                        src={`http://localhost:4000/${post.picture}`}
                        className="h-48 w-full object-cover rounded-xl border border-zinc-800 mb-4"
                        alt="post"
                      />
                    )}
                    <span className="text-zinc-500 text-xs font-bold uppercase hover:text-white flex items-center gap-2">
                      <i className="bi bi-chat-left-dots"></i> Click to Read /
                      Comment
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
