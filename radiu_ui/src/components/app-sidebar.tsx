/* eslint-disable @next/next/no-img-element */
"use client";

import {
  BarChart3,
  Building2,
  Target,
  TrendingUp,
  Home,
  Settings,
  Sparkles,
  Sparkle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="animate-slide-in-right">
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary text-white shadow-lg animate-pulse-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              radiuAI
            </span>
            <span className="text-xs text-sidebar-foreground/70 font-medium">
              Professional Market Intelligence
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-sidebar to-sidebar/95">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === "/"}
                    className="animate-fade-in-up hover:bg-sidebar-accent/10 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-sidebar-foreground/70">
              <div className="font-medium">v1.0.0</div>
              {/* <div>Retail Intelligence Model</div> */}
            </div>
            <Badge
              variant="outline"
              className="text-xs border-accent/30 text-accent"
            >
              Pro
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
