import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../service/api";

const Review = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: "",
    comment: "",
    gameId: "", 
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/reviews");
        if (response.data && response.data.data) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); //

    if (!token) return alert("Please login to post a review"); //

    try {
      const response = await api.post(
        `/games/${id}/reviews`,
        {
          rating: Number(newReview.rating), 
          comment: newReview.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 201) {
        setReviews([response.data.data, ...reviews]);
        setNewReview({ rating: "", comment: "" });
      }
    } catch (err) {
      console.error(
        "Submit error:",
        err.response?.data?.message || err.message,
      );
    }
  };

  if (loading)
    return (
      <div className="p-10 text-white text-center">Loading Reviews...</div>
    );

  return (
    <div className="flex flex-col items-center p-10 min-h-screen text-white bg-black">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold mb-10 text-left">
          User <span className="text-red-800">REVIEWS</span>
        </h1>

        <form onSubmit={handleSubmit} className="mb-10 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <input
                type="number"
                name="rating"
                value={newReview.rating}
                onChange={handleInputChange}
                min="1"
                max="5"
                required
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                required
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700"
              />
            </div>
            <button type="submit" className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded">
              Submit Review
            </button>
          </div>
        </form>

        <section className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg text-red-500">
                  {review.user?.username || "User"}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {review.game?.title}
              </h3>
              <div className="flex gap-1 mb-3 text-yellow-500">
                {[...Array(Number(review.rating))].map((_, i) => (
                  <span key={i}>&#9733;</span>
                ))}
              </div>
              <p className="text-zinc-300 italic">"{review.comment}"</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Review;
