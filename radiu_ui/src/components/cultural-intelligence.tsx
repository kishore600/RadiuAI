/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  Calendar,
  Lightbulb,
  ChefHat,
  TrendingUp,
  Heart,
  Star,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  Gift,
  AlertCircle,
  Loader2,
  BarChart3,
} from "lucide-react";

interface CulturalIntelligenceProps {
  data: any;
  loading?: boolean;
  error?: string;
}

const CulturalIntelligence: React.FC<CulturalIntelligenceProps> = ({
  data,
  loading = false,
  error,
}) => {
  const [activeSection, setActiveSection] = useState("all");

  if (loading) {
    return (
      <div className="w-full space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="animate-pulse border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50"
          >
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">
            <AlertCircle className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <p className="text-red-700 font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-2">
            <Globe className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">
            No cultural intelligence data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      id: "menu",
      label: "Focus Recommendations",
      icon: ChefHat,
      data: data.menu_recommendations,
      gradient: "bg-gradient-to-br from-orange-400 to-red-500",
      accentColor: "bg-gradient-to-br from-orange-500 to-red-600",
    },
    {
      id: "marketing",
      label: "Marketing Ideas",
      icon: TrendingUp,
      data: data.marketing_ideas,
      gradient: "bg-gradient-to-br from-blue-400 to-purple-500",
      accentColor: "bg-gradient-to-br from-blue-500 to-purple-600",
    },
    {
      id: "events",
      label: "Local Events",
      icon: Calendar,
      data: data.local_festivals_or_events,
      gradient: "bg-gradient-to-br from-green-400 to-teal-500",
      accentColor: "bg-gradient-to-br from-green-500 to-teal-600",
    },
    {
      id: "cultural",
      label: "Cultural Tips",
      icon: Users,
      data: data.cultural_tips,
      gradient: "bg-gradient-to-br from-purple-400 to-pink-500",
      accentColor: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
  ];

  const getRandomIcon = (index: number) => {
    const icons = [
      Star,
      Heart,
      Gift,
      BookOpen,
      Sparkles,
      MapPin,
      Clock,
      Lightbulb,
    ];
    return icons[index % icons.length];
  };

  const SectionCard = ({ title, items, icon: Icon, gradient, accentColor }:any) => (
    <Card
      className={`relative overflow-hidden backdrop-blur-sm bg-white/90 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-5">
        <Icon className="w-full h-full" />
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div
            className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {title}
          </span>
          <Badge
            variant="secondary"
            className="ml-auto bg-gray-100 text-gray-700"
          >
            {items.length} items
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="space-y-4">
          {items.map((item: string, index: number) => {
            const ItemIcon = getRandomIcon(index);
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:shadow-md border border-gray-100 group/item"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-300`}
                >
                  <ItemIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-slate-700 leading-relaxed font-medium flex-1 group-hover/item:text-slate-800 transition-colors duration-300">
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 via-purple-200/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-tl from-green-200/10 via-teal-200/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative">
        <Card className="border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 ">
          <CardHeader className="">
            <div className="flex flex-col items-center gap-5">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cultural Intelligence
              </CardTitle>
              <CardDescription>
                business strategy for local preferences and behaviors.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={activeSection === "all" ? "default" : "outline"}
          onClick={() => setActiveSection("all")}
          className={`rounded-full px-6 py-2 transition-all duration-300 ${
            activeSection === "all"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-white/80 hover:bg-white/90 border-gray-200 hover:hover:text-purple-600"
          }`}
        >
          All Insights
        </Button>
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            onClick={() => setActiveSection(section.id)}
            className={`rounded-full px-6 py-2 transition-all duration-300 ${
              activeSection === section.id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-white/80 hover:bg-white/90 border-gray-200 hover:text-purple-600"
            }`}
          >
            <section.icon className="h-4 w-4 mr-2" />
            {section.label.split(" ")[0]}
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {activeSection === "all" ? (
          <>
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                title={section.label}
                items={section.data}
                icon={section.icon}
                gradient={section.gradient}
                accentColor={section.accentColor}
              />
            ))}
          </>
        ) : (
          sections
            .filter((section) => section.id === activeSection)
            .map((section) => (
              <div key={section.id} className="lg:col-span-2">
                <SectionCard
                  title={section.label}
                  items={section.data}
                  icon={section.icon}
                  gradient={section.gradient}
                  accentColor={section.accentColor}
                />
              </div>
            ))
        )}
      </div>

      {/* Footer Stats */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {data.menu_recommendations?.length || 0}
              </div>
              <div className="text-slate-600 font-medium">Menu Items</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {data.marketing_ideas?.length || 0}
              </div>
              <div className="text-slate-600 font-medium">Marketing Ideas</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {data.local_festivals_or_events?.length || 0}
              </div>
              <div className="text-slate-600 font-medium">Local Events</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {data.cultural_tips?.length || 0}
              </div>
              <div className="text-slate-600 font-medium">Cultural Tips</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalIntelligence;
