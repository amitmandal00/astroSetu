/**
 * Goal-based module prioritization for home page
 * Re-orders modules based on user's saved goals
 */

export type BaseGoal = 
  | "career"
  | "marriage"
  | "money"
  | "health"
  | "peace";

export type UserGoal = 
  | BaseGoal
  | "finance" // Alias for "money"
  | "spirituality"; // Alias for "peace"

export type HomeModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  goals: BaseGoal[]; // Which goals this module supports (base goals only)
  priority: number; // Base priority (higher = more important)
};

// Define all home modules with their goal associations
export const HOME_MODULES: HomeModule[] = [
  {
    id: "kundli",
    title: "Kundli Generation",
    description: "Complete birth chart analysis",
    href: "/kundli",
    icon: "🔮",
    goals: ["career", "marriage", "money", "health", "peace"],
    priority: 10,
  },
  {
    id: "match",
    title: "Marriage Match (Guna Milan)",
    description: "Compatibility analysis",
    href: "/match",
    icon: "💑",
    goals: ["marriage"],
    priority: 9,
  },
  {
    id: "horoscope",
    title: "Horoscope",
    description: "Daily/Weekly/Monthly/Yearly",
    href: "/horoscope",
    icon: "⭐",
    goals: ["career", "marriage", "health", "money"],
    priority: 8,
  },
  {
    id: "panchang",
    title: "Panchang",
    description: "Hindu calendar & auspicious timings",
    href: "/panchang",
    icon: "📿",
    goals: ["peace", "marriage", "career"],
    priority: 7,
  },
  {
    id: "astrologers",
    title: "Browse Astrologers",
    description: "Chat with verified experts",
    href: "/astrologers",
    icon: "👨‍🏫",
    goals: ["career", "marriage", "money", "health", "peace"],
    priority: 6,
  },
  {
    id: "sessions",
    title: "Live Sessions & Webinars",
    description: "Interactive learning sessions",
    href: "/sessions",
    icon: "📺",
    goals: ["peace"],
    priority: 5,
  },
  {
    id: "puja",
    title: "Online Puja Services",
    description: "Book puja with live streaming",
    href: "/puja",
    icon: "🕉️",
    goals: ["peace", "marriage", "health"],
    priority: 4,
  },
  {
    id: "community",
    title: "Community Forum",
    description: "Ask questions & share experiences",
    href: "/community",
    icon: "💬",
    goals: ["career", "marriage", "money", "health", "peace"],
    priority: 3,
  },
];

/**
 * Re-order modules based on user goals
 * Modules that match user goals get higher priority
 */
export function prioritizeModulesByGoals(
  modules: HomeModule[],
  userGoals: UserGoal[]
): HomeModule[] {
  if (!userGoals || userGoals.length === 0) {
    // No goals saved, return original order
    return modules;
  }

  // Normalize goal names (handle aliases)
  const normalizedGoals: BaseGoal[] = userGoals.map(g => {
    if (g === "finance") return "money";
    if (g === "spirituality") return "peace";
    return g as BaseGoal;
  });

  // Calculate priority score for each module
  const scoredModules = modules.map((module) => {
    let score = module.priority; // Start with base priority

    // Add bonus points for each matching goal
    const matchingGoals = module.goals.filter((goal: BaseGoal) => normalizedGoals.includes(goal));
    score += matchingGoals.length * 5; // +5 points per matching goal

    // Extra bonus if module matches multiple goals
    if (matchingGoals.length > 1) {
      score += 3;
    }

    return {
      ...module,
      score,
      matchingGoals,
    };
  });

  // Sort by score (descending), then by base priority
  scoredModules.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.priority - a.priority;
  });

  return scoredModules.map(({ score, matchingGoals, ...module }) => module);
}

/**
 * Get modules grouped by category with goal-based prioritization
 */
export function getPrioritizedModules(userGoals: UserGoal[]) {
  const allModules = [...HOME_MODULES];
  const prioritized = prioritizeModulesByGoals(allModules, userGoals);

  // Group into categories
  const astrologyTools = prioritized.filter((m) =>
    ["kundli", "match", "horoscope", "panchang"].includes(m.id)
  );
  const consultations = prioritized.filter((m) =>
    ["astrologers", "sessions", "puja", "community"].includes(m.id)
  );

  return {
    astrologyTools,
    consultations,
    all: prioritized,
  };
}
