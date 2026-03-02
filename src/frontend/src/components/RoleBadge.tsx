import { Badge } from "@/components/ui/badge";
import type { UserRole } from "../types/campus";
import { ROLE_COLORS } from "../utils/helpers";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0 rounded-full ${ROLE_COLORS[role]} ${className}`}
    >
      {role}
    </Badge>
  );
}
