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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";

const models = [
  {
    title: "Retail Market Intelligence",
    url: "/",
    icon: BarChart3,
    isActive: true,
    badge: "Active",
  },
  {
    title: "Cultural Fit Analyzer",
    url: "/cultural-fit",
    icon: Sparkle,
    isActive: false,
    badge: "Coming Soon",
  },
  {
    title: "Business Recommendation Engine",
    url: "/recommendations",
    icon: Target,
    isActive: false,
    badge: "Coming Soon",
  },
  {
    title: "Market Opportunity Scorer",
    url: "/opportunity-scorer",
    icon: TrendingUp,
    isActive: true,
    badge: "Active",
  },
];

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
  const pathname = usePathname();

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

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold flex items-center gap-2">
            AI Engines
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {models.map((model, index) => {
                const isSelected = pathname === model.url;

                return (
                  <SidebarMenuItem key={model.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={model.isActive && isSelected}
                      disabled={!model.isActive}
                      className={`animate-fade-in-up hover:bg-sidebar-accent/10 hover:text-black transition-all duration-300 ${
                        isSelected
                          ? "bg-sidebar-accent/20 border-l-2 border-accent"
                          : ""
                      }`}
                      style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                    >
                      <Link
                        href={model.url}
                        className={!model.isActive ? "pointer-events-none" : ""}
                      >
                        <model.icon
                          className={
                            model.isActive && isSelected ? "text-whtie" : ""
                          }
                        />
                        <span
                          className={`flex-1 truncate ${
                            isSelected ? "font-semibold text-white" : ""
                          }`}
                        >
                          {model.title}
                        </span>
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className={`ml-auto text-xs ${
                            isSelected || model.isActive
                              ? "bg-gradient-to-r from-accent to-primary text-white border-0 animate-pulse-glow"
                              : ""
                          }`}
                        >
                          {model.badge}
                        </Badge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
