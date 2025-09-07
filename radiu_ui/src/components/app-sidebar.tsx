/* eslint-disable @next/next/no-img-element */
"use client"

import { BarChart3, Building2, Target, TrendingUp, Home, Settings, Sparkles, LogOut } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

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
  const { user, signOut } = useAuth()

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
            <span className="text-xs text-sidebar-foreground/70 font-medium">Professional Market Intelligence</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-sidebar to-sidebar/95">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Navigation</SidebarGroupLabel>
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
            <BarChart3 className="h-4 w-4 text-accent" />
            AI Models
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {models.map((model, index) => (
                <SidebarMenuItem key={model.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={model.isActive}
                    disabled={!model.isActive}
                    className="animate-fade-in-up hover:bg-sidebar-accent/10 transition-all duration-300"
                    style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                  >
                    <a href={model.url} className={!model.isActive ? "pointer-events-none" : ""}>
                      <model.icon className={model.isActive ? "text-white" : ""} />
                      <span className="flex-1 truncate">{model.title}</span>
                      <Badge
                        variant={model.isActive ? "default" : "secondary"}
                        className={`ml-auto text-xs ${
                          model.isActive
                            ? "bg-gradient-to-r from-accent to-primary text-white border-0 animate-pulse-glow"
                            : ""
                        }`}
                      >
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

      <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
        {/* {user && (
          <div className="px-3 py-3 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name}
                  className="h-8 w-8 rounded-full ring-2 ring-accent/20"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling.style.display = "flex"
                  }}
                />
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-sm font-medium hidden">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</div>
                <div className="text-xs text-sidebar-foreground/70 truncate">{user.email}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="h-8 w-8 p-0 hover:bg-sidebar-accent/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )} */}

        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-sidebar-foreground/70">
              <div className="font-medium">v1.0.0</div>
              <div>Retail Intelligence Model</div>
            </div>
            <Badge variant="outline" className="text-xs border-accent/30 text-accent">
              Pro
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
