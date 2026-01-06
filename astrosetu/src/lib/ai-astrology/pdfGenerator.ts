/**
 * PDF Report Generator for AI Astrology Reports
 * Generates branded, professional PDF reports
 */

import type { ReportContent, AIAstrologyInput } from "./types";

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

  try {
    const PDF = await loadPDFLibraries();
    if (!PDF) {
      throw new Error("Failed to load PDF library");
    }

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
      const timingDiffMatch = section.content?.match(/Why this timing may differ.*?(?:\n\n|\n[A-Z]|$)/is);
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
    const pdfBlob = doc.output("blob");
    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Download PDF (client-side only)
 */
export async function downloadPDF(
  reportContent: ReportContent,
  input: AIAstrologyInput,
  reportType: string,
  filename?: string
): Promise<boolean> {
  try {
    const blob = await generatePDF(reportContent, input, reportType);
    if (!blob) {
      return false;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `${reportType}-${input.name}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return false;
  }
}

