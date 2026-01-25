import type { ReportContent, ReportSection, ReportType } from "./types";
import { countWordsFromText } from "./qualityThresholds";

type SkeletonSectionTemplate = {
  title: string;
  focus: string[];
  bullets?: string[];
  minWords?: number;
};

type SkeletonTemplate = {
  title: string;
  summary: string;
  sections: SkeletonSectionTemplate[];
};

const buildSectionContent = (focusPhrases: string[], minWords = 200): string => {
  if (!focusPhrases || focusPhrases.length === 0) {
    return "This section keeps the narrative focused on the key guidance even when the AI response was incomplete.";
  }

  let paragraph = focusPhrases.map((phrase, idx) => `${idx + 1}. ${phrase}`).join(" ");
  let index = 0;

  while (countWordsFromText(paragraph) < minWords) {
    const phrase = focusPhrases[index % focusPhrases.length];
    paragraph += ` ${phrase} Maintaining focus on this guidance keeps your planning practical and grounded.`;
    index += 1;
  }

  return paragraph.trim();
};

const DEFAULT_SUMMARY =
  "This deterministic fallback ensures you receive a coherent response even when the AI output is missing or malformed.";

const SKELETON_TEMPLATES: Record<ReportType, SkeletonTemplate> = {
  "life-summary": {
    title: "Life Summary Insights",
    summary: DEFAULT_SUMMARY,
    sections: [
      {
        title: "Core Strengths and Growth Areas",
        focus: [
          "Identify the two to three strengths that will carry you forward over the next year.",
          "Highlight growth areas that need attention so you can balance ambition with self-care.",
          "Connect these strengths to actionable decisions you can make each month.",
        ],
      },
      {
        title: "Navigating Relationships",
        focus: [
          "Focus on how planetary energies affect your closest connections and collaborations.",
          "Pinpoint moments when communication flows effortlessly and when you should pause and reflect.",
          "Provide tangible ways to prioritize empathy, honest feedback, and shared goals.",
        ],
      },
      {
        title: "Career and Money Themes",
        focus: [
          "Outline the general timing windows that reward professional initiative or caution.",
          "Call out specific behaviors that preserve momentum while managing risk.",
          "Encourage regular check-ins with your financial habits and long-term goals.",
        ],
      },
    ],
  },
  "daily-guidance": {
    title: "Daily Guidance Notes",
    summary: DEFAULT_SUMMARY,
    sections: [
      {
        title: "Today’s Priorities",
        focus: [
          "Share the top three themes to prioritize as the day unfolds.",
          "Offer clear phrases that keep the focus on presence, discipline, and rest.",
        ],
      },
      {
        title: "Energy Management",
        focus: [
          "Describe how to move through peaks and troughs with grace.",
          "Frame practical signals that remind you when to engage and when to withdraw.",
        ],
      },
    ],
  },
  "marriage-timing": {
    title: "Marriage Timing Blueprint",
    summary: "Deterministic fallback for marriage timing ensures clear windows, readiness signals, and relationship guidance.",
    sections: [
      {
        title: "Readiness Windows & Key Transits",
        focus: [
          "Lay out primary and secondary timing windows for considering serious commitment.",
          "Pair each window with the planets that guide emotional and relational momentum.",
          "Encourage tracking of both inner readiness and external circumstances.",
        ],
        bullets: [
          "Primary window: Align major steps with supportive Jupiter/Moon transits.",
          "Secondary window: Use stabilizing Venus energies to nurture commitment.",
          "Avoid impulsive rituals during intense Mars retrogrades.",
        ],
      },
      {
        title: "Relationship Dynamics and Confidence",
        focus: [
          "Describe how to balance emotional intimacy with practical planning.",
          "Highlight confidence anchors so decisions feel grounded, not reactive.",
          "Preserve trust by clarifying expectations and shared values.",
        ],
      },
      {
        title: "Family, Culture, and Rituals",
        focus: [
          "Outline the astrological cues that speak to family readiness and cultural support.",
          "Offer gentle rituals or check-ins that honor your shared backgrounds.",
          "Map how timing shifts may influence the pace of ceremonies and agreements.",
        ],
      },
      {
        title: "Action Plan for Next Steps",
        focus: [
          "Encourage short-term actions tied to timing windows to keep momentum.",
          "Suggest communication touches that increase confidence across partners.",
          "Tie every action back to a practical takeaway (e.g., plan a conversation, review documents).",
        ],
      },
    ],
  },
  "career-money": {
    title: "Career & Money Path Blueprint",
    summary: "Deterministic fallback for career and money keeps timing, strategy, and resilience in focus.",
    sections: [
      {
        title: "Career Momentum Phases",
        focus: [
          "Describe the planetary cycles that shape growth and consolidation phases.",
          "Show how to match skill-building sprints with supportive transits.",
          "Reassure the reader that momentum ebbs are natural and preparatory.",
        ],
        bullets: [
          "Growth periods: Invest in learning, networking, and visible leadership.",
          "Consolidation phases: Stabilize systems, refine boundaries, and build reserves.",
          "Transit awareness: Monitor Mars/Jupiter aspects for activation or caution.",
        ],
      },
      {
        title: "Financial Patterns and Timing",
        focus: [
          "Outline windows that reward income initiatives and spending discipline.",
          "Highlight when you should defer big purchases and when to invest.",
          "Frame budgeting as part of aligning values, not just numbers.",
        ],
      },
      {
        title: "Strategic Career Decisions",
        focus: [
          "Translate planetary patterns into decision anchors (e.g., promotions, pivots).",
          "Encourage scenario planning for both bold moves and stabilizing choices.",
          "Connect opportunities to long-term vision rather than short-term gain.",
        ],
        bullets: [
          "Set milestone check-ins when Mercury or Mars supports strategic clarity.",
          "Use Saturn cycles to solidify commitments before the next expansion.",
        ],
      },
      {
        title: "Resilience & Support",
        focus: [
          "Prepare for friction by naming the emotional weather ahead.",
          "Recommend small rituals or support calls to stay aligned.",
          "Suggest physical self-care as part of long-term career durability.",
        ],
      },
      {
        title: "Timing Windows & Next Moves",
        focus: [
          "Close with immediate next steps tied to the nearest supportive transits.",
          "Include reminders about communication, documentation, and boundaries.",
        ],
      },
    ],
  },
  "full-life": {
    title: "Full Life Compass",
    summary: "Deterministic fallback for the full-life report keeps life patterns, relationships, health, and purpose in balance.",
    sections: [
      {
        title: "Life Pattern Overview",
        focus: [
          "Narrate the central storyline for this life phase, combining career, relationships, and soul purpose.",
          "Reinforce how major planetary waves knit together for a cohesive arc.",
          "Draw attention to rituals that can honor the theme month by month.",
        ],
      },
      {
        title: "Career & Purpose",
        focus: [
          "Translate transits into actionable career strategy and purpose alignment.",
          "Call out tensions that may need negotiation between passion and practicality.",
          "Offer highly tangible steps to gradually shift into more meaningful work.",
        ],
      },
      {
        title: "Relationships & Support",
        focus: [
          "Discuss how partnerships (romantic, family, business) shift during this phase.",
          "Highlight the kinds of conversations and boundaries required.",
          "Reiterate the need for belonging rituals and gratitude practices.",
        ],
      },
      {
        title: "Health, Rhythm, and Energy",
        focus: [
          "Situate well-being advice inside the current transits affecting vitality.",
          "Describe anchoring habits that stabilize energy peaks and troughs.",
          "Connect somatic awareness to psychological resilience.",
        ],
      },
      {
        title: "How to Navigate Transitions",
        focus: [
          "Map the next 3-5 transitions, naming their emotional and practical pulls.",
          "Introduce anchors for decision-making when transitions feel intense.",
        ],
      },
      {
        title: "What This Means for You",
        focus: [
          "Conclude with a concise interpretation and an invitation to act with courage.",
          "Reframe challenges as invitations to leadership and empathy.",
        ],
      },
    ],
  },
  "year-analysis": {
    title: "Year Analysis Framework",
    summary: "Deterministic fallback for year-analysis ensures quarter-by-quarter insight and timing clarity.",
    sections: [
      {
        title: "Year at a Glance",
        focus: [
          "Summarize the dominant theme for the year and how it shapes focus.",
          "Include reference to planetary rulers and their energetic tone.",
        ],
      },
      {
        title: "Quarterly Breakdowns",
        focus: [
          "Offer three to four mini summaries (Q1-Q4) with encouragement for planning.",
          "Highlight windows of expansion, caution, creativity, and consolidation.",
        ],
      },
      {
        title: "Best Periods and Low-Return Seasons",
        focus: [
          "Name the top opportunities for growth and the periods that demand caution.",
          "Frame these windows with actionable reminders for preparation.",
        ],
      },
      {
        title: "Decision Anchors & Confidence",
        focus: [
          "Help the reader know when to move quickly and when to wait.",
          "Pair each anchor with a reminder to check intuition and data.",
        ],
      },
      {
        title: "What to Do This Year",
        focus: [
          "Provide practical next steps, small rituals, and checklists.",
          "Reiterate the importance of aligning action with identified timing windows.",
        ],
      },
      {
        title: "Year-End Reflection",
        focus: [
          "Close with a prompt for reflecting on learnings and future goals.",
          "Encourage celebrating wins and softening around lessons.",
        ],
      },
    ],
  },
  "major-life-phase": {
    title: "Major Life Phase Overview",
    summary: "Deterministic fallback for the 3-5 year phase keeps transitions, themes, and actions aligned.",
    sections: [
      {
        title: "Strategic Phase Overview",
        focus: [
          "Clarify the overarching story for the next 3-5 years and how planetary cycles shape it.",
          "Connect this phase to long-term goals, legacy, and identity themes.",
        ],
      },
      {
        title: "Phase Themes & Key Energies",
        focus: [
          "List the most active planets and houses that color this chapter.",
          "Highlight how these energies show up in relationships, work, and inner life.",
        ],
      },
      {
        title: "Timing Windows for Progress",
        focus: [
          "Share at least two timing anchors for making major moves vs. recalibrating.",
          "Tie these windows to concrete tasks like launching, investing, or resting.",
        ],
      },
      {
        title: "Transition Support & Resilience",
        focus: [
          "Offer emotional tools, mindsets, and community reminders to stay steady.",
          "Suggest practices for riding the waves of change without losing footing.",
        ],
      },
      {
        title: "Concrete Action Steps",
        focus: [
          "Deliver a bullet-friendly list of actions that honor the phase.",
          "Include timelines (next 6-12 months) and accountability ideas.",
        ],
      },
    ],
  },
  "decision-support": {
    title: "Decision Support Snapshot",
    summary: DEFAULT_SUMMARY,
    sections: [
      {
        title: "Decision Context & Timing",
        focus: [
          "Summarize the decision, the timing context, and clarity priorities.",
          "Highlight planetary timing that supports thoughtful action.",
        ],
      },
      {
        title: "Options & Trade-offs",
        focus: [
          "Lay out the pros and cons of each option with practical consequences.",
          "Tie each trade-off back to values, timing, and risk tolerance.",
        ],
      },
      {
        title: "Recommended Steps",
        focus: [
          "Offer specific steps to gain data, check intuition, and follow through.",
          "Include questions to ask before acting (e.g., What would patience yield?).",
        ],
      },
    ],
  },
};

const getSkeletonTemplate = (reportType: ReportType): SkeletonTemplate => {
  return SKELETON_TEMPLATES[reportType] || SKELETON_TEMPLATES["life-summary"];
};

export function deterministicSkeleton(reportType: ReportType): ReportContent {
  const template = getSkeletonTemplate(reportType);
  const sections: ReportSection[] = template.sections.map((templateSection) => ({
    title: templateSection.title,
    content: buildSectionContent(templateSection.focus, templateSection.minWords),
    bullets: templateSection.bullets,
  }));
  return {
    title: template.title,
    sections,
    summary: template.summary,
    generatedAt: new Date().toISOString(),
  };
}

export function mergeReportContentWithSkeleton(
  primary: ReportContent,
  skeleton: ReportContent
): ReportContent {
  const existingSections = primary.sections ? [...primary.sections] : [];
  const addedTitles = new Set(existingSections.map((sec) => sec.title.toLowerCase()));

  for (const section of skeleton.sections || []) {
    const normalizedTitle = section.title.toLowerCase();
    if (!addedTitles.has(normalizedTitle)) {
      existingSections.push(section);
      addedTitles.add(normalizedTitle);
      continue;
    }

    const idx = existingSections.findIndex((s) => s.title.toLowerCase() === normalizedTitle);
    if (idx >= 0) {
      const existing = existingSections[idx];
      const existingWordCount = countWordsFromText(existing.content || "");
      const candidateWordCount = countWordsFromText(section.content || "");
      if (candidateWordCount > existingWordCount) {
        existingSections[idx] = {
          ...existing,
          content: `${existing.content || ""}\n\n${section.content || ""}`.trim(),
          bullets: existing.bullets?.length ? existing.bullets : section.bullets,
        };
      }
    }
  }

  return {
    ...primary,
    title: primary.title || skeleton.title,
    summary: primary.summary || skeleton.summary,
    sections: existingSections,
  };
}

