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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-background to-muted/30">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">
                  {data.headerTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  className=" rounded-l-full"
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <AvatarFallback>
                  {/* <UserIcon className="h-4 w-4" /> */}
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
