import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../service/api";

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, comment: "" });

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isOwner = (rev) => {
    if (!currentUser) return false;
    return rev.userId === currentUser.id || rev.user?.id === currentUser.id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gameRes = await api.get(`/games/${id}`);
        if (gameRes.data && gameRes.data.data) setGame(gameRes.data.data);

        const reviewRes = await api.get(`/games/${id}/reviews`);
        if (reviewRes.data && reviewRes.data.data) {
          const sorted = reviewRes.data.data.sort((a, b) => {
            if (isOwner(a)) return -1;
            if (isOwner(b)) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setReviews(sorted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Do you want to delete this review?")) return;
    const token = localStorage.getItem("token");

    try {
      await api.delete(`/games/${id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((rev) => rev.id !== reviewId));
      alert("Delete review successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert(
        "Failed to delete review: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const startEditing = (rev) => {
    setEditingId(rev.id);
    setEditForm({ rating: rev.rating, comment: rev.comment });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await api.put(
        `/games/${id}/reviews/${editingId}`,
        {
          rating: Number(editForm.rating),
          comment: editForm.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const updatedList = reviews.map((r) =>
        r.id === editingId
          ? { ...r, rating: editForm.rating, comment: editForm.comment }
          : r,
      );
      setReviews(updatedList);
      setEditingId(null);
      alert("Update review successfully!");
    } catch (err) {
      console.error("Update Error:", err);
      alert(
        "Failed to update review: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to post a review");

    try {
      const res = await api.post(
        `/games/${id}/reviews`,
        {
          rating: Number(newReview.rating),
          comment: newReview.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 201) {
        setReviews([res.data.data, ...reviews]);
        setNewReview({ rating: 5, comment: "" });
        alert("Review posted successfully!");
      }
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("P2002")
      ) {
        alert("You have already posted a review for this game.");
      } else {
        alert(
          "Failed to post review: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  if (loading)
    return (
      <div className="p-20 text-white bg-black min-h-screen">Loading...</div>
    );
  if (!game)
    return (
      <div className="p-20 text-white bg-black min-h-screen text-center">
        Game not found
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pt-[120px] pb-10 px-6 md:px-20 flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <div className="w-full lg:w-2/5 flex flex-col items-center">
            <img
              src={`http://localhost:4000/images/${game.picture ? game.picture.replace(/\\/g, "/").split("images/").pop() : ""}`}
              alt={game.title}
              className="w-full rounded-3xl border border-zinc-800 shadow-2xl"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=No+Image";
                e.target.onerror = null;
              }}
            />
            <div className="mt-6 w-full flex justify-between items-center text-zinc-400 px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <span className="font-bold">
                Rating: <span className="text-white">{game.rating}/10</span>
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-4 leading-none">
              {game.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {(Array.isArray(game.genre)
                ? game.genre
                : game.genre?.split(",") || []
              ).map((g, index) => (
                <span
                  key={index}
                  className="px-4 py-1 bg-red-900/20 border border-red-700/50 text-red-500 rounded-full text-xs font-bold uppercase"
                >
                  {typeof g === "string" ? g.trim() : g}
                </span>
              ))}
            </div>

            <div className="mb-8 overflow-hidden">
              <h3 className="text-zinc-500 font-bold uppercase text-[10px] mb-2 tracking-widest">
                About this game
              </h3>
              <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-line break-all">
                {game.detail || "No description available for this game."}
              </p>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 grid grid-cols-2 gap-6 text-sm mb-8">
              <div className="flex flex-col">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">
                  Developer
                </span>
                <span className="text-lg">{game.developer}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">
                  Publisher
                </span>
                <span className="text-lg">{game.publisher}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">
                  Release Date
                </span>
                <span className="text-lg">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">
                  Platforms
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {game.platform ? (
                    (() => {
                      try {
                        const platformList =
                          typeof game.platform === "string"
                            ? JSON.parse(game.platform)
                            : game.platform;

                        return Array.isArray(platformList) ? (
                          platformList.map((p, index) => (
                            <span
                              key={index}
                              className="bg-zinc-800 px-2 py-1 rounded text-sm text-zinc-300 border border-zinc-700 shadow-sm"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-lg">{game.platform}</span>
                        );
                      } catch (e) {
                        return <span className="text-lg">{game.platform}</span>;
                      }
                    })()
                  ) : (
                    <span className="text-lg text-zinc-500">TBA</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-16">
          <h2 className="text-4xl font-bold mb-10">
            User <span className="text-red-700">REVIEWS</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-1 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 h-fit"
            >
              <h3 className="text-xl font-bold mb-6 italic">
                Post your thoughts
              </h3>
              <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-black p-4 rounded-xl border border-zinc-800 outline-none focus:border-red-700 text-white"
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, rating: e.target.value })
                  }
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                  Comment
                </label>
                <textarea
                  className="w-full bg-black p-4 rounded-xl border border-zinc-800 h-32 outline-none focus:border-red-700 resize-none text-white"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Tell us what you think..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-bold shadow-lg transition-all"
              >
                POST REVIEW
              </button>
            </form>

            <div className="lg:col-span-2 space-y-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-8 rounded-3xl border relative transition-all ${isOwner(rev) ? "bg-red-900/10 border-red-900/50" : "bg-zinc-900/30 border-zinc-800"}`}
                >
                  {editingId === rev.id ? (
                    <form onSubmit={handleUpdateReview} className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-red-500">
                          Editing Review...
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-20 bg-black p-2 rounded border border-zinc-700 text-white"
                        value={editForm.rating}
                        onChange={(e) =>
                          setEditForm({ ...editForm, rating: e.target.value })
                        }
                      />
                      <textarea
                        className="w-full bg-black p-3 rounded border border-zinc-700 text-white h-24 resize-none"
                        value={editForm.comment}
                        onChange={(e) =>
                          setEditForm({ ...editForm, comment: e.target.value })
                        }
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center font-bold text-red-500 border border-red-900/50 uppercase">
                            {rev.user?.username?.charAt(0) || "U"}
                          </div>
                          <span className="font-bold text-lg">
                            {rev.user?.username || "Anonymous"}
                            {isOwner(rev) && (
                              <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                                YOU
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-lg mr-2">
                            ★ {rev.rating}/10
                          </span>
                          {isOwner(rev) && (
                            <>
                              <button
                                onClick={() => startEditing(rev)}
                                className="text-zinc-500 hover:text-blue-400 p-2 transition-colors"
                              >
                                <i className="bi bi-pencil-square text-lg"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-zinc-500 hover:text-red-500 p-2 transition-colors"
                              >
                                <i className="bi bi-trash-fill text-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-300 italic text-lg leading-relaxed">
                        "{rev.comment}"
                      </p>
                      <div className="mt-6 text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                        Posted on {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-zinc-500 italic text-center p-10">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
