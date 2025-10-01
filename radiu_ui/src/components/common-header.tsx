import React from "react";
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Loader2, LogOut, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./auth-provider";
import { GoogleAuth } from "./google-auth";

interface HeaderProps {
  data: {
    headerTitle: string;
    headerTitleSubtext: string;
    headerDescription: string;
    modelComponent: React.ReactNode;
  };
}

const CommonHeader = ({ data }: HeaderProps) => {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    console.log("[v0] App is loading, user state:", user);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <div className="flex items-center gap-3 p-6 ">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="font-medium text-lg">
            Loading {data.headerTitle}...
          </span>
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
      <div>
        <div className="flex flex-1 flex-col justify-center items-center mt-10 gap-4 px-4 animate-fade-in-up">
          <div className="">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {data.headerTitleSubtext}
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              {data.headerDescription}
            </p>
          </div>
          {data.modelComponent}
        </div>
      </div>
    </SidebarInset>
  );
};

export default CommonHeader;
