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

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = "#000000") => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color);

      const lines = doc.splitTextToSize(text, contentWidth);
      checkPageBreak(lines.length * (fontSize * 0.35) + 5);

      lines.forEach((line: string) => {
        if (yPosition + (fontSize * 0.35) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.35;
      });

      yPosition += 5; // Add spacing after text
    };

    // Header with logo/icon
    doc.setFillColor(139, 92, 246); // Purple
    doc.rect(0, 0, pageWidth, 30, "F");
    
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("AstroSetu", margin, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Astrology Reports", margin + 60, 20);
    
    yPosition = 40;

    // Title
    addText(reportContent.title, 20, true, "#1e293b");
    yPosition += 5;

    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor("#64748b");
    addText(`Generated for: ${input.name}`, 10, false, "#64748b");
    addText(`Date of Birth: ${input.dob} | Time: ${input.tob}`, 10, false, "#64748b");
    addText(`Place: ${input.place}`, 10, false, "#64748b");
    addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, "#64748b");
    yPosition += 10;

    // Summary section
    if (reportContent.summary) {
      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      addText("Summary", 16, true, "#1e293b");
      addText(reportContent.summary, 11, false, "#334155");
      yPosition += 5;
    }

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

      // Section title
      addText(section.title, 16, true, "#1e293b");
      yPosition += 2;

      // Section content
      if (section.content) {
        addText(section.content, 11, false, "#334155");
      }

      // Bullets
      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach((bullet) => {
          checkPageBreak(10);
          doc.setFontSize(11);
          doc.setTextColor("#334155");
          const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 10);
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

          // Subsection title
          addText(subsection.title, 14, true, "#475569");
          yPosition += 2;

          // Subsection content
          if (subsection.content) {
            addText(subsection.content, 11, false, "#334155");
          }

          // Subsection bullets
          if (subsection.bullets && subsection.bullets.length > 0) {
            subsection.bullets.forEach((bullet) => {
              checkPageBreak(10);
              doc.setFontSize(11);
              doc.setTextColor("#334155");
              const bulletLines = doc.splitTextToSize(`  • ${bullet}`, contentWidth - 10);
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
        const insightLines = doc.splitTextToSize(`✨ ${insight}`, contentWidth - 10);
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

    // Disclaimer
    checkPageBreak(40);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setTextColor("#64748b");
    addText(
      "Disclaimer: This report is generated by AI for educational and entertainment purposes only. " +
      "It should not be used as a substitute for professional advice. Results are based on astrological " +
      "calculations and AI interpretation, and should be taken as guidance rather than absolute predictions.",
      9,
      false,
      "#64748b"
    );

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

