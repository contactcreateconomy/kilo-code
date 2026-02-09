import Link from "next/link";

interface UserBadgeProps {
  username: string;
  avatar?: string;
  role?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  showRole?: boolean;
  linkToProfile?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  moderator: "bg-primary/10 text-primary border-primary/20",
  member: "bg-muted text-muted-foreground border-border",
  vip: "bg-warning/10 text-warning border-warning/20",
};

function getInitials(username: string): string {
  return username
    .split(/[\s_-]/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(username: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length] ?? "bg-blue-500";
}

export function UserBadge({
  username,
  avatar,
  role,
  size = "md",
  showName = true,
  showRole = false,
  linkToProfile = true,
}: UserBadgeProps) {
  const avatarElement = (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
        avatar ? "" : getAvatarColor(username)
      }`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-medium">{getInitials(username)}</span>
      )}
    </div>
  );

  const content = (
    <div className="flex items-center gap-2">
      {avatarElement}
      {showName && (
        <div className="flex flex-col">
          <span className="font-medium text-sm leading-tight">{username}</span>
          {showRole && role && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded border w-fit ${
                roleColors[role] || roleColors['member']
              }`}
            >
              {role}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToProfile) {
    return (
      <Link
        href={`/u/${username}`}
        className="hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
