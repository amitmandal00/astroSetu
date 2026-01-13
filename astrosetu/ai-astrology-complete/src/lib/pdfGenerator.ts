/**
 * PDF Report Generator for AI Astrology Reports
 * Generates branded, professional PDF reports
 */

import type { ReportContent, AIAstrologyInput, ReportType } from "./types";

// Dynamically import jsPDF to avoid SSR issues
let jsPDF: any = null;
let html2canvas: any = null;

async function loadPDFLibraries() {
  if (typeof window === "undefined") {
    // Server-side, return null (PDF generation happens client-side)
    return null;
  }

  if (!jsPDF) {
    jsPDF = (await import("jspdf")).default;
  }

  // html2canvas is optional for image-based PDFs
  // For now, we'll use text-based PDF generation

  return jsPDF;
}

/**
 * Generate PDF from report content (client-side only)
 */
export async function generatePDF(
  reportContent: ReportContent,
  input: AIAstrologyInput,
  reportType: string
): Promise<Blob | null> {
  if (typeof window === "undefined") {
    console.error("PDF generation must be done client-side");
    return null;
  }

  const startTime = Date.now();
  console.log("[PDF] Starting PDF generation for", reportType);
  
  try {
    const PDF = await loadPDFLibraries();
    if (!PDF) {
      throw new Error("Failed to load PDF library");
    }
    
    console.log("[PDF] PDF library loaded, starting document creation...");

    const doc = new PDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to clean text and replace problematic characters
    const cleanText = (text: string): string => {
      if (!text) return "";
      // Replace star symbols with text equivalents for better font compatibility
      return text
        .replace(/★/g, "*")
        .replace(/☆/g, "o")
        .replace(/⭐/g, "*")
        .replace(/✨/g, "*")
        .replace(/─/g, "-")
        .replace(/━/g, "=")
        .replace(/═/g, "=")
        .replace(/—/g, "-") // Em dash
        .replace(/–/g, "-") // En dash
        .replace(/"/g, '"') // Left double quote
        .replace(/"/g, '"') // Right double quote
        .replace(/'/g, "'") // Left single quote
        .replace(/'/g, "'") // Right single quote
        .replace(/…/g, "...") // Ellipsis
        .replace(/&/g, "and") // Replace & with "and" for better readability
        .replace(/&amp;/g, "and")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
    };

    // Helper function to add text with wrapping and better typography
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = "#000000", lineHeight: number = 1.5, addBottomSpacing: number = 6) => {
      if (!text || text.trim() === "") return;
      
      const cleanedText = cleanText(text);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);

      const lines = doc.splitTextToSize(cleanedText, contentWidth);
      // Better line spacing calculation - convert pt to mm (1pt ≈ 0.3528mm)
      const lineSpacing = (fontSize * lineHeight * 0.3528);
      const totalHeight = lines.length * lineSpacing + addBottomSpacing;
      
      // Check if we need a new page before starting
      if (yPosition + totalHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      lines.forEach((line: string, index: number) => {
        // Check for page break during multi-line text
        if (yPosition + lineSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineSpacing;
      });

      yPosition += addBottomSpacing; // Add spacing after text block
    };

    // Helper function to add paragraphs with intelligent spacing and structure
    const addParagraph = (text: string, fontSize: number = 11, isBold: boolean = false, color: string = "#334155", lineHeight: number = 1.7, addBottomSpacing: number = 8) => {
      if (!text || text.trim() === "") return;
      
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);
      
      // Split by double newlines for paragraphs (preserve structure)
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
      
      paragraphs.forEach((paragraph, paraIndex) => {
        // Add small spacing between paragraphs (except first)
        if (paraIndex > 0) {
          yPosition += 4; // Reduced spacing between paragraphs
        }
        
        // Process paragraph - handle both single lines and multi-line content
        const cleanedParagraph = cleanText(paragraph);
        
        // Check if paragraph contains bullets or is structured text
        const hasBullets = /^[•\-\*]\s/m.test(cleanedParagraph) || /^\d+\.\s/m.test(cleanedParagraph);
        
        if (hasBullets) {
          // Handle structured content with bullets
          const lines = cleanedParagraph.split(/\n/).filter(l => l.trim());
          lines.forEach((line) => {
            const cleanedLine = line.trim();
            if (!cleanedLine) return;
            
            // Check if it's a bullet point or numbered item
            const isBullet = /^[•\-\*]\s/.test(cleanedLine) || /^\d+\.\s/.test(cleanedLine);
            
            if (isBullet) {
              // Better formatting for bullets
              const bulletText = cleanedLine.replace(/^[•\-\*]\s/, "").replace(/^\d+\.\s/, "");
              const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 8); // Indent for bullets
              const lineSpacing = (fontSize * lineHeight * 0.3528);
              
              bulletLines.forEach((bulletLine: string, idx: number) => {
                if (yPosition + lineSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(color);
                doc.text(idx === 0 ? `• ${bulletLine}` : `  ${bulletLine}`, margin + (idx === 0 ? 0 : 8), yPosition);
                yPosition += lineSpacing;
              });
              yPosition += 3; // Space after bullet
            } else {
              // Regular line within structured content
              const wrappedLines = doc.splitTextToSize(cleanedLine, contentWidth);
              const lineSpacing = (fontSize * lineHeight * 0.3528);
              
              wrappedLines.forEach((wrappedLine: string) => {
                if (yPosition + lineSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(color);
                doc.text(wrappedLine, margin, yPosition);
                yPosition += lineSpacing;
              });
              yPosition += 2; // Small space after line
            }
          });
        } else {
          // Regular paragraph - wrap text intelligently
          const wrappedLines = doc.splitTextToSize(cleanedParagraph, contentWidth);
          const lineSpacing = (fontSize * lineHeight * 0.3528);
          
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition + lineSpacing > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(color);
            doc.text(wrappedLine, margin, yPosition);
            yPosition += lineSpacing;
          });
          yPosition += 3; // Space after paragraph
        }
      });
      
      yPosition += addBottomSpacing; // Final spacing after all paragraphs
    };

    // ============================================
    // 1. COVER PAGE
    // ============================================
    // Header with logo/icon - Matching UI purple-600 theme
    doc.setFillColor(147, 51, 234); // purple-600 (#9333ea) - matches UI theme
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("AstroSetu", margin, 25);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Astrology Reports", margin, 33);
    
    yPosition = 55;

    // Report Title (Large, centered)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e293b");
    const cleanedTitle = cleanText(reportContent.title);
    const titleLines = doc.splitTextToSize(cleanedTitle, contentWidth);
    const titleSpacing = 24 * 1.3 * 0.3528; // Line spacing for title
    checkPageBreak(titleLines.length * titleSpacing + 15);
    
    titleLines.forEach((line: string) => {
      if (yPosition + titleSpacing > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, pageWidth / 2, yPosition, { align: "center" });
      yPosition += titleSpacing;
    });
    yPosition += 10;

    // Generated for
    addText(`Generated for: ${input.name}`, 12, false, "#475569", 1.5, 4);

    // Generated on
    const generatedDate = new Date(reportContent.generatedAt || new Date().toISOString());
    const dateStr = generatedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = generatedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    addText(`Generated on: ${dateStr} at ${timeStr}`, 11, false, "#64748b", 1.5, 8);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#64748b");
    const subtitleText = cleanText("AI-Generated Astrological Guidance (Educational Only)");
    checkPageBreak(12);
    doc.text(subtitleText, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Report ID if present
    if (reportContent.reportId) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#94a3b8");
      doc.text(`Report ID: ${reportContent.reportId}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 5;
    }

    // New page for content
    doc.addPage();
    yPosition = margin;

    // ============================================
    // 2. HOW TO READ THIS REPORT (NEW - CRITICAL)
    // ============================================
    const boxPadding = 3;
    const boxStartY = yPosition;
    
    // Calculate text height first
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const headerHeight = 14 * 1.4 * 0.3528;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lineSpacing = 10 * 1.4 * 0.3528;
    const howToReadLines = [
      "• This report provides guidance, not guarantees.",
      "• Astrology highlights favorable and challenging periods, not fixed outcomes.",
      "• Use this report for planning and awareness, not absolute prediction.",
    ];
    const totalTextHeight = headerHeight + (howToReadLines.length * lineSpacing) + 8;
    const boxHeight = totalTextHeight + (boxPadding * 2);
    
    checkPageBreak(boxHeight + 10);
    
    // Draw box with calculated height - Matching UI amber-50 theme
    doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
    doc.rect(margin, boxStartY, contentWidth, boxHeight, "F");
    doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
    doc.setLineWidth(1);
    doc.rect(margin, boxStartY, contentWidth, boxHeight, "S");
    
    yPosition = boxStartY + boxPadding;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#78350f");
    doc.text("How to Read This Report", margin + boxPadding, yPosition + (14 * 0.3528));
    yPosition += headerHeight + 4;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#92400e");
    howToReadLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding + 2, yPosition);
      yPosition += lineSpacing;
    });
    yPosition = boxStartY + boxHeight + 8;

    // ============================================
    // 3. DATA AND METHOD USED (Trust Builder)
    // ============================================
    checkPageBreak(40);
    // Section divider - Matching UI purple-600 theme
    doc.setDrawColor(147, 51, 234); // purple-600 (#9333ea)
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e293b");
    addText("Data and Method Used", 14, true, "#1e293b");
    yPosition += 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#334155");

    // Birth data
    addText("Birth Data Used:", 10, true, "#475569", 1.4, 4);
    addText(`• Name: ${input.name}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Date of Birth: ${input.dob}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Time of Birth: ${input.tob}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Place: ${input.place}`, 10, false, "#64748b", 1.4, 4);

    // System used
    addText("Astrological System Used:", 10, true, "#475569", 1.4, 4);
    const dataSourceMatch = reportContent.summary?.match(/Based on:.*?(?:\n|$)/i) || 
                           reportContent.executiveSummary?.match(/Based on:.*?(?:\n|$)/i) ||
                           reportContent.sections[0]?.content?.match(/Based on:.*?(?:\n|$)/i);
    if (dataSourceMatch) {
      const sourceText = dataSourceMatch[0].replace(/Based on:/i, "").trim();
      const sourceLines = sourceText.split(',').map(s => `• ${s.trim()}`);
      sourceLines.forEach((line: string) => {
        addText(line, 10, false, "#64748b", 1.4, 3);
      });
    } else {
      // Default if not found
      addText("• Ascendant analysis", 10, false, "#64748b", 1.4, 3);
      addText("• Planetary transits", 10, false, "#64748b", 1.4, 3);
      addText("• Dasha phase analysis", 10, false, "#64748b", 1.4, 3);
      addText("• AI interpretation layer", 10, false, "#64748b", 1.4, 4);
    }

    // AI note
    addText("Note: No human astrologer edits or reviews this report. This is 100% AI-generated.", 9, false, "#64748b", 1.4, 10);

    // ============================================
    // 4. CONFIDENCE LEGEND (NEW - Before Confidence Level)
    // ============================================
    checkPageBreak(50);
    const legendBoxPadding = 4;
    const legendBoxStartY = yPosition;
    
    // Calculate legend box height
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const legendHeaderHeight = 12 * 1.4 * 0.3528;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const legendLineSpacing = 9 * 1.4 * 0.3528;
    const legendItems = [
      "Confidence levels indicate guidance strength, not certainty:",
      "• 8-10/10: Strong directional guidance for strategic planning",
      "• 6-7/10: Moderate guidance, useful for awareness",
      "• 4-5/10: Weaker guidance, use with caution",
      "• Below 4/10: Very weak, not recommended for decisions",
      "",
      "Note: Higher confidence does not mean guaranteed outcomes."
    ];
    const totalLegendHeight = legendHeaderHeight + (legendItems.length * legendLineSpacing) + (legendBoxPadding * 2);
    
    checkPageBreak(totalLegendHeight + 10);
    
    // Draw legend box
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(margin, legendBoxStartY, contentWidth, totalLegendHeight, "F");
    doc.setDrawColor(59, 130, 246); // blue-500
    doc.setLineWidth(1);
    doc.rect(margin, legendBoxStartY, contentWidth, totalLegendHeight, "S");
    
    yPosition = legendBoxStartY + legendBoxPadding;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e40af");
    doc.text("Understanding Confidence Levels", margin + legendBoxPadding, yPosition + (12 * 0.3528));
    yPosition += legendHeaderHeight + 4;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#1e3a8a");
    legendItems.forEach((item: string) => {
      if (item.trim() === "") {
        yPosition += legendLineSpacing * 0.5;
      } else {
        doc.text(item, margin + legendBoxPadding + 2, yPosition);
        yPosition += legendLineSpacing;
      }
    });
    yPosition = legendBoxStartY + totalLegendHeight + 8;

    // ============================================
    // 5. CONFIDENCE LEVEL (MANDATORY - Prominent)
    // ============================================
    const confidenceBoxPadding = 3;
    const confidenceBoxStartY = yPosition;
    
    // Calculate text height first
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const confidenceHeaderHeight = 14 * 1.4 * 0.3528;
    
    // Extract confidence from content
    const overallConfidenceMatch = reportContent.summary?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i) || 
                                   reportContent.executiveSummary?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i) ||
                                   reportContent.sections[0]?.content?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i);
    
    let confidenceText = "";
    if (overallConfidenceMatch) {
      confidenceText = cleanText(overallConfidenceMatch[0]);
    } else {
      // Default confidence based on report type (using text instead of stars for better compatibility)
      let defaultConfidence = "Medium (5-6/10)";
      if (reportType === "marriage-timing" || reportType === "career-money") {
        defaultConfidence = "Medium-High (6-7/10)";
      } else if (reportType === "full-life") {
        defaultConfidence = "Medium (5-6/10)";
      } else if (reportType === "year-analysis") {
        defaultConfidence = "Medium-High (6-8/10)";
      }
      confidenceText = `Confidence Level: ${defaultConfidence}`;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const confidenceTextHeight = 12 * 1.4 * 0.3528;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const noteText = "This score reflects data completeness and astrological clarity.";
    const noteLines = doc.splitTextToSize(noteText, contentWidth - (confidenceBoxPadding * 2));
    const noteSpacing = 9 * 1.4 * 0.3528;
    const noteHeight = noteLines.length * noteSpacing;
    
    const confidenceBoxHeight = confidenceHeaderHeight + confidenceTextHeight + noteHeight + (confidenceBoxPadding * 3) + 6;
    
    checkPageBreak(confidenceBoxHeight + 10);
    
    // Draw box with calculated height - Matching UI blue-50/blue-100 theme
    doc.setFillColor(239, 246, 255); // blue-50 (#eff6ff) - lighter, matches UI
    doc.rect(margin, confidenceBoxStartY, contentWidth, confidenceBoxHeight, "F");
    doc.setDrawColor(59, 130, 246); // blue-500 (#3b82f6)
    doc.setLineWidth(1);
    doc.rect(margin, confidenceBoxStartY, contentWidth, confidenceBoxHeight, "S");
    
    yPosition = confidenceBoxStartY + confidenceBoxPadding;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e40af");
    doc.text("Confidence Level", margin + confidenceBoxPadding, yPosition + (14 * 0.3528));
    yPosition += confidenceHeaderHeight + 2;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e40af");
    doc.text(confidenceText, margin + confidenceBoxPadding, yPosition);
    yPosition += confidenceTextHeight + 2;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#1e40af");
    noteLines.forEach((line: string) => {
      doc.text(line, margin + confidenceBoxPadding, yPosition);
      yPosition += noteSpacing;
    });
    
    yPosition = confidenceBoxStartY + confidenceBoxHeight + 6;

    // ============================================
    // 5. EXECUTIVE SUMMARY (1 page max - Summary)
    // ============================================
    checkPageBreak(30);
    // Section divider - Matching UI purple-600 theme
    doc.setDrawColor(147, 51, 234); // purple-600 (#9333ea)
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8; // Reduced spacing

    addText("Executive Summary", 16, true, "#1e293b", 1.3, 3);
    addText("Summary for busy users", 10, false, "#64748b", 1.3, 5);

    // Display executive summary or regular summary with intelligent paragraph formatting
    const summaryText = (reportContent.executiveSummary || reportContent.summary || "")
      .split(/\n/)
      .filter(line => 
        !line.match(/^Based on:/i) && 
        !line.match(/^Confidence:/i) &&
        !line.match(/^Data Source:/i)
      )
      .join('\n');
    
    if (summaryText.trim()) {
      // Use paragraph formatter for better structure
      addParagraph(summaryText, 11, false, "#334155", 1.7, 8);
    }

    // Add timing hierarchy disclaimer for Full Life Report
    if (reportType === "full-life") {
      yPosition += 4; // Add spacing before the box
      const disclaimerBoxPadding = 5; // Increased padding for better spacing
      const disclaimerBoxStartY = yPosition;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const disclaimerText = "Note: This report provides a high-level overview. Timing-specific insights are refined in dedicated reports. " +
                             "For precise marriage timing windows, see the Marriage Timing Report. " +
                             "For detailed career phases, see the Career & Money Report.";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - (disclaimerBoxPadding * 2));
      const disclaimerSpacing = 9 * 1.5 * 0.3528; // Increased line spacing from 1.4 to 1.5
      const disclaimerBoxHeight = (disclaimerLines.length * disclaimerSpacing) + (disclaimerBoxPadding * 2) + 2; // Added extra 2mm for better spacing
      
      checkPageBreak(disclaimerBoxHeight + 10);
      
      // Draw box with calculated height - Matching UI amber-50 theme
      doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
      doc.rect(margin, disclaimerBoxStartY, contentWidth, disclaimerBoxHeight, "F");
      doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
      doc.setLineWidth(0.5);
      doc.rect(margin, disclaimerBoxStartY, contentWidth, disclaimerBoxHeight, "S");
      
      doc.setFontSize(9);
      doc.setTextColor("#78350f");
      doc.setFont("helvetica", "italic");
      yPosition = disclaimerBoxStartY + disclaimerBoxPadding + 2; // Added 2mm top padding
      disclaimerLines.forEach((line: string, lineIdx: number) => {
        if (line.trim()) {
          doc.text(line, margin + disclaimerBoxPadding, yPosition + (9 * 0.3528)); // Proper text positioning
          yPosition += disclaimerSpacing;
        }
      });
      yPosition = disclaimerBoxStartY + disclaimerBoxHeight + 6; // Increased spacing after box
    }
    yPosition += 5;

    // Main sections
    reportContent.sections.forEach((section, sectionIdx) => {
      checkPageBreak(30);

      // Section divider - reduced spacing
      if (sectionIdx > 0 || reportContent.summary) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6; // Reduced spacing from 10 to 6
      }

      // Section title (clean and format)
      const cleanedTitle = cleanText(section.title);
      // Remove "- Key Insight" suffix if present for cleaner titles
      const formattedTitle = cleanedTitle.replace(/\s*-\s*Key\s+Insight\s*$/i, "").trim();
      
      // Special handling for Decision Anchor boxes in year analysis reports
      const isDecisionAnchor = !!formattedTitle.match(/Decision Anchor/i);
      if (isDecisionAnchor && reportType === "year-analysis") {
        const anchorBoxPadding = 4;
        const anchorBoxStartY = yPosition;
        
        // Calculate text height first
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const anchorHeaderHeight = 14 * 1.4 * 0.3528;
        
        // Extract decision anchor content (the main message after the title)
        const anchorContentMatch = section.content?.match(/Based on this report.*?\./i);
        let anchorContent = "";
        if (anchorContentMatch) {
          anchorContent = cleanText(anchorContentMatch[0]);
        } else {
          // Fallback: use first paragraph of content
          const firstPara = section.content?.split(/\n\n/)[0] || section.content || "";
          anchorContent = cleanText(firstPara.trim());
        }
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const anchorContentLines = doc.splitTextToSize(anchorContent, contentWidth - (anchorBoxPadding * 2));
        const anchorContentSpacing = 11 * 1.5 * 0.3528;
        const anchorContentHeight = anchorContentLines.length * anchorContentSpacing;
        
        const anchorBoxHeight = anchorHeaderHeight + anchorContentHeight + (anchorBoxPadding * 3) + 6;
        
        checkPageBreak(anchorBoxHeight + 10);
        
        // Draw prominent box - Matching UI purple-600 theme
        doc.setFillColor(245, 243, 255); // purple-50 (#f5f3ff) - lighter background
        doc.rect(margin, anchorBoxStartY, contentWidth, anchorBoxHeight, "F");
        doc.setDrawColor(147, 51, 234); // purple-600 (#9333ea)
        doc.setLineWidth(1.5);
        doc.rect(margin, anchorBoxStartY, contentWidth, anchorBoxHeight, "S");
        
        yPosition = anchorBoxStartY + anchorBoxPadding;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#6b21a8"); // purple-800
        doc.text(formattedTitle, margin + anchorBoxPadding, yPosition + (14 * 0.3528));
        yPosition += anchorHeaderHeight + 4;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#581c87"); // purple-900
        anchorContentLines.forEach((line: string) => {
          doc.text(line, margin + anchorBoxPadding, yPosition);
          yPosition += anchorContentSpacing;
        });
        
        yPosition = anchorBoxStartY + anchorBoxHeight + 8;
      } else {
        addText(formattedTitle, 16, true, "#1e293b", 1.3, 3); // Reduced spacing
      }

      // Extract and display confidence indicator if present
      const confidenceMatch = section.content?.match(/Confidence:.*?(?:High|Medium|Low|\d+\/10|★+)/i);
      if (confidenceMatch) {
        doc.setFontSize(10);
        doc.setTextColor("#3b82f6"); // Blue
        doc.setFont("helvetica", "bold");
        const confidenceText = cleanText(confidenceMatch[0]);
        const confidenceSpacing = 10 * 1.4 * 0.3528;
        if (yPosition + confidenceSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(confidenceText, margin, yPosition);
        yPosition += confidenceSpacing + 2;
      }

      // Extract and display timeline visualization if present
      const timelineMatch = section.content?.match(/Timeline:.*?[─━═─⭐★]/);
      if (timelineMatch) {
        doc.setFontSize(10);
        doc.setTextColor("#9333ea"); // purple-600 - matches UI theme
        doc.setFont("helvetica", "normal");
        const timelineText = cleanText(timelineMatch[0]);
        const timelineSpacing = 10 * 1.4 * 0.3528;
        if (yPosition + timelineSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(timelineText, margin, yPosition);
        yPosition += timelineSpacing + 2;
      }

      // Section content (without confidence/timeline lines, already extracted)
      // Skip content if it was already displayed in Decision Anchor box
      if (section.content && !(isDecisionAnchor && reportType === "year-analysis")) {
        const cleanContent = section.content
          .split(/\n/)
          .filter(line => 
            !line.match(/^Confidence:/i) && 
            !line.match(/^Timeline:/) &&
            !line.match(/^Based on:/i) &&
            !line.match(/^Why this timing may differ/i) &&
            !line.match(/Based on this report.*?\./i) // Skip Decision Anchor content if already displayed
          )
          .join('\n');
        if (cleanContent.trim()) {
          // Use intelligent paragraph formatting for better structure
          // Special formatting for Year Strategy sections
          const isYearStrategy = formattedTitle.match(/Year Strategy/i);
          if (isYearStrategy && reportType === "year-analysis") {
            // Better spacing for Year Strategy content
            addParagraph(cleanContent, 11, false, "#334155", 1.7, 6); // Use paragraph formatter
          } else {
            addParagraph(cleanContent, 11, false, "#334155", 1.7, 6); // Use paragraph formatter with consistent spacing
          }
        }
      }

      // Extract and display "Why timing differs" explanation box if present
      // Use [\s\S] instead of . with 's' flag for ES2017 compatibility
      const timingDiffMatch = section.content?.match(/Why this timing may differ[\s\S]*?(?:\n\n|\n[A-Z]|$)/i);
      if (timingDiffMatch) {
        const timingBoxPadding = 2;
        const timingBoxStartY = yPosition;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const headerText = cleanText("Why this timing may differ from other reports:");
        const headerHeight = 9 * 1.4 * 0.3528;
        
        doc.setFont("helvetica", "normal");
        const explanationText = cleanText(timingDiffMatch[0].replace(/Why this timing may differ.*?:/i, '').trim());
        const explanationLines = doc.splitTextToSize(explanationText, contentWidth - (timingBoxPadding * 2));
        const explanationSpacing = 9 * 1.4 * 0.3528;
        const explanationHeight = explanationLines.length * explanationSpacing;
        
        const timingBoxHeight = headerHeight + explanationHeight + (timingBoxPadding * 3) + 4;
        
        checkPageBreak(timingBoxHeight + 10);
        
        // Draw box with calculated height - Matching UI blue-50 theme
        doc.setFillColor(239, 246, 255); // blue-50 (#eff6ff) - matches UI
        doc.rect(margin, timingBoxStartY, contentWidth, timingBoxHeight, "F");
        doc.setDrawColor(59, 130, 246); // blue-500 (#3b82f6)
        doc.setLineWidth(0.5);
        doc.rect(margin, timingBoxStartY, contentWidth, timingBoxHeight, "S");
        
        doc.setFontSize(9);
        doc.setTextColor("#1e40af");
        doc.setFont("helvetica", "bold");
        yPosition = timingBoxStartY + timingBoxPadding;
        doc.text(headerText, margin + timingBoxPadding, yPosition + (9 * 0.3528));
        yPosition += headerHeight + 2;
        
        doc.setFont("helvetica", "normal");
        explanationLines.forEach((line: string) => {
          doc.text(line, margin + timingBoxPadding, yPosition);
          yPosition += explanationSpacing;
        });
        yPosition = timingBoxStartY + timingBoxHeight + 4;
      }

      // Bullets
      if (section.bullets && section.bullets.length > 0) {
        // Special formatting for Year Strategy bullets
        const isYearStrategy = formattedTitle.match(/Year Strategy/i);
        const bulletSpacingMultiplier = (isYearStrategy && reportType === "year-analysis") ? 1.8 : 1.5;
        const bulletBottomSpacing = (isYearStrategy && reportType === "year-analysis") ? 5 : 3;
        
        section.bullets.forEach((bullet) => {
          doc.setFontSize(11);
          doc.setTextColor("#334155");
          doc.setFont("helvetica", "normal");
          const cleanedBullet = cleanText(bullet);
          const bulletLines = doc.splitTextToSize(cleanedBullet, contentWidth - 8); // Better width for bullets
          const bulletSpacing = 11 * bulletSpacingMultiplier * 0.3528;
          
          bulletLines.forEach((line: string, idx: number) => {
            if (yPosition + bulletSpacing > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(idx === 0 ? `• ${line}` : `  ${line}`, margin, yPosition); // Proper indentation
            yPosition += bulletSpacing;
          });
          yPosition += bulletBottomSpacing; // Space between bullets
        });
      }

      // Subsections
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          checkPageBreak(20);
          yPosition += 3; // Reduced spacing from 5 to 3

          // Subsection title (clean and format)
          const cleanedSubtitle = cleanText(subsection.title);
          addText(cleanedSubtitle, 14, true, "#475569", 1.3, 3); // Reduced spacing

      // Subsection content - use paragraph formatter for better structure
      if (subsection.content) {
        // Better line height for year analysis reports
        const lineHeightMultiplier = (reportType === "year-analysis") ? 1.7 : 1.7;
        const bottomSpacing = (reportType === "year-analysis") ? 6 : 6;
        addParagraph(subsection.content, 11, false, "#334155", lineHeightMultiplier, bottomSpacing);
      }

          // Subsection bullets - improved formatting
          if (subsection.bullets && subsection.bullets.length > 0) {
            const bulletSpacingMultiplier = (reportType === "year-analysis") ? 1.7 : 1.6;
            const bulletBottomSpacing = (reportType === "year-analysis") ? 4 : 3;
            
            subsection.bullets.forEach((bullet) => {
              doc.setFontSize(11);
              doc.setTextColor("#334155");
              doc.setFont("helvetica", "normal");
              const cleanedBullet = cleanText(bullet);
              const bulletLines = doc.splitTextToSize(cleanedBullet, contentWidth - 8); // Better width for bullets
              const bulletSpacing = 11 * bulletSpacingMultiplier * 0.3528;
              
              bulletLines.forEach((line: string, idx: number) => {
                if (yPosition + bulletSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.text(idx === 0 ? `  • ${line}` : `    ${line}`, margin, yPosition); // Proper indentation
                yPosition += bulletSpacing;
              });
              yPosition += bulletBottomSpacing; // Space between bullets
            });
          }
        });
      }

      yPosition += 6; // Reduced spacing between sections for better page usage
    });

    // Key Insights section (if present)
    if (reportContent.keyInsights && reportContent.keyInsights.length > 0) {
      checkPageBreak(30);

      // Key Insights divider - Matching UI amber theme
      doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Calculate header box height
      const insightsHeaderBoxPadding = 3;
      const insightsHeaderBoxStartY = yPosition;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const insightsHeaderHeight = 16 * 1.4 * 0.3528;
      const insightsHeaderBoxHeight = insightsHeaderHeight + (insightsHeaderBoxPadding * 2);
      
      // Amber background box for header - Matching UI amber-50 theme
      doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
      doc.rect(margin, insightsHeaderBoxStartY, contentWidth, insightsHeaderBoxHeight, "F");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#92400e"); // amber-800 - matches UI
      yPosition = insightsHeaderBoxStartY + insightsHeaderBoxPadding;
      doc.text("Key Insights", margin + insightsHeaderBoxPadding, yPosition + (16 * 0.3528));
      yPosition = insightsHeaderBoxStartY + insightsHeaderBoxHeight + 5;

      reportContent.keyInsights.forEach((insight) => {
        doc.setFontSize(11);
        doc.setTextColor("#78350f");
        doc.setFont("helvetica", "normal");
        const cleanedInsight = cleanText(insight);
        const insightLines = doc.splitTextToSize(`* ${cleanedInsight}`, contentWidth - 10);
        const insightSpacing = 11 * 1.5 * 0.3528;
        
        insightLines.forEach((line: string, idx: number) => {
          if (yPosition + insightSpacing > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
          yPosition += insightSpacing;
        });
        yPosition += 4; // Space between insights
      });
    }

    // Enhanced Footer on every page with Report ID and timestamp
    const totalPages = doc.internal.pages.length - 1;
    const footerDate = new Date(reportContent.generatedAt || new Date().toISOString());
    const footerDateStr = footerDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const footerTimeStr = footerDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    
    // Check if disclaimer wasn't added to last page content, add it to last page footer
    const lastPageNeedsDisclaimer = yPosition + 20 < pageHeight - margin - 15;
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor("#94a3b8");
      
      const isLastPage = i === totalPages;
      
      // Add disclaimer to last page footer if there's space and it wasn't added earlier
      if (isLastPage && lastPageNeedsDisclaimer && yPosition + 20 < pageHeight - margin - 15) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        const footerDisclaimer = "Disclaimer: AI-generated for educational purposes only. Not a substitute for professional advice.";
        doc.text(
          footerDisclaimer,
          pageWidth / 2,
          pageHeight - 18,
          { align: "center" }
        );
      }
      
      // Page number
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
      
      // Report ID and timestamp
      const footerInfo = reportContent.reportId 
        ? `Report ID: ${reportContent.reportId} | Generated: ${footerDateStr} ${footerTimeStr}`
        : `Generated: ${footerDateStr} ${footerTimeStr}`;
      doc.text(
        footerInfo,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
      
      // Branding
      doc.text(
        "AstroSetu AI - Automated Astrology Reports",
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" }
      );
    }

    // Compressed Disclaimer (only on last page, shortened) - Add only if space available
    const disclaimerText = "Disclaimer: AI-generated for educational purposes only. Not a substitute for professional advice. " +
                           "Guidance based on astrological calculations, not guarantees. " +
                           "No change-of-mind refunds on digital reports (this does not limit rights under Australian Consumer Law).";
    const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
    const disclaimerSpacing = 8 * 1.3 * 0.3528;
    const disclaimerHeight = disclaimerLines.length * disclaimerSpacing + 12; // 12mm for divider and spacing
    
    // Only add disclaimer if there's enough space on current page, otherwise add to footer area
    if (yPosition + disclaimerHeight < pageHeight - margin - 15) {
      // Add disclaimer on same page if space available
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6; // Reduced spacing

      doc.setFontSize(8);
      doc.setTextColor("#64748b");
      doc.setFont("helvetica", "italic");
      disclaimerLines.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += disclaimerSpacing;
      });
    }
    // If not enough space, disclaimer will be in footer area (handled in footer section)

    // Generate blob
    console.log("[PDF] Generating PDF blob...");
    const pdfBlob = doc.output("blob");
    const generationTime = Date.now() - startTime;
    console.log(`[PDF] PDF generation completed successfully in ${generationTime}ms`);
    return pdfBlob;
  } catch (error: any) {
    const generationTime = Date.now() - startTime;
    console.error(`[PDF] Error generating PDF after ${generationTime}ms:`, error);
    // Provide more specific error messages
    if (error?.message?.includes("memory") || error?.message?.includes("too large")) {
      throw new Error("Report is too large for PDF generation. Please try a shorter report or contact support.");
    }
    if (error?.message?.includes("timeout")) {
      throw new Error("PDF generation timed out. Please try again.");
    }
    throw new Error(`PDF generation failed: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Helper to get report name from report type
 */
function getReportNameFromType(reportType: string): string {
  const names: Record<string, string> = {
    "life-summary": "Life Summary",
    "marriage-timing": "Marriage Timing Report",
    "career-money": "Career & Money Path Report",
    "full-life": "Full Life Report",
    "year-analysis": "Year Analysis Report",
    "major-life-phase": "3-5 Year Strategic Life Phase Report",
    "decision-support": "Decision Support Report",
  };
  return names[reportType] || reportType;
}

/**
 * Generate PDF for bundle (multiple reports)
 */
export async function generateBundlePDF(
  bundleContents: Map<string, ReportContent>,
  bundleReports: string[],
  input: AIAstrologyInput,
  bundleType: string
): Promise<Blob | null> {
  if (typeof window === "undefined") {
    console.error("PDF generation must be done client-side");
    return null;
  }

  const startTime = Date.now();
  console.log("[PDF] Starting bundle PDF generation for", bundleReports.length, "reports");
  
  try {
    const PDF = await loadPDFLibraries();
    if (!PDF) {
      throw new Error("Failed to load PDF library");
    }
    
    console.log("[PDF] PDF library loaded, starting bundle document creation...");

    const doc = new PDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper functions (reuse from generatePDF)
    const checkPageBreak = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    const cleanText = (text: string): string => {
      if (!text) return "";
      return text
        .replace(/★/g, "*")
        .replace(/☆/g, "o")
        .replace(/⭐/g, "*")
        .replace(/✨/g, "*")
        .replace(/─/g, "-")
        .replace(/━/g, "=")
        .replace(/═/g, "=")
        .replace(/—/g, "-")
        .replace(/–/g, "-")
        .replace(/"/g, '"')
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/'/g, "'")
        .replace(/…/g, "...")
        .replace(/&/g, "and")
        .replace(/&amp;/g, "and")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = "#000000", lineHeight: number = 1.5, addBottomSpacing: number = 6) => {
      if (!text || text.trim() === "") return;
      
      const cleanedText = cleanText(text);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);

      const lines = doc.splitTextToSize(cleanedText, contentWidth);
      const lineSpacing = (fontSize * lineHeight * 0.3528);
      const totalHeight = lines.length * lineSpacing + addBottomSpacing;
      
      if (yPosition + totalHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      lines.forEach((line: string) => {
        if (yPosition + lineSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineSpacing;
      });

      yPosition += addBottomSpacing;
    };

    const addParagraph = (text: string, fontSize: number = 11, isBold: boolean = false, color: string = "#334155", lineHeight: number = 1.7, addBottomSpacing: number = 8) => {
      if (!text || text.trim() === "") return;
      
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);
      
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
      
      paragraphs.forEach((paragraph) => {
        const cleanedParagraph = cleanText(paragraph);
        const hasBullets = /^[•\-\*]\s/m.test(cleanedParagraph) || /^\d+\.\s/m.test(cleanedParagraph);
        
        if (hasBullets) {
          const lines = cleanedParagraph.split(/\n/).filter(l => l.trim());
          lines.forEach((line) => {
            const cleanedLine = line.trim();
            if (!cleanedLine) return;
            
            const isBullet = /^[•\-\*]\s/.test(cleanedLine) || /^\d+\.\s/.test(cleanedLine);
            
            if (isBullet) {
              const bulletText = cleanedLine.replace(/^[•\-\*]\s/, "").replace(/^\d+\.\s/, "");
              const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 8);
              const lineSpacing = (fontSize * lineHeight * 0.3528);
              
              bulletLines.forEach((bulletLine: string, idx: number) => {
                if (yPosition + lineSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(color);
                doc.text(idx === 0 ? `• ${bulletLine}` : `  ${bulletLine}`, margin + (idx === 0 ? 0 : 8), yPosition);
                yPosition += lineSpacing;
              });
              yPosition += 3;
            } else {
              const wrappedLines = doc.splitTextToSize(cleanedLine, contentWidth);
              const lineSpacing = (fontSize * lineHeight * 0.3528);
              
              wrappedLines.forEach((wrappedLine: string) => {
                if (yPosition + lineSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(color);
                doc.text(wrappedLine, margin, yPosition);
                yPosition += lineSpacing;
              });
              yPosition += 2;
            }
          });
        } else {
          const wrappedLines = doc.splitTextToSize(cleanedParagraph, contentWidth);
          const lineSpacing = (fontSize * lineHeight * 0.3528);
          
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition + lineSpacing > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(color);
            doc.text(wrappedLine, margin, yPosition);
            yPosition += lineSpacing;
          });
          yPosition += 3;
        }
      });
      
      yPosition += addBottomSpacing;
    };

    // Bundle Cover Page
    doc.setFillColor(147, 51, 234); // purple-600
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("AstroSetu", margin, 25);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Astrology Reports", margin, 33);
    
    yPosition = 55;

    // Bundle Title
    const bundleTitleMap: Record<string, string> = {
      "life-decision-pack": "Complete Life Decision Pack",
      "all-3": "All 3 Reports Bundle",
      "any-2": "Any 2 Reports Bundle",
    };
    const bundleTitle = bundleTitleMap[bundleType] || "Bundle Reports";

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e293b");
    const titleLines = doc.splitTextToSize(bundleTitle, contentWidth);
    checkPageBreak(titleLines.length * 24 * 1.3 * 0.3528 + 15);
    
    titleLines.forEach((line: string) => {
      if (yPosition + 24 * 1.3 * 0.3528 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 24 * 1.3 * 0.3528;
    });
    yPosition += 10;

    addText(`Generated for: ${input.name}`, 12, false, "#475569", 1.5, 4);
    
    const generatedDate = new Date();
    const dateStr = generatedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = generatedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    addText(`Generated on: ${dateStr} at ${timeStr}`, 11, false, "#64748b", 1.5, 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#64748b");
    checkPageBreak(12);
    doc.text("AI-Generated Astrological Guidance (Educational Only)", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Bundle Contents List
    addText("Bundle Contents:", 14, true, "#1e293b", 1.3, 5);
    bundleReports.forEach((reportType, idx) => {
      const reportContent = bundleContents.get(reportType);
      const reportTitle = reportContent?.title || getReportNameFromType(reportType);
      addText(`${idx + 1}. ${cleanText(reportTitle)}`, 11, false, "#475569", 1.5, 3);
    });

    yPosition += 10;
    doc.addPage();
    yPosition = margin;

    // Add "How to Read This Report" section (once for bundle)
    const boxPadding = 3;
    const boxStartY = yPosition;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const headerHeight = 14 * 1.4 * 0.3528;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lineSpacing = 10 * 1.4 * 0.3528;
    const howToReadLines = [
      "• This report provides guidance, not guarantees.",
      "• Astrology highlights favorable and challenging periods, not fixed outcomes.",
      "• Use this report for planning and awareness, not absolute prediction.",
    ];
    const totalTextHeight = headerHeight + (howToReadLines.length * lineSpacing) + 8;
    const boxHeight = totalTextHeight + (boxPadding * 2);
    
    checkPageBreak(boxHeight + 10);
    
    doc.setFillColor(255, 251, 235); // amber-50
    doc.rect(margin, boxStartY, contentWidth, boxHeight, "F");
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.setLineWidth(1);
    doc.rect(margin, boxStartY, contentWidth, boxHeight, "S");
    
    yPosition = boxStartY + boxPadding;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#78350f");
    doc.text("How to Read This Report", margin + boxPadding, yPosition + (14 * 0.3528));
    yPosition += headerHeight + 4;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#92400e");
    howToReadLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding + 2, yPosition);
      yPosition += lineSpacing;
    });
    yPosition = boxStartY + boxHeight + 8;

    // Add "Data and Method Used" section (once for bundle)
    checkPageBreak(40);
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    addText("Data and Method Used", 14, true, "#1e293b");
    yPosition += 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#334155");

    addText("Birth Data Used:", 10, true, "#475569", 1.4, 4);
    addText(`• Name: ${input.name}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Date of Birth: ${input.dob}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Time of Birth: ${input.tob}`, 10, false, "#64748b", 1.4, 3);
    addText(`• Place: ${input.place}`, 10, false, "#64748b", 1.4, 4);

    addText("Astrological System Used:", 10, true, "#475569", 1.4, 4);
    addText("• Ascendant analysis", 10, false, "#64748b", 1.4, 3);
    addText("• Planetary transits", 10, false, "#64748b", 1.4, 3);
    addText("• Dasha phase analysis", 10, false, "#64748b", 1.4, 3);
    addText("• AI interpretation layer", 10, false, "#64748b", 1.4, 4);

    addText("Note: No human astrologer edits or reviews this report. This is 100% AI-generated.", 9, false, "#64748b", 1.4, 15);

    doc.addPage();
    yPosition = margin;

    // Generate each report in the bundle
    bundleReports.forEach((reportType, reportIdx) => {
      const reportContent = bundleContents.get(reportType);
      if (!reportContent) return;

      // Report Separator Page
      if (reportIdx > 0) {
        doc.addPage();
        yPosition = margin;

        // Divider
        doc.setDrawColor(147, 51, 234);
        doc.setLineWidth(2);
        doc.line(margin, pageHeight / 2 - 20, pageWidth - margin, pageHeight / 2 - 20);
        
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#9333ea");
        const separatorText = `Report ${reportIdx + 1} of ${bundleReports.length}`;
        doc.text(separatorText, pageWidth / 2, pageHeight / 2, { align: "center" });
        
        const reportTitleText = cleanText(reportContent.title);
        doc.setFontSize(16);
        doc.setTextColor("#1e293b");
        const reportTitleLines = doc.splitTextToSize(reportTitleText, contentWidth);
        let titleY = pageHeight / 2 + 15;
        reportTitleLines.forEach((line: string) => {
          doc.text(line, pageWidth / 2, titleY, { align: "center" });
          titleY += 16 * 1.3 * 0.3528;
        });

        doc.addPage();
        yPosition = margin;
      }

      // Generate this report's content (reuse single report PDF generation logic)
      // Cover page for this report
      doc.setFillColor(147, 51, 234);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("AstroSetu", margin, 25);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("AI-Powered Astrology Reports", margin, 33);
      
      yPosition = 55;

      // Report Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#1e293b");
      const cleanedTitle = cleanText(reportContent.title);
      const titleLines = doc.splitTextToSize(cleanedTitle, contentWidth);
      const titleSpacing = 20 * 1.3 * 0.3528;
      checkPageBreak(titleLines.length * titleSpacing + 15);
      
      titleLines.forEach((line: string) => {
        if (yPosition + titleSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, pageWidth / 2, yPosition, { align: "center" });
        yPosition += titleSpacing;
      });
      yPosition += 10;

      addText(`Generated for: ${input.name}`, 12, false, "#475569", 1.5, 4);
      
      const reportDate = new Date(reportContent.generatedAt || new Date().toISOString());
      const reportDateStr = reportDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
      const reportTimeStr = reportDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      addText(`Generated on: ${reportDateStr} at ${reportTimeStr}`, 11, false, "#64748b", 1.5, 8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor("#64748b");
      checkPageBreak(12);
      doc.text("AI-Generated Astrological Guidance (Educational Only)", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      if (reportContent.reportId) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#94a3b8");
        doc.text(`Report ID: ${reportContent.reportId}`, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
      }

      // Bundle indicator
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#9333ea");
      checkPageBreak(12);
      doc.text(`Part ${reportIdx + 1} of ${bundleReports.length} in ${bundleTitle}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      doc.addPage();
      yPosition = margin;

      // Executive Summary
      const summaryText = (reportContent.executiveSummary || reportContent.summary || "")
        .split(/\n/)
        .filter(line => 
          !line.match(/^Based on:/i) && 
          !line.match(/^Confidence:/i) &&
          !line.match(/^Data Source:/i)
        )
        .join('\n');
      
      if (summaryText.trim()) {
        checkPageBreak(30);
        doc.setDrawColor(147, 51, 234);
        doc.setLineWidth(1);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        addText("Executive Summary", 16, true, "#1e293b", 1.3, 3);
        addText("Summary for busy users", 10, false, "#64748b", 1.3, 5);
        addParagraph(summaryText, 11, false, "#334155", 1.7, 8);
      }

      // Sections
      reportContent.sections.forEach((section, sectionIdx) => {
        checkPageBreak(30);

        if (sectionIdx > 0 || reportContent.summary) {
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 6;
        }

        const cleanedTitle = cleanText(section.title);
        const formattedTitle = cleanedTitle.replace(/\s*-\s*Key\s+Insight\s*$/i, "").trim();
        addText(formattedTitle, 16, true, "#1e293b", 1.3, 3);

        if (section.content) {
          const cleanContent = section.content
            .split(/\n/)
            .filter(line => 
              !line.match(/^Confidence:/i) && 
              !line.match(/^Timeline:/) &&
              !line.match(/^Based on:/i)
            )
            .join('\n');
          if (cleanContent.trim()) {
            addParagraph(cleanContent, 11, false, "#334155", 1.7, 6);
          }
        }

        if (section.bullets && section.bullets.length > 0) {
          section.bullets.forEach((bullet) => {
            doc.setFontSize(11);
            doc.setTextColor("#334155");
            doc.setFont("helvetica", "normal");
            const cleanedBullet = cleanText(bullet);
            const bulletLines = doc.splitTextToSize(cleanedBullet, contentWidth - 8);
            const bulletSpacing = 11 * 1.5 * 0.3528;
            
            bulletLines.forEach((line: string, idx: number) => {
              if (yPosition + bulletSpacing > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(idx === 0 ? `• ${line}` : `  ${line}`, margin, yPosition);
              yPosition += bulletSpacing;
            });
            yPosition += 3;
          });
        }

        if (section.subsections && section.subsections.length > 0) {
          section.subsections.forEach((subsection) => {
            checkPageBreak(20);
            yPosition += 3;

            const cleanedSubtitle = cleanText(subsection.title);
            addText(cleanedSubtitle, 14, true, "#475569", 1.3, 3);

            if (subsection.content) {
              addParagraph(subsection.content, 11, false, "#334155", 1.7, 6);
            }

            if (subsection.bullets && subsection.bullets.length > 0) {
              subsection.bullets.forEach((bullet) => {
                doc.setFontSize(11);
                doc.setTextColor("#334155");
                doc.setFont("helvetica", "normal");
                const cleanedBullet = cleanText(bullet);
                const bulletLines = doc.splitTextToSize(cleanedBullet, contentWidth - 8);
                const bulletSpacing = 11 * 1.6 * 0.3528;
                
                bulletLines.forEach((line: string, idx: number) => {
                  if (yPosition + bulletSpacing > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                  }
                  doc.text(idx === 0 ? `  • ${line}` : `    ${line}`, margin, yPosition);
                  yPosition += bulletSpacing;
                });
                yPosition += 3;
              });
            }
          });
        }

        yPosition += 6;
      });

      // Key Insights
      if (reportContent.keyInsights && reportContent.keyInsights.length > 0) {
        checkPageBreak(30);

        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        addText("Key Insights", 16, true, "#92400e", 1.3, 5);

        reportContent.keyInsights.forEach((insight) => {
          doc.setFontSize(11);
          doc.setTextColor("#78350f");
          doc.setFont("helvetica", "normal");
          const cleanedInsight = cleanText(insight);
          const insightLines = doc.splitTextToSize(`* ${cleanedInsight}`, contentWidth - 10);
          const insightSpacing = 11 * 1.5 * 0.3528;
          
          insightLines.forEach((line: string, idx: number) => {
            if (yPosition + insightSpacing > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
            yPosition += insightSpacing;
          });
          yPosition += 4;
        });
      }
    });

    // Footer on all pages
    const totalPages = doc.internal.pages.length - 1;
    const footerDate = new Date();
    const footerDateStr = footerDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const footerTimeStr = footerDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor("#94a3b8");
      
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
      
      doc.text(
        `Generated: ${footerDateStr} ${footerTimeStr} | ${bundleTitle}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
      
      doc.text(
        "AstroSetu AI - Automated Astrology Reports",
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" }
      );
    }

    // Disclaimer on last page
    if (yPosition + 30 < pageHeight - margin - 15) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      doc.setFontSize(8);
      doc.setTextColor("#64748b");
      doc.setFont("helvetica", "italic");
      const disclaimerText = "Disclaimer: AI-generated for educational purposes only. Not a substitute for professional advice. " +
                             "Guidance based on astrological calculations, not guarantees. " +
                             "No change-of-mind refunds on digital reports (this does not limit rights under Australian Consumer Law).";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
      const disclaimerSpacing = 8 * 1.3 * 0.3528;
      
      disclaimerLines.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += disclaimerSpacing;
      });
    }

    console.log("[PDF] Generating bundle PDF blob...");
    const pdfBlob = doc.output("blob");
    const generationTime = Date.now() - startTime;
    console.log(`[PDF] Bundle PDF generation completed successfully in ${generationTime}ms`);
    return pdfBlob;
  } catch (error: any) {
    const generationTime = Date.now() - startTime;
    console.error(`[PDF] Error generating bundle PDF after ${generationTime}ms:`, error);
    // Provide more specific error messages
    if (error?.message?.includes("memory") || error?.message?.includes("too large")) {
      throw new Error("Bundle is too large for PDF generation. Please try downloading individual reports.");
    }
    if (error?.message?.includes("timeout")) {
      throw new Error("Bundle PDF generation timed out. Please try again or download individual reports.");
    }
    throw new Error(`Bundle PDF generation failed: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Download PDF (client-side only)
 * Supports both single reports and bundles
 */
export async function downloadPDF(
  reportContent: ReportContent,
  input: AIAstrologyInput,
  reportType: string,
  filename?: string,
  bundleContents?: Map<string, ReportContent>,
  bundleReports?: string[],
  bundleType?: string
): Promise<boolean> {
  const startTime = Date.now();
  try {
    let blob: Blob | null = null;

    // Check if this is a bundle
    if (bundleContents && bundleReports && bundleReports.length > 0 && bundleType) {
      console.log("[PDF] Generating bundle PDF...");
      // Generate bundle PDF with all reports
      blob = await generateBundlePDF(bundleContents, bundleReports, input, bundleType);
      if (!blob) {
        console.error("[PDF] Bundle PDF generation returned null");
        throw new Error("Bundle PDF generation failed - no blob returned");
      }
      
      console.log("[PDF] Bundle PDF generated, creating download...");
      const bundleTitleMap: Record<string, string> = {
        "life-decision-pack": "life-decision-pack",
        "all-3": "all-3-reports",
        "any-2": "any-2-reports",
      };
      const bundleFilename = bundleTitleMap[bundleType] || "bundle";
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `${bundleFilename}-${input.name}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      console.log("[PDF] Generating single report PDF...");
      // Single report PDF
      blob = await generatePDF(reportContent, input, reportType);
      if (!blob) {
        console.error("[PDF] Single PDF generation returned null");
        throw new Error("PDF generation failed - no blob returned");
      }

      console.log("[PDF] PDF generated, creating download...");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `${reportType}-${input.name}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[PDF] PDF download completed successfully in ${totalTime}ms`);
    return true;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[PDF] Error downloading PDF after ${totalTime}ms:`, error);
    // Re-throw with more context for better error handling
    throw error;
  }
}

