/* eslint-disable @next/next/no-img-element */
"use client"

import {
  TrendingUp,
  Home,
  Sparkles,
  User,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Shield,
  HelpCircle,
} from "lucide-react"
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
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogHeader } from "./ui/dialog"
import { useState } from "react"

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  console.log(user)
  const navigation = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      description: "Market overview & insights",
      badge: "New",
      badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    ...(user
      ? [
          {
            title: "Profile",
            url: "/profile",
            icon: User,
            description: "Account & reports",
            badge: "You",
            badgeColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
          },
        ]
      : []),
  ]
  return (
    <Sidebar className="animate-slide-in-right bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50">
      <SidebarHeader className="border-b border-slate-700/50 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-5 ">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl animate-pulse-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 shadow-lg animate-ping"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              radiuAI
            </span>
            <span className="text-xs text-slate-300/80 font-medium tracking-wide">AI Market Intelligence</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-slate-900/95 to-slate-800/95">
        {/* Main Navigation */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-slate-300/70 font-semibold text-xs uppercase tracking-wider px-4 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === pathname}
                    className="group  relative  mb-1 rounded-xl transition-all duration-300 hover:bg-white/5 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-white/10 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <a href={item.url} className="p-3 ">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 ${
                            item.url === pathname ? "from-blue-500/30 to-purple-500/30" : ""
                          }`}
                        >
                          <item.icon className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge
                                className={`text-[10px] px-1.5 py-0.5 rounded-full text-white border-0 ${item.badgeColor}`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {item.url === pathname && (
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Stats Section */}
        <div className="mx-4 mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">PRO ACTIVE</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">AI Analysis Ready</p>
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="text-white font-bold">24/7</div>
                <div className="text-slate-400">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">99.9%</div>
                <div className="text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">AI</div>
                <div className="text-slate-400">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      {/* Enhanced Footer with User Profile */}
      {user && (
        <SidebarFooter className="border-t border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/10 mx-2 my-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-slate-500">Verified Account</span>
                  </div>
                </div>

                <MoreHorizontal className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
            </DialogTrigger>

            {/* Enhanced Modal Content */}
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3  border-b text-white p-3  border-slate-700">
                  Options
                </DialogTitle>
              </DialogHeader>

              <div className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-300 group"
                  onClick={() => setIsOpen(false)}
                >
                  <HelpCircle className="mr-3 h-4 w-4 text-slate-400 group-hover:text-green-400 transition-colors" />
                  <span className="text-slate-200 group-hover:text-white">Help & Support</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-300 group"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare className="mr-3 h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <span className="text-slate-200 group-hover:text-white">Contact Us</span>
                </Button>

                <div className="pt-2 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 group text-red-400 hover:text-red-300"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
