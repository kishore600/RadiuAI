"use client"

import { BarChart3, Building2, Target, TrendingUp, Home, Settings } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const models = [
  {
    title: "Retail Market Intelligence",
    url: "/",
    icon: BarChart3,
    isActive: true,
    badge: "Active",
  },
  {
    title: "Competition Impact Simulator",
    url: "/competition-simulator",
    icon: Building2,
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
    isActive: false,
    badge: "Coming Soon",
  },
]

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
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">radiuAI</span>
            <span className="text-xs text-sidebar-foreground/70">Market Intelligence Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url === "/"}>
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

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>AI Models</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {models.map((model) => (
                <SidebarMenuItem key={model.title}>
                  <SidebarMenuButton asChild isActive={model.isActive} disabled={!model.isActive}>
                    <a href={model.url} className={!model.isActive ? "pointer-events-none" : ""}>
                      <model.icon />
                      <span className="flex-1 truncate">{model.title}</span>
                      <Badge variant={model.isActive ? "default" : "secondary"} className="ml-auto text-xs">
                        {model.badge}
                      </Badge>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2">
          <div className="text-xs text-sidebar-foreground/70">v1.0.0 - Retail Intelligence Model</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
