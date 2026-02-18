import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";

const CommunityPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commentContent, setCommentContent] = useState("");
  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchPostDetail = async () => {
    try {
      const res = await api.get(`/community/${id}`);
      if (res.data.status === "success") {
        setPost(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const handleAction = async (method, url, data = {}) => {
    if (!token) return alert("Session expired, please login again");

    try {
      if (method === "delete") {
        await api.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api[method](url, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchPostDetail();
      setEditingCommentId(null);
      setReplyToId(null);
      if (url.includes("/comments/replies")) setReplyContent("");
      else setCommentContent("");

    } catch (err) {
      alert("Action failed: " + (err.response?.data?.error || "Error"));
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    if (!token) return alert("Session expired");

    try {
      await api.delete(`/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/community");
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || "Error"));
    }
  };

  if (loading) return <div className="text-white text-center p-20 text-xl">Loading...</div>;
  if (!post) return <div className="text-white text-center p-20 text-xl">Post not found</div>;

  return (
      <div
      className="min-h-screen bg-black text-white pt-28 px-6 md:px-20 pb-20"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url('/images/unnamed.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 mb-10 relative shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-black text-red-500 break-all leading-tight tracking-tight">
              {post.title}
            </h1>
            {(currentUser?.id === post.userId || currentUser?.role === "admin") && (
              <button onClick={handleDeletePost} className="text-zinc-500 hover:text-red-500 flex-shrink-0 ml-6 p-2 transition-transform hover:scale-110">
                <i className="bi bi-trash text-2xl"></i>
              </button>
            )}
          </div>
          
          <p className="text-zinc-300 text-lg mb-6 whitespace-pre-wrap break-all leading-relaxed">
            {post.content}
          </p>
          
          {post.picture && (
            <img
              src={`http://localhost:4000/${post.picture}`}
              className="w-full rounded-3xl mb-4 object-cover max-h-[600px] border border-zinc-800"
              alt="post"
            />
          )}
        </div>

        <form
          className="flex gap-4 mb-10 items-start" 
          onSubmit={(e) => {
            e.preventDefault();
            handleAction("post", `/community/${id}/comments`, { content: commentContent });
          }}
        >
          <textarea
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-base outline-none focus:border-red-600 resize-y min-h-[60px] shadow-lg"
            placeholder="Write a comment..."
            rows="2"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="bg-red-700 hover:bg-red-600 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:scale-105 active:scale-95 h-fit whitespace-nowrap"
          >
            Send
          </button>
        </form>

        <div className="space-y-6">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-md">
              <div className="flex justify-between mb-3">
                <span className="font-bold text-xl text-red-500">{comment.user?.username}</span>
                {currentUser?.id === comment.userId && (
                  <div className="flex gap-3 text-sm text-zinc-500 font-medium">
                    <button className="hover:text-white" onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); }}>Edit</button>
                    <button className="hover:text-red-500" onClick={() => {
                        if (window.confirm("Are you sure you want to delete this comment?")) {
                          handleAction("delete", `/community/${id}/comments/${comment.id}`);
                        }
                      }}>Delete</button>
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-base text-white resize-y"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm("Save changes to this comment?")) {
                          handleAction("put", `/community/${id}/comments/${comment.id}`, { content: editContent });
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingCommentId(null)} className="text-zinc-400 hover:text-white px-3 py-2 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-300 text-base mb-4 whitespace-pre-wrap break-all leading-relaxed pl-2 border-l-2 border-zinc-800">
                    {comment.content}
                  </p>
                  <button onClick={() => setReplyToId(comment.id)} className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                    <i className="bi bi-reply-fill text-base"></i> REPLY
                  </button>
                </>
              )}

              {replyToId === comment.id && (
                <div className="mt-4 flex gap-3 ml-8 md:ml-12 items-start animate-fade-in"> 
                  <textarea
                    className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm outline-none resize-y"
                    placeholder="Write a reply..."
                    rows="2"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <button
                    onClick={() => handleAction("post", `/community/${id}/comments/replies`, { content: replyContent, parentId: comment.id })}
                    className="bg-red-700 hover:bg-red-600 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 h-fit whitespace-nowrap"
                  >
                    Reply
                  </button>
                </div>
              )}

              <div className="space-y-3 mt-4">
                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="ml-8 md:ml-12 p-4 bg-black/40 rounded-2xl border-l-4 border-red-600/50 hover:bg-black/60 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-blue-400">{reply.user?.username}</span>
                      {currentUser?.id === reply.userId && (
                        <div className="flex gap-2 text-xs text-zinc-600 font-medium">
                          <button className="hover:text-white" onClick={() => { setEditingCommentId(reply.id); setEditContent(reply.content); }}>Edit</button>
                          <button className="hover:text-red-500" onClick={() => {
                              if (window.confirm("Are you sure you want to delete this reply?")) {
                                handleAction("delete", `/community/${id}/comments/replies/${reply.id}`);
                              }
                            }}>Delete</button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === reply.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full bg-zinc-800 p-2 rounded-xl text-sm text-white resize-y"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows="2"
                        />
                        <button
                          onClick={() => {
                            if (window.confirm("Save changes to this reply?")) {
                              handleAction("put", `/community/${id}/comments/replies/${reply.id}`, { content: editContent });
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap break-all leading-relaxed">
                        {reply.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostDetail;