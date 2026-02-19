import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        let data = [];
        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            data = response.data.data;
        }
        setNewsList(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const popularNews = safeNewsList.slice(0, 4);
  const latestNews = safeNewsList.slice(4);

  useEffect(() => {
    if (popularNews.length === 0 || isPaused) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularNews.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [popularNews.length, isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularNews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + popularNews.length) % popularNews.length);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  const handleReadNews = (id) => {
    if (touchStart && touchEnd && Math.abs(touchStart - touchEnd) > 10) return;
    navigate(`/news/${id}`);
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/800x450?text=No+Image";
    let cleanPath = imgPath.replace(/\\/g, '/');
    cleanPath = cleanPath.split('images/').pop(); 
    return `${import.meta.env.VITE_API_URL}/images/${cleanPath}`;
  };

  if (loading) return <div className="text-white text-center mt-20 text-2xl animate-pulse">Loading News...</div>;

  return (
    <div className="flex flex-col items-center p-6 md:p-10 min-h-screen text-white pt-[100px] bg-black">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 border-l-4 border-red-600 pl-4">Latest News</h1>

        {safeNewsList.length === 0 ? (
           <div className="text-center text-zinc-500 py-20 text-xl">No news available.</div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:order-2 space-y-4">
            <div className="space-y-3">
              {popularNews.map((newsItem, index) => (
                <div 
                  key={newsItem.id} 
                  className={`bg-zinc-900/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all border ${currentSlide === index ? 'border-red-600 bg-zinc-800' : 'border-transparent hover:bg-zinc-800'}`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <span className={`text-2xl font-black ${currentSlide === index ? 'text-red-500' : 'text-zinc-600'}`}>#{index + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold line-clamp-2 leading-tight text-zinc-200">
                        {newsItem.headline || newsItem.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(newsItem.updatedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:order-1 lg:col-span-2 space-y-8">
            
            <div 
                className="relative overflow-hidden bg-black rounded-2xl shadow-2xl h-[400px] md:h-[500px] border border-zinc-800 group select-none cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => { setIsPaused(false); setTouchEnd(null); }} 
                
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onTouchStart}
                onMouseMove={onTouchMove}
            >
              {popularNews.map((newsItem, index) => (
                <div
                  key={newsItem.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  onMouseUp={() => handleReadNews(newsItem.id)}
                >
                  <img 
                    src={getImageUrl(newsItem.image || newsItem.picture)} 
                    alt={newsItem.headline} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
                  />
                  
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-8 pt-24 pointer-events-none">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase mb-3 inline-block">Featured</span>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-3 leading-tight">
                        {newsItem.headline || newsItem.title}
                    </h3>
                    <div className="flex items-center text-zinc-400 text-xs gap-4">
                        <span><i className="bi bi-calendar3 mr-1"></i> {new Date(newsItem.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {popularNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-red-600 w-8' : 'bg-zinc-600 w-2 hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold border-l-4 border-zinc-700 pl-3">More Stories</h3>
                {latestNews.map((newsItem) => (
                    <div
                    key={newsItem.id} 
                    className="bg-zinc-900/40 rounded-xl p-4 flex flex-col sm:flex-row gap-4 cursor-pointer hover:bg-zinc-800 transition-all group border border-zinc-800/50 hover:border-zinc-700"
                    onClick={() => handleReadNews(newsItem.id)}
                    >
                    <div className="w-full sm:w-48 h-32 flex-shrink-0 bg-black rounded-lg overflow-hidden relative">
                        <img src={getImageUrl(newsItem.image || newsItem.picture)} alt={newsItem.headline} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-zinc-100 group-hover:text-red-500 line-clamp-2">
                                {newsItem.headline || newsItem.title}
                            </h3>
                            <p className="text-zinc-400 text-sm line-clamp-2">
                                {newsItem.content || newsItem.summary}
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-3 border-t border-zinc-800 pt-3">
                            <span className="text-xs text-zinc-500">{new Date(newsItem.updatedAt).toLocaleDateString()}</span>
                            <span className="text-xs text-red-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Read More <i className="bi bi-arrow-right"></i>
                            </span>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default News;