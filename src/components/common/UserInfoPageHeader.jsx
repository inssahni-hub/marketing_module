import {
  Mail,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const roleColors = {
  ADMIN: "bg-red-100 text-red-700",
  ORGANIZER: "bg-blue-100 text-blue-700",
  VENDOR: "bg-purple-100 text-purple-700",
  CUSTOMER: "bg-green-100 text-green-700",
  STAFF: "bg-orange-100 text-orange-700",
};

export default function UserInfoPageHeader({ user }) {
  if (!user) return null;

  const initials =
    user.userName?.[0]?.toUpperCase() ||
    user.name?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="relative overflow-hidden rounded-xl shadow bg-white mb-4">
     
      {/* Content */}
      <div className="px-6 py-2 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar */}
        <Avatar className="h-20 w-20  border-4 border-white shadow-lg">
          <AvatarFallback className="bg-black text-white text-3xl font-extrabold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.name || user.userName}
            </h2>

            <Badge
              className={`${roleColors[user.role] || "bg-gray-100 text-gray-700"} capitalize`}
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              {user.role}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-2">
            {user.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}

            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}

            {user.userName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>@{user.userName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
