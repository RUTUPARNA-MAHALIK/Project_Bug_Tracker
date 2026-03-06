import { BugIcon, LayoutDashboard, Users } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bugs & Issues", url: "/bugs", icon: BugIcon },
  { title: "Developers", url: "/developers", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="h-16 px-6 flex items-center justify-start border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <BugIcon className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-glow">NexBug</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2 px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        transition-all duration-200 h-10 px-3 rounded-lg hover-elevate active-elevate-2
                        ${isActive ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm shadow-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
