import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export function AppNavbar() {
  const { profile } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-14 border-b border-border/50 glass-strong flex items-center px-4 gap-4 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>

      <div className="ml-auto flex items-center gap-2">
        <Avatar className="h-8 w-8 rounded-2xl">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt="Profile" className="object-cover rounded-2xl" />
          )}
          <AvatarFallback className="rounded-2xl gradient-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
