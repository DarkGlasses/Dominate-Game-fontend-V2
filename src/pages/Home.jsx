import React, { useState, useEffect } from "react";
import api from "../service/api";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/800x450?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;
    let cleanPath = imgPath.replace(/\\/g, "/").split("images/").pop();
    return `${import.meta.env.VITE_API_URL}/images/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [gamesRes, newsRes] = await Promise.allSettled([api.get("/games"), api.get("/news")]);
        
        if (gamesRes.status === "fulfilled") {
            const data = Array.isArray(gamesRes.value.data) ? gamesRes.value.data : gamesRes.value.data.data || [];
            setGames(data);
        }
        if (newsRes.status === "fulfilled") {
            const data = Array.isArray(newsRes.value.data) ? newsRes.value.data : newsRes.value.data.data || [];
            setNews(data);
        }
      } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
    };
    fetchAllData();
  }, []);

  const sliderGames = games.slice(0, 5); 
  
  const galleryGames = games.slice(0, 4); 
  
  const latestNews = news.slice(0, 3);

  useEffect(() => {
    if (sliderGames.length === 0) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % sliderGames.length), 5000);
    return () => clearInterval(interval);
  }, [sliderGames.length]);

  const handleCardClick = (id) => {
    navigate(`/game/${id}`);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;

  return (
    <div className="w-full min-h-screen bg-black text-white pb-20 pt-16 md:pt-0">
      
      {sliderGames.length > 0 && (
        <div className="relative w-full h-[50vh] md:h-[600px] overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out" style={{ backgroundImage: `url(${getImageUrl(sliderGames[currentSlide].picture)})`, filter: "brightness(0.5)" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-4 md:bottom-20 md:left-12 max-w-4xl z-10 pr-4">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block shadow-lg">SPOTLIGHT</span>
            <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight drop-shadow-2xl">{sliderGames[currentSlide].title}</h1>
            <button onClick={() => handleCardClick(sliderGames[currentSlide].id)} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all">View Details</button>
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-8 py-8 space-y-16">
        
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-3">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-red-600 block rounded-full"></span>
                    Game <span className="text-red-600">Recommend</span>
                </h2>
             </div>
             <button onClick={() => navigate("/game")} className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                View All <i className="bi bi-arrow-right"></i>
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryGames.length > 0 ? (
                galleryGames.map((game) => (
                <div 
                    key={game.id} 
                    onClick={() => handleCardClick(game.id)} 
                    className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 shadow-lg hover:border-red-600/50 hover:shadow-red-900/20 transition-all duration-300 group flex flex-col h-full"
                >
                    <div className="h-48 overflow-hidden relative">
                        <img src={getImageUrl(game.picture)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={game.title} />
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/10">
                            {formatDate(game.releaseDate)}
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold truncate text-white mb-2 group-hover:text-red-500 transition-colors">{game.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {game.genre && (Array.isArray(game.genre) ? game.genre : JSON.parse(game.genre || "[]")).slice(0, 2).map((g, i) => (
                                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">{g}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-zinc-500 w-full text-center py-10 col-span-full">No games found.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-3">
             <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2"><span className="w-1.5 h-8 bg-red-600 block rounded-full"></span>News Update</h2>
             <button onClick={() => navigate("/news")} className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                View All <i className="bi bi-arrow-right"></i>
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((item) => (
              <div key={item.id} onClick={() => navigate(`/news/${item.id}`)} className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-zinc-600 shadow-lg group hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                    <img src={getImageUrl(item.image || item.picture)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.headline} />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">News</span>
                    </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">{item.headline || item.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">{item.content}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                    <span>{formatDate(item.createdAt || item.updatedAt)}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">Read &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 group w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-black/80 z-10"></div>
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" alt="Community" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
                <div className="max-w-2xl">
                    <h2 className="text-2xl md:text-5xl font-black mb-3 md:mb-4 leading-tight">Join the <span className="text-red-500">Community</span></h2>
                    <p className="text-gray-300 text-sm md:text-lg">Connect with other gamers, share your reviews, and discuss the latest trends.</p>
                </div>
                <button onClick={() => navigate("/community")} className="bg-white text-red-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all shadow-xl hover:bg-gray-100 hover:scale-105 whitespace-nowrap">Go to Community</button>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Home;