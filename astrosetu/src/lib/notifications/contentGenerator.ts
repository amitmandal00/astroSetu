/**
 * Notification Content Generator
 * Generates personalized notification content based on user data
 */

import type { UserGoal } from "@/lib/goalPrioritization";

export interface WeeklyInsight {
  title: string;
  body: string;
  icon: string;
  data?: {
    type: string;
    goal?: UserGoal;
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Generate weekly insight notification based on user goals
 */
export function generateWeeklyInsight(
  goals: UserGoal[],
  kundliData?: any
): WeeklyInsight {
  // Select a random goal or default to career
  const goal =
    goals.length > 0
      ? goals[Math.floor(Math.random() * goals.length)]
      : "career";

  const insights: Record<
    UserGoal,
    { title: string; body: string; icon: string }
  > = {
    career: {
      title: "🌟 Career Guidance This Week",
      body: "Your planetary positions suggest focusing on networking and skill development. Consider taking on new responsibilities.",
      icon: "💼",
    },
    marriage: {
      title: "💑 Relationship Insights",
      body: "Venus and Jupiter alignment indicates favorable time for strengthening bonds. Communication is key this week.",
      icon: "💑",
    },
    money: {
      title: "💰 Financial Opportunities",
      body: "Mercury's influence suggests reviewing investments. Avoid impulsive spending and focus on savings.",
      icon: "💰",
    },
    finance: {
      title: "💰 Financial Opportunities",
      body: "Mercury's influence suggests reviewing investments. Avoid impulsive spending and focus on savings.",
      icon: "💰",
    },
    health: {
      title: "🏥 Health & Wellness",
      body: "Mars placement indicates paying attention to physical activity. Maintain a balanced diet and regular exercise.",
      icon: "🏥",
    },
    peace: {
      title: "🧘 Spiritual Growth",
      body: "Saturn's influence encourages meditation and introspection. This is a good time for spiritual practices.",
      icon: "🧘",
    },
    spirituality: {
      title: "🧘 Spiritual Growth",
      body: "Saturn's influence encourages meditation and introspection. This is a good time for spiritual practices.",
      icon: "🧘",
    },
  };

  const insight = insights[goal] || insights.career;

  // Add Dasha information if available
  if (kundliData?.chart?.dasha?.current) {
    insight.body += ` Your current ${kundliData.chart?.dasha?.current} Dasha period influences this guidance.`;
  }

  return {
    title: insight.title,
    body: insight.body,
    icon: insight.icon,
    data: {
      type: "weekly_insight",
      goal,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Generate daily horoscope notification
 */
export function generateDailyHoroscope(sign: string): WeeklyInsight {
  const signNames: Record<string, string> = {
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
  };

  const signName = signNames[sign.toLowerCase()] || sign;

  const dailyMessages: string[] = [
    "Today brings opportunities for growth and learning.",
    "Focus on communication and building relationships today.",
    "A favorable day for making important decisions.",
    "Take time for self-reflection and planning.",
    "Energy is high - channel it into productive activities.",
    "Pay attention to details and avoid rushing.",
    "Social connections will be beneficial today.",
    "Trust your intuition in matters of the heart.",
  ];

  const message =
    dailyMessages[Math.floor(Math.random() * dailyMessages.length)];

  return {
    title: `⭐ ${signName} Daily Horoscope`,
    body: message,
    icon: "⭐",
    data: {
      type: "daily_horoscope",
      sign,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Generate astrological event notification
 */
export function generateAstrologicalEvent(
  eventName: string,
  date: string
): WeeklyInsight {
  return {
    title: `🌙 ${eventName}`,
    body: `This important astrological event occurs on ${date}. It may influence your planetary positions and daily life.`,
    icon: "🌙",
    data: {
      type: "astrological_event",
      eventName,
      date,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Generate personalized notification based on type
 */
export function generateNotification(
  type: "weekly_insight" | "daily_horoscope" | "astrological_event",
  options: {
    goals?: UserGoal[];
    kundliData?: any;
    sign?: string;
    eventName?: string;
    eventDate?: string;
  }
): WeeklyInsight {
  switch (type) {
    case "weekly_insight":
      return generateWeeklyInsight(options.goals || [], options.kundliData);
    case "daily_horoscope":
      return generateDailyHoroscope(options.sign || "aries");
    case "astrological_event":
      return generateAstrologicalEvent(
        options.eventName || "Astrological Event",
        options.eventDate || new Date().toISOString()
      );
    default:
      return generateWeeklyInsight(options.goals || []);
  }
}
