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
  User,
  LogOut,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
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
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
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
                    isActive={item.url === pathname}
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
      {user ? (
        <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/80">
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/10 p-2 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.picture}
                    alt={user?.name}
                    className="rounded-lg"
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                </div>

                {user ? (
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto" />
                ) : (
                  <div />
                )}
              </div>
            </DialogTrigger>

            {/* Modal content */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SidebarSeparator className="bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      ) : (
        <div />
      )}
    </Sidebar>
  );
}
