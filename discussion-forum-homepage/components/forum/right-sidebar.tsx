"use client";

import { useState } from "react";
import { Trophy, Zap, Users, MessageSquare, FileText, Crown, Medal, Award, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const leaderboard = [
  { rank: 1, name: "Sarah Chen", username: "sarahchen", points: 12450, badge: "gold", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { rank: 2, name: "Alex Rivera", username: "alexr", points: 11230, badge: "gold", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
  { rank: 3, name: "Emily Watson", username: "emilyw", points: 10890, badge: "gold", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { rank: 4, name: "Marcus Johnson", username: "marcusj", points: 9750, badge: "silver", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { rank: 5, name: "David Kim", username: "davidk", points: 8920, badge: "silver", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face" },
  { rank: 6, name: "Lisa Park", username: "lisap", points: 7650, badge: "silver", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" },
  { rank: 7, name: "Tom Wilson", username: "tomw", points: 6540, badge: "bronze", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face" },
  { rank: 8, name: "Nina Brown", username: "ninab", points: 5890, badge: "bronze", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
  { rank: 9, name: "James Lee", username: "jamesl", points: 5120, badge: "bronze", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop&crop=face" },
  { rank: 10, name: "Amy Zhang", username: "amyz", points: 4780, badge: "bronze", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face" },
];

const stats = [
  { label: "Members", value: "24.5K", icon: Users },
  { label: "Discussions", value: "8.2K", icon: FileText },
  { label: "Comments", value: "156K", icon: MessageSquare },
];

interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-amber-500";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case "bronze":
        return "bg-gradient-to-r from-amber-600 to-orange-600";
      default:
        return "bg-muted";
    }
  };

  return (
    <aside className={cn("flex flex-col gap-4 p-4", className)}>
      {/* Leaderboard */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Leaderboard</h3>
        </div>
        
        <div className="space-y-2">
          {leaderboard.map((user, index) => (
            <div
              key={user.rank}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200",
                hoveredUser === user.rank ? "bg-accent" : "",
                user.rank <= 3 && "bg-muted/50"
              )}
              onMouseEnter={() => setHoveredUser(user.rank)}
              onMouseLeave={() => setHoveredUser(null)}
              style={{
                animation: `fadeInRight 0.4s ease-out ${index * 50}ms both`,
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                {getRankIcon(user.rank)}
              </div>
              
              <Avatar className={cn(
                "h-8 w-8 ring-2 transition-all duration-300",
                hoveredUser === user.rank ? "scale-110 ring-primary/50" : "ring-transparent"
              )}>
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              </div>
              
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {user.points.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Widget */}
      <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active Campaign
            </span>
          </div>
          
          <h4 className="mb-2 text-lg font-bold text-foreground">Win Claude Pro!</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            Top contributors this month win 3 months of Claude Pro subscription.
          </p>
          
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">2,450 / 5,000 pts</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: "49%" }}
              />
            </div>
          </div>
          
          <Button
            onClick={() => setIsJoined(!isJoined)}
            className={cn(
              "w-full transition-all duration-300",
              isJoined
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary hover:scale-[1.02]"
            )}
          >
            {isJoined ? "Joined" : "Join Campaign"}
          </Button>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 font-semibold text-foreground">Community Stats</h3>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center rounded-lg bg-muted/50 p-3 transition-all duration-200 hover:bg-accent"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 100}ms both`,
                }}
              >
                <Icon className="mb-1 h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
}
