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
    checkPageBreak(35);
    // Warning box - Matching UI amber-50 theme
    doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
    doc.rect(margin, yPosition - 3, contentWidth, 30, "F");
    doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
    doc.setLineWidth(1);
    doc.rect(margin, yPosition - 3, contentWidth, 30, "S");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#78350f");
    doc.text("How to Read This Report", margin + 3, yPosition + 6);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#92400e");
    const howToReadLines = [
      "• This report provides guidance, not guarantees.",
      "• Astrology highlights favorable and challenging periods, not fixed outcomes.",
      "• Use this report for planning and awareness, not absolute prediction.",
    ];
    const lineSpacing = 10 * 1.4 * 0.3528; // Consistent line spacing
    howToReadLines.forEach((line: string) => {
      if (yPosition + lineSpacing > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += lineSpacing;
    });
    yPosition += 8;

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
    // 4. CONFIDENCE LEVEL (MANDATORY - Prominent)
    // ============================================
    checkPageBreak(25);
    // Confidence box - Matching UI blue-50/blue-100 theme
    doc.setFillColor(239, 246, 255); // blue-50 (#eff6ff) - lighter, matches UI
    doc.rect(margin, yPosition - 3, contentWidth, 20, "F");
    doc.setDrawColor(59, 130, 246); // blue-500 (#3b82f6)
    doc.setLineWidth(1);
    doc.rect(margin, yPosition - 3, contentWidth, 20, "S");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e40af");
    doc.text("Confidence Level", margin + 3, yPosition + 6);
    yPosition += 8;

    // Extract confidence from content
    const overallConfidenceMatch = reportContent.summary?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i) || 
                                   reportContent.executiveSummary?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i) ||
                                   reportContent.sections[0]?.content?.match(/Confidence.*?(\d+\/10|★+|High|Medium|Low)/i);
    
    if (overallConfidenceMatch) {
      const confidenceText = cleanText(overallConfidenceMatch[0]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#1e40af");
      checkPageBreak(8);
      doc.text(confidenceText, margin + 3, yPosition);
      yPosition += (12 * 1.4 * 0.3528) + 2;
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
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#1e40af");
      checkPageBreak(8);
      doc.text(`Confidence Level: ${defaultConfidence}`, margin + 3, yPosition);
      yPosition += (12 * 1.4 * 0.3528) + 2;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#1e40af");
    checkPageBreak(6);
    doc.text("This score reflects data completeness and astrological clarity.", margin + 3, yPosition);
    yPosition += (9 * 1.4 * 0.3528) + 6;

    // ============================================
    // 5. EXECUTIVE SUMMARY (1 page max - Summary)
    // ============================================
    checkPageBreak(40);
    // Section divider - Matching UI purple-600 theme
    doc.setDrawColor(147, 51, 234); // purple-600 (#9333ea)
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    addText("Executive Summary", 16, true, "#1e293b", 1.4, 4);
    addText("Summary for busy users", 10, false, "#64748b", 1.4, 6);

    // Display executive summary or regular summary
    const summaryText = (reportContent.executiveSummary || reportContent.summary || "")
      .split(/\n/)
      .filter(line => 
        !line.match(/^Based on:/i) && 
        !line.match(/^Confidence:/i) &&
        !line.match(/^Data Source:/i)
      )
      .join('\n');
    
    if (summaryText.trim()) {
      addText(summaryText, 11, false, "#334155", 1.6, 6); // Better line height for summary readability
    }

    // Add timing hierarchy disclaimer for Full Life Report
    if (reportType === "full-life") {
      // Disclaimer box - Matching UI amber-50 theme
      doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
      doc.rect(margin, yPosition - 3, contentWidth, 12, "F");
      doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 3, contentWidth, 12, "S");
      doc.setFontSize(9);
      doc.setTextColor("#78350f");
      doc.setFont("helvetica", "italic");
      const disclaimerText = "Note: This report provides a high-level overview. Timing-specific insights are refined in dedicated reports. " +
                             "For precise marriage timing windows, see the Marriage Timing Report. " +
                             "For detailed career phases, see the Career & Money Report.";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 4);
      const disclaimerSpacing = 9 * 1.4 * 0.3528;
      disclaimerLines.forEach((line: string) => {
        if (yPosition + disclaimerSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += disclaimerSpacing;
      });
      yPosition += 4;
    }
    yPosition += 5;

    // Main sections
    reportContent.sections.forEach((section, sectionIdx) => {
      checkPageBreak(30);

      // Section divider
      if (sectionIdx > 0 || reportContent.summary) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }

      // Section title (clean and format)
      const cleanedTitle = cleanText(section.title);
      // Remove "- Key Insight" suffix if present for cleaner titles
      const formattedTitle = cleanedTitle.replace(/\s*-\s*Key\s+Insight\s*$/i, "").trim();
      addText(formattedTitle, 16, true, "#1e293b", 1.4, 4);

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
      if (section.content) {
        const cleanContent = section.content
          .split(/\n/)
          .filter(line => 
            !line.match(/^Confidence:/i) && 
            !line.match(/^Timeline:/) &&
            !line.match(/^Based on:/i) &&
            !line.match(/^Why this timing may differ/i)
          )
          .join('\n');
        if (cleanContent.trim()) {
          addText(cleanContent, 11, false, "#334155", 1.6, 6); // Better line height for readability
        }
      }

      // Extract and display "Why timing differs" explanation box if present
      const timingDiffMatch = section.content?.match(/Why this timing may differ.*?(?:\n\n|\n[A-Z]|$)/is);
      if (timingDiffMatch) {
        checkPageBreak(25);
        // Info box - Matching UI blue-50 theme
        doc.setFillColor(239, 246, 255); // blue-50 (#eff6ff) - matches UI
        doc.rect(margin, yPosition - 3, contentWidth, 18, "F");
        doc.setDrawColor(59, 130, 246); // blue-500 (#3b82f6)
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition - 3, contentWidth, 18, "S");
        doc.setFontSize(9);
        doc.setTextColor("#1e40af");
        doc.setFont("helvetica", "bold");
        const headerText = cleanText("Why this timing may differ from other reports:");
        doc.text(headerText, margin + 2, yPosition + 3);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        const explanationText = cleanText(timingDiffMatch[0].replace(/Why this timing may differ.*?:/i, '').trim());
        const explanationLines = doc.splitTextToSize(explanationText, contentWidth - 4);
        const explanationSpacing = 9 * 1.4 * 0.3528;
        explanationLines.forEach((line: string, idx: number) => {
          if (yPosition + explanationSpacing > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 2, yPosition);
          yPosition += explanationSpacing;
        });
        yPosition += 4;
      }

      // Bullets
      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach((bullet) => {
          doc.setFontSize(11);
          doc.setTextColor("#334155");
          doc.setFont("helvetica", "normal");
          const cleanedBullet = cleanText(bullet);
          const bulletLines = doc.splitTextToSize(`• ${cleanedBullet}`, contentWidth - 10);
          const bulletSpacing = 11 * 1.5 * 0.3528;
          
          bulletLines.forEach((line: string, idx: number) => {
            if (yPosition + bulletSpacing > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
            yPosition += bulletSpacing;
          });
          yPosition += 3; // Space between bullets
        });
      }

      // Subsections
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          checkPageBreak(20);
          yPosition += 5;

          // Subsection title (clean and format)
          const cleanedSubtitle = cleanText(subsection.title);
          addText(cleanedSubtitle, 14, true, "#475569", 1.4, 4);

          // Subsection content
          if (subsection.content) {
            addText(subsection.content, 11, false, "#334155", 1.6, 5); // Better line height
          }

          // Subsection bullets
          if (subsection.bullets && subsection.bullets.length > 0) {
            subsection.bullets.forEach((bullet) => {
              doc.setFontSize(11);
              doc.setTextColor("#334155");
              doc.setFont("helvetica", "normal");
              const cleanedBullet = cleanText(bullet);
              const bulletLines = doc.splitTextToSize(`  • ${cleanedBullet}`, contentWidth - 10);
              const bulletSpacing = 11 * 1.5 * 0.3528;
              
              bulletLines.forEach((line: string, idx: number) => {
                if (yPosition + bulletSpacing > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
                yPosition += bulletSpacing;
              });
              yPosition += 3; // Space between bullets
            });
          }
        });
      }

      yPosition += 8; // More space between sections
    });

    // Key Insights section (if present)
    if (reportContent.keyInsights && reportContent.keyInsights.length > 0) {
      checkPageBreak(30);

      // Key Insights divider - Matching UI amber theme
      doc.setDrawColor(245, 158, 11); // amber-500 (#f59e0b) - matches UI
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Amber background box - Matching UI amber-50 theme
      doc.setFillColor(255, 251, 235); // amber-50 (#fffbeb) - lighter, matches UI
      doc.rect(margin, yPosition - 5, contentWidth, 10, "F");

      addText("Key Insights", 16, true, "#92400e"); // amber-800 - matches UI
      yPosition += 5;

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

    // Footer on last page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor("#94a3b8");
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      doc.text(
        "Generated by AstroSetu - AI-Powered Astrology",
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    }

    // Compressed Disclaimer (only on last page, shortened)
    checkPageBreak(25);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(8);
    doc.setTextColor("#64748b");
    doc.setFont("helvetica", "italic");
    const compressedDisclaimer = "Disclaimer: AI-generated for educational purposes only. Not a substitute for professional advice. " +
                                 "Guidance based on astrological calculations, not guarantees. " +
                                 "No change-of-mind refunds on digital reports (this does not limit rights under Australian Consumer Law).";
    const disclaimerLines = doc.splitTextToSize(compressedDisclaimer, contentWidth);
    const disclaimerSpacing = 8 * 1.4 * 0.3528;
    disclaimerLines.forEach((line: string) => {
      if (yPosition + disclaimerSpacing > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += disclaimerSpacing;
    });

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

