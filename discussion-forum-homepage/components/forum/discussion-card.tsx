"use client";

import { useState } from "react";
import { ArrowBigUp, MessageCircle, Bookmark, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Discussion {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  aiSummary: string;
  upvotes: number;
  comments: number;
  image?: string;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
  index: number;
}

export function DiscussionCard({ discussion, index }: DiscussionCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(discussion.isUpvoted || false);
  const [upvotes, setUpvotes] = useState(discussion.upvotes);
  const [isBookmarked, setIsBookmarked] = useState(discussion.isBookmarked || false);
  const [isHovered, setIsHovered] = useState(false);

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(upvotes - 1);
    } else {
      setUpvotes(upvotes + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300",
        isHovered && "border-primary/30 shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`,
      }}
    >
      {/* Category Badge */}
      <Badge
        className={cn(
          "mb-3 transition-transform duration-200",
          discussion.categoryColor,
          isHovered && "scale-105"
        )}
      >
        {discussion.category}
      </Badge>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
        {discussion.title}
      </h3>

      {/* Author info */}
      <div className="mb-3 flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={discussion.author.avatar || "/placeholder.svg"} />
          <AvatarFallback>{discussion.author.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">{discussion.author.name}</span>
        <span className="text-sm text-muted-foreground">@{discussion.author.username}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">{discussion.timestamp}</span>
      </div>

      {/* AI Summary */}
      <div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="line-clamp-2 text-sm text-muted-foreground">{discussion.aiSummary}</p>
      </div>

      {/* Preview Image */}
      {discussion.image && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={discussion.image || "/placeholder.svg"}
            alt=""
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Upvote */}
        <button
          type="button"
          onClick={handleUpvote}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
            isUpvoted
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <ArrowBigUp
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isUpvoted && "fill-primary scale-110"
            )}
          />
          <span className={cn("transition-all duration-200", isUpvoted && "font-bold")}>
            {upvotes}
          </span>
        </button>

        {/* Comments */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{discussion.comments}</span>
        </button>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "ml-auto rounded-lg p-1.5 transition-all duration-200",
            isBookmarked
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Bookmark
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isBookmarked && "fill-primary scale-110"
            )}
          />
        </button>
      </div>

      {/* Hover glow effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.06), transparent 40%)",
        }}
      />
    </article>
  );
}
