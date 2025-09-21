/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MarketData {
  retailMarketIntelligence: any;
  marketOpportunityScore: any;
  culturalIntelligence: any;
  businessRecommendation: any;
}


export default function ReportActions({ data }: any) {
  const [shareLink, setShareLink] = useState(null);

  // ✅ Download All Reports as JSON
  const handleDownloadAll = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "market_reports.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Share Results (Generate temporary link)
  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify(data));
    const fakeLink = `${window.location.origin}/shared?data=${encoded}`;
    setShareLink(fakeLink);
    navigator.clipboard.writeText(fakeLink);
    alert("Share link copied to clipboard! ✅");
  };

  // ✅ Export to PDF with all JSON data
const handleExportPDF = () => {
  const doc = new jsPDF();

  // 🎨 Brand Colors
  const primary = [59, 130, 246];
  const secondary = [99, 102, 241];
  const textDark = [40, 40, 40];
  const textLight = [120, 120, 120];

  // 📄 Cover Page
  const addCover = () => {
    const gradientHeight = 297;
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, 210, gradientHeight, "F");

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("Comprehensive Market Analysis Report", 105, 140, { align: "center" });

    doc.setFontSize(14);
    doc.text("AI-Powered Retail & Cultural Intelligence System", 105, 155, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 170, { align: "center" });
    doc.addPage();
  };

  // Section Header
  const addSection = (title: string, emoji: string = "") => {
    doc.setFontSize(16);
    doc.setTextColor(...primary);
    doc.setFont(undefined, "bold");
    doc.text(`${emoji} ${title}`, 20, yPos);
    yPos += 6;
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
  };

  // Key-Value Pairs
  const addKeyValue = (key: string, value: string) => {
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.setFont(undefined, "bold");
    doc.text(`${key}:`, 25, yPos);
    doc.setFont(undefined, "normal");
    const wrapped = doc.splitTextToSize(value, 150);
    doc.text(wrapped, 60, yPos);
    yPos += wrapped.length * 6 + 4;
  };

  // Footer
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(...textLight);
      doc.text(`Page ${i} of ${pageCount}`, 200 - 20, 290, { align: "right" });
      doc.text("Confidential - For Internal Use Only", 105, 290, { align: "center" });
    }
  };

  // Build PDF
  let yPos = 20;
  addCover();
  addSection("Market Opportunity Score", "📊");
  addKeyValue("Location", data.marketOpportunityScore?.location?.name || "N/A");

  addSection("Retail Market Intelligence", "🏬");
  // … continue with tables, competitors, etc.

  addSection("Cultural Intelligence", "🌎");
  addSection("Business Recommendation", "💡");

  addFooter();
  doc.save("professional_market_analysis_report.pdf");
};

  return (
    <div className="mt-6 flex flex-wrap gap-3 justify-center">

      <Button
        variant="outline"
        className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-black"
        onClick={handleShare}
      >
        <Share className="h-4 w-4 mr-2" />
        Share Results
      </Button>

      <Button
        variant="outline"
        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-black"
        onClick={handleExportPDF}
      >
        <FileText className="h-4 w-4 mr-2" />
        Export to PDF
      </Button>

      {shareLink && (
        <p className="text-xs text-gray-600 w-full text-center mt-2">
          Shareable link: <a href={shareLink}>{shareLink}</a>
        </p>
      )}
    </div>
  );
}