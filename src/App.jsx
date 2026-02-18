import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import News from "./pages/News";
import Game from "./pages/Game";
import GameDetail from "./pages/GameDetail";
import CommunityFeed from "./pages/CommunityFeed";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import NewsDetail from "./pages/NewsDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Router>
      {/* 🔥 เพิ่ม bg-black ที่นี่ เพื่อกันพื้นหลังสีขาวเวลาเลื่อนเกินขอบ */}
      <div className="flex bg-black min-h-screen w-full">
        <Navbar />

        {/* 🔥 Main Content: 
            - ml-0 บนมือถือ (เพราะ Sidebar ซ่อน)
            - md:ml-64 บน PC (เว้นที่ให้ Sidebar) 
            - min-h-screen และ w-full เพื่อให้เต็มจอ
        */}
        <main className="flex-1 ml-0 md:ml-64 w-full min-h-screen flex flex-col relative transition-all duration-300 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/community/:id" element={<CommunityPostDetail />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;