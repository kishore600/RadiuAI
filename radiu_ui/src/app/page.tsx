"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { RetailMarketIntelligence } from "@/components/retail-market-intelligence";
import { GoogleAuth } from "@/components/google-auth";
import { useAuth } from "@/components/auth-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, UserIcon, Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    console.log("[v0] App is loading, user state:", user);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <div className="flex items-center gap-3 p-6 rounded-lg bg-card border border-accent/20">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="font-medium text-lg">Loading radiuAI...</span>
        </div>
      </div>
    );
  }

  console.log(
    "[v0] App loaded, user:",
    user ? `${user.name} (${user.email})` : "Not authenticated"
  );

  if (!user) {
    console.log("[v0] No user found, showing sign-in screen");
    return <GoogleAuth />;
  }

  console.log(user);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-background to-muted/30">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                Retail Market Intelligence Model
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.picture || "/placeholder.svg"}
                alt={user.name}
              />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 animate-fade-in-up">
        <div className="mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Market Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Analyze retail market opportunities with comprehensive
            location-based intelligence
          </p>
        </div>
        <RetailMarketIntelligence />
      </div>
    </SidebarInset>
  );
}
