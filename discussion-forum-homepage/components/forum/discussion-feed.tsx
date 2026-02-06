"use client";

import { useState } from "react";
import { Flame, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscussionCard, type Discussion } from "./discussion-card";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "new", label: "New", icon: Clock },
  { id: "top", label: "Top", icon: TrendingUp },
];

const discussions: Discussion[] = [
  {
    id: 1,
    title: "What are the best practices for building scalable React applications in 2025?",
    category: "Programming",
    categoryColor: "bg-blue-500 text-white hover:bg-blue-600",
    author: {
      name: "Sarah Chen",
      username: "sarahchen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    timestamp: "2h ago",
    aiSummary: "Discussion covers React Server Components, state management patterns, and performance optimization techniques for large-scale applications.",
    upvotes: 234,
    comments: 56,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=338&fit=crop",
  },
  {
    id: 2,
    title: "The future of AI-powered design tools: Are designers being replaced?",
    category: "Design",
    categoryColor: "bg-pink-500 text-white hover:bg-pink-600",
    author: {
      name: "Marcus Johnson",
      username: "marcusj",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    timestamp: "4h ago",
    aiSummary: "Explores how AI tools like Midjourney and Figma AI are changing the design landscape and the evolving role of human designers.",
    upvotes: 189,
    comments: 78,
  },
  {
    id: 3,
    title: "How I built a $10M ARR SaaS in 18 months with a team of 3",
    category: "Startups",
    categoryColor: "bg-orange-500 text-white hover:bg-orange-600",
    author: {
      name: "Emily Watson",
      username: "emilyw",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    timestamp: "6h ago",
    aiSummary: "Detailed breakdown of growth strategies, tech stack choices, and lessons learned from scaling a B2B SaaS company rapidly.",
    upvotes: 567,
    comments: 123,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=338&fit=crop",
    isUpvoted: true,
  },
  {
    id: 4,
    title: "GPT-5 leaked benchmarks show unprecedented reasoning capabilities",
    category: "AI & ML",
    categoryColor: "bg-violet-500 text-white hover:bg-violet-600",
    author: {
      name: "Alex Rivera",
      username: "alexr",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    timestamp: "8h ago",
    aiSummary: "Analysis of rumored GPT-5 performance metrics showing significant improvements in multi-step reasoning and code generation.",
    upvotes: 892,
    comments: 234,
    isBookmarked: true,
  },
  {
    id: 5,
    title: "The indie game that made $2M in its first week - A postmortem",
    category: "Gaming",
    categoryColor: "bg-green-500 text-white hover:bg-green-600",
    author: {
      name: "David Kim",
      username: "davidk",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
    },
    timestamp: "12h ago",
    aiSummary: "Solo developer shares marketing strategies, launch timing decisions, and community building tactics that led to viral success.",
    upvotes: 445,
    comments: 89,
  },
];

interface DiscussionFeedProps {
  className?: string;
}

export function DiscussionFeed({ className }: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState("hot");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isActive && "text-primary"
                )}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Discussion Cards */}
      <div className="flex flex-col gap-4">
        {discussions.map((discussion, index) => (
          <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentPage(page)}
            className={cn(
              "transition-all duration-200 hover:scale-105",
              currentPage === page && "pointer-events-none"
            )}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="transition-all duration-200 hover:scale-105"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
