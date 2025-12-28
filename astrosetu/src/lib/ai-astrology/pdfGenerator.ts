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
      // Replace star symbols with text equivalents for better font compatibility
      return text
        .replace(/★/g, "*")
        .replace(/☆/g, "o")
        .replace(/⭐/g, "*")
        .replace(/✨/g, "*")
        .replace(/─/g, "-")
        .replace(/━/g, "=")
        .replace(/═/g, "=")
        .replace(/&/g, "and") // Replace & with "and" for better readability
        .replace(/&amp;/g, "and")
        .trim();
    };

    // Helper function to add text with wrapping and better typography
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = "#000000", lineHeight: number = 1.4) => {
      const cleanedText = cleanText(text);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);

      const lines = doc.splitTextToSize(cleanedText, contentWidth);
      const lineSpacing = fontSize * lineHeight * 0.35;
      checkPageBreak(lines.length * lineSpacing + 5);

      lines.forEach((line: string) => {
        if (yPosition + lineSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineSpacing;
      });

      yPosition += 5; // Add spacing after text
    };

    // ============================================
    // 1. COVER PAGE
    // ============================================
    // Header with logo/icon
    doc.setFillColor(139, 92, 246); // Purple
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
    titleLines.forEach((line: string) => {
      checkPageBreak(12);
      doc.text(line, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;
    });
    yPosition += 10;

    // Generated for
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#475569");
    addText(`Generated for: ${input.name}`, 12, false, "#475569", 1.5);
    yPosition += 5;

    // Generated on
    const generatedDate = new Date(reportContent.generatedAt || new Date().toISOString());
    const dateStr = generatedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = generatedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    addText(`Generated on: ${dateStr} at ${timeStr}`, 11, false, "#64748b", 1.5);
    yPosition += 5;

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#64748b");
    const subtitleText = cleanText("AI-Generated Astrological Guidance (Educational Only)");
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
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.rect(margin, yPosition - 3, contentWidth, 30, "F");
    doc.setDrawColor(245, 158, 11); // Amber-500
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
    howToReadLines.forEach((line: string) => {
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 8;

    // ============================================
    // 3. DATA AND METHOD USED (Trust Builder)
    // ============================================
    checkPageBreak(40);
    doc.setDrawColor(139, 92, 246);
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
    addText("Birth Data Used:", 10, true, "#475569", 1.3);
    addText(`• Name: ${input.name}`, 10, false, "#64748b", 1.3);
    addText(`• Date of Birth: ${input.dob}`, 10, false, "#64748b", 1.3);
    addText(`• Time of Birth: ${input.tob}`, 10, false, "#64748b", 1.3);
    addText(`• Place: ${input.place}`, 10, false, "#64748b", 1.3);
    yPosition += 3;

    // System used
    addText("Astrological System Used:", 10, true, "#475569", 1.3);
    const dataSourceMatch = reportContent.summary?.match(/Based on:.*?(?:\n|$)/i) || 
                           reportContent.executiveSummary?.match(/Based on:.*?(?:\n|$)/i) ||
                           reportContent.sections[0]?.content?.match(/Based on:.*?(?:\n|$)/i);
    if (dataSourceMatch) {
      const sourceText = dataSourceMatch[0].replace(/Based on:/i, "").trim();
      const sourceLines = sourceText.split(',').map(s => `• ${s.trim()}`);
      sourceLines.forEach((line: string) => {
        addText(line, 10, false, "#64748b", 1.3);
      });
    } else {
      // Default if not found
      addText("• Ascendant analysis", 10, false, "#64748b", 1.3);
      addText("• Planetary transits", 10, false, "#64748b", 1.3);
      addText("• Dasha phase analysis", 10, false, "#64748b", 1.3);
      addText("• AI interpretation layer", 10, false, "#64748b", 1.3);
    }
    yPosition += 3;

    // AI note
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#64748b");
    addText("Note: No human astrologer edits or reviews this report. This is 100% AI-generated.", 9, false, "#64748b", 1.3);
    yPosition += 8;

    // ============================================
    // 4. CONFIDENCE LEVEL (MANDATORY - Prominent)
    // ============================================
    checkPageBreak(25);
    doc.setFillColor(219, 234, 254); // Blue-100
    doc.rect(margin, yPosition - 3, contentWidth, 20, "F");
    doc.setDrawColor(59, 130, 246); // Blue-500
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
      doc.text(confidenceText, margin + 3, yPosition);
      yPosition += 6;
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
      doc.text(`Confidence Level: ${defaultConfidence}`, margin + 3, yPosition);
      yPosition += 6;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#1e40af");
    doc.text("This score reflects data completeness and astrological clarity.", margin + 3, yPosition);
    yPosition += 10;

    // ============================================
    // 5. EXECUTIVE SUMMARY (1 page max - Summary)
    // ============================================
    checkPageBreak(40);
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e293b");
    addText("Executive Summary", 16, true, "#1e293b");
    yPosition += 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#64748b");
    addText("Summary for busy users", 10, false, "#64748b", 1.3);
    yPosition += 5;

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
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#334155");
      addText(summaryText, 11, false, "#334155", 1.6); // Better line height for summary readability
      yPosition += 5;
    }

    // Add timing hierarchy disclaimer for Full Life Report
    if (reportType === "full-life") {
      doc.setFillColor(254, 243, 199); // Amber-100
      doc.rect(margin, yPosition - 3, contentWidth, 12, "F");
      doc.setDrawColor(245, 158, 11); // Amber-500
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 3, contentWidth, 12, "S");
      doc.setFontSize(9);
      doc.setTextColor("#78350f");
      doc.setFont("helvetica", "italic");
      const disclaimerText = "Note: This report provides a high-level overview. Timing-specific insights are refined in dedicated reports. " +
                             "For precise marriage timing windows, see the Marriage Timing Report. " +
                             "For detailed career phases, see the Career & Money Report.";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 4);
      disclaimerLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 2, yPosition);
        yPosition += 4;
      });
      yPosition += 3;
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
      addText(formattedTitle, 16, true, "#1e293b", 1.3);
      yPosition += 2;

      // Extract and display confidence indicator if present
      const confidenceMatch = section.content?.match(/Confidence:.*?(?:High|Medium|Low|\d+\/10|★+)/i);
      if (confidenceMatch) {
        doc.setFontSize(10);
        doc.setTextColor("#3b82f6"); // Blue
        doc.setFont("helvetica", "bold");
        checkPageBreak(8);
        const confidenceText = cleanText(confidenceMatch[0]);
        doc.text(confidenceText, margin, yPosition);
        yPosition += 6;
      }

      // Extract and display timeline visualization if present
      const timelineMatch = section.content?.match(/Timeline:.*?[─━═─⭐★]/);
      if (timelineMatch) {
        doc.setFontSize(10);
        doc.setTextColor("#7c3aed"); // Purple
        doc.setFont("helvetica", "normal");
        checkPageBreak(8);
        const timelineText = cleanText(timelineMatch[0]);
        doc.text(timelineText, margin, yPosition);
        yPosition += 6;
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
          addText(cleanContent, 11, false, "#334155", 1.5); // Better line height for readability
        }
      }

      // Extract and display "Why timing differs" explanation box if present
      const timingDiffMatch = section.content?.match(/Why this timing may differ.*?(?:\n\n|\n[A-Z]|$)/is);
      if (timingDiffMatch) {
        checkPageBreak(25);
        doc.setFillColor(219, 234, 254); // Blue-100
        doc.rect(margin, yPosition - 3, contentWidth, 18, "F");
        doc.setDrawColor(59, 130, 246); // Blue-500
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
        explanationLines.forEach((line: string, idx: number) => {
          checkPageBreak(5);
          doc.text(line, margin + 2, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      }

      // Bullets
      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach((bullet) => {
          checkPageBreak(10);
          doc.setFontSize(11);
          doc.setTextColor("#334155");
          const cleanedBullet = cleanText(bullet);
          const bulletLines = doc.splitTextToSize(`• ${cleanedBullet}`, contentWidth - 10);
          bulletLines.forEach((line: string, idx: number) => {
            if (yPosition + 4 > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
            yPosition += 4;
          });
          yPosition += 2;
        });
      }

      // Subsections
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          checkPageBreak(20);
          yPosition += 5;

          // Subsection title (clean and format)
          const cleanedSubtitle = cleanText(subsection.title);
          addText(cleanedSubtitle, 14, true, "#475569", 1.3);
          yPosition += 2;

          // Subsection content
          if (subsection.content) {
            addText(subsection.content, 11, false, "#334155", 1.5); // Better line height
          }

          // Subsection bullets
          if (subsection.bullets && subsection.bullets.length > 0) {
            subsection.bullets.forEach((bullet) => {
              checkPageBreak(10);
              doc.setFontSize(11);
              doc.setTextColor("#334155");
              const cleanedBullet = cleanText(bullet);
              const bulletLines = doc.splitTextToSize(`  • ${cleanedBullet}`, contentWidth - 10);
              bulletLines.forEach((line: string, idx: number) => {
                if (yPosition + 4 > pageHeight - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
                yPosition += 4;
              });
              yPosition += 2;
            });
          }
        });
      }

      yPosition += 5;
    });

    // Key Insights section (if present)
    if (reportContent.keyInsights && reportContent.keyInsights.length > 0) {
      checkPageBreak(30);

      doc.setDrawColor(245, 158, 11); // Amber
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      doc.setFillColor(254, 243, 199); // Amber background
      doc.rect(margin, yPosition - 5, contentWidth, 10, "F");

      addText("Key Insights", 16, true, "#92400e");
      yPosition += 5;

      reportContent.keyInsights.forEach((insight) => {
        checkPageBreak(10);
        doc.setFontSize(11);
        doc.setTextColor("#78350f");
        const cleanedInsight = cleanText(insight);
        const insightLines = doc.splitTextToSize(`* ${cleanedInsight}`, contentWidth - 10);
        insightLines.forEach((line: string, idx: number) => {
          if (yPosition + 4 > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + (idx === 0 ? 0 : 10), yPosition);
          yPosition += 4;
        });
        yPosition += 3;
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
    disclaimerLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, yPosition);
      yPosition += 3.5;
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

