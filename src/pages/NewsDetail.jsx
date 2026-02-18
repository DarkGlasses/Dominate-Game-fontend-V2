import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await api.get(`/news/${id}`);
        if (response.data.data) {
          setNews(response.data.data);
        } else {
          setNews(response.data);
        }

        console.log("ข้อมูลข่าวที่ได้:", response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/400x300?text=No+Image";

    let cleanPath = imgPath.replace(/\\/g, "/");

    cleanPath = cleanPath.split("images/").pop();

    return `http://localhost:4000/images/${cleanPath}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        Loading...
      </div>
    );
  if (!news)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        News not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-[60px]">
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />

        <img
          src={getImageUrl(news.picture)}
          alt={news.headline}
          className="w-full h-full object-cover"
        />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-8 z-20 bg-black/50 hover:bg-red-600 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
          <div className="max-w-5xl mx-auto">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-4 inline-block">
              News Update
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-[0_4px_3px_rgba(0,0,0,0.8)] md:drop-shadow-[0_8px_6px_rgba(0,0,0,0.9)]">
              {news.headline}
            </h1>

            <div className="flex items-center text-gray-300 text-sm md:text-base space-x-4">
              <span>
                <i className="bi bi-calendar3 mr-2"></i>
                {new Date(news.updatedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert prose-xl max-w-none">
          <p className="whitespace-pre-line text-gray-300 leading-loose text-xl md:text-2xl font-light">
            {news.content}
          </p>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
