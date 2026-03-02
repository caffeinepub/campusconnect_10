import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Image,
  Loader2,
  MessageCircle,
  Send,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { Post } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";

export function FeedPage() {
  const { currentUser, posts } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Create post card */}
      {currentUser && <CreatePostCard />}

      {/* Posts */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-[oklch(0.5_0.03_255)] font-medium">
            No posts yet. Be the first to share!
          </p>
        </div>
      )}
    </div>
  );
}

function CreatePostCard() {
  const { currentUser, addPost } = useApp();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [posting, setPosting] = useState(false);

  if (!currentUser) return null;

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 300));
    addPost({
      authorId: currentUser!.principalId,
      authorName: currentUser!.name,
      authorRole: currentUser!.role,
      authorAvatar: currentUser!.avatarUrl,
      authorCourse: currentUser!.course || undefined,
      authorDivision: currentUser!.division || undefined,
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
    setContent("");
    setImageUrl("");
    setVideoUrl("");
    setShowImageInput(false);
    setShowVideoInput(false);
    setPosting(false);
    toast.success("Post shared with your campus!");
  }

  return (
    <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <UserAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="md"
          />
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${currentUser.name.split(" ")[0]}?`}
              className="border-[oklch(0.9_0.015_250)] rounded-xl resize-none focus-visible:ring-[oklch(0.42_0.18_265)] min-h-[80px] bg-[oklch(0.97_0.005_250)] placeholder:text-[oklch(0.65_0.02_255)]"
              rows={3}
            />

            <AnimatePresence>
              {showImageInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="rounded-xl border-[oklch(0.9_0.015_250)] focus-visible:ring-[oklch(0.42_0.18_265)] text-sm h-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        setImageUrl("");
                      }}
                      className="p-2 text-[oklch(0.55_0.03_255)] hover:text-[oklch(0.35_0.04_260)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
              {showVideoInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="rounded-xl border-[oklch(0.9_0.015_250)] focus-visible:ring-[oklch(0.42_0.18_265)] text-sm h-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowVideoInput(false);
                        setVideoUrl("");
                      }}
                      className="p-2 text-[oklch(0.55_0.03_255)] hover:text-[oklch(0.35_0.04_260)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageInput((v) => !v);
                    setShowVideoInput(false);
                  }}
                  className={`gap-1.5 text-xs rounded-xl h-8 px-3 ${showImageInput ? "bg-blue-50 text-blue-600" : "text-[oklch(0.52_0.03_255)] hover:text-[oklch(0.3_0.05_265)] hover:bg-[oklch(0.95_0.02_265)]"}`}
                >
                  <Image className="w-3.5 h-3.5" />
                  Image
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowVideoInput((v) => !v);
                    setShowImageInput(false);
                  }}
                  className={`gap-1.5 text-xs rounded-xl h-8 px-3 ${showVideoInput ? "bg-blue-50 text-blue-600" : "text-[oklch(0.52_0.03_255)] hover:text-[oklch(0.3_0.05_265)] hover:bg-[oklch(0.95_0.02_265)]"}`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Video
                </Button>
              </div>
              <Button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                size="sm"
                className="gap-1.5 bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl h-8 px-4 text-sm"
              >
                {posting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post }: { post: Post }) {
  const { currentUser, toggleLike, addComment } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const principalId = currentUser?.principalId ?? "";
  const hasLiked = post.likes.includes(principalId);

  function handleLike() {
    if (!principalId) return;
    toggleLike(post.id, principalId);
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    addComment(post.id, {
      authorId: currentUser.principalId,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      content: commentText.trim(),
    });
    setCommentText("");
  }

  return (
    <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Post header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <UserAvatar
            name={post.authorName}
            avatarUrl={post.authorAvatar}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[oklch(0.17_0.025_260)]">
                {post.authorName}
              </span>
              <RoleBadge role={post.authorRole} />
            </div>
            {(post.authorCourse || post.authorDivision) && (
              <p className="text-xs text-[oklch(0.48_0.06_265)] font-medium mt-0.5 truncate">
                {[
                  post.authorCourse,
                  post.authorDivision ? `Div ${post.authorDivision}` : "",
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}
            <p className="text-xs text-[oklch(0.55_0.03_255)] mt-0.5">
              {formatTimeAgo(post.timestamp)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-[oklch(0.22_0.03_260)] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="relative">
            <img
              src={post.imageUrl}
              alt="Shared post content"
              className="w-full max-h-80 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Video */}
        {post.videoUrl && (
          <div className="aspect-video bg-black">
            <iframe
              src={post.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 px-4 py-2.5 border-t border-[oklch(0.95_0.01_250)]">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-150 ${
              hasLiked
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-[oklch(0.52_0.03_255)] hover:bg-[oklch(0.95_0.01_250)] hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{post.likes.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[oklch(0.52_0.03_255)] hover:bg-[oklch(0.95_0.01_250)] hover:text-[oklch(0.42_0.18_265)] transition-all duration-150"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{post.comments.length}</span>
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[oklch(0.95_0.01_250)] bg-[oklch(0.98_0.003_250)]">
                {/* Comments list */}
                {post.comments.length > 0 && (
                  <div className="p-4 pb-2 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <UserAvatar
                          name={comment.authorName}
                          avatarUrl={comment.authorAvatar}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="bg-white rounded-xl px-3 py-2 border border-[oklch(0.93_0.01_250)]">
                            <p className="text-xs font-semibold text-[oklch(0.22_0.04_260)] mb-0.5">
                              {comment.authorName}
                            </p>
                            <p className="text-sm text-[oklch(0.25_0.03_260)] leading-snug">
                              {comment.content}
                            </p>
                          </div>
                          <p className="text-[10px] text-[oklch(0.62_0.02_255)] mt-0.5 pl-1">
                            {formatTimeAgo(comment.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                {currentUser && (
                  <form
                    onSubmit={handleAddComment}
                    className="flex gap-2.5 p-3 pt-2"
                  >
                    <UserAvatar
                      name={currentUser.name}
                      avatarUrl={currentUser.avatarUrl}
                      size="sm"
                    />
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 h-9 text-sm rounded-xl border-[oklch(0.9_0.015_250)] focus-visible:ring-[oklch(0.42_0.18_265)] bg-white"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!commentText.trim()}
                        className="h-9 w-9 p-0 rounded-xl bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
