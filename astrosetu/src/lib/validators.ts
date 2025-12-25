import { z } from "zod";

export const BirthDetailsSchema = z.object({
  name: z.string().optional(),
  gender: z.enum(["Male", "Female"]).optional(),
  day: z.number().min(1).max(31).optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(1900).max(2100).optional(),
  hours: z.number().min(0).max(23).optional(),
  minutes: z.number().min(0).max(59).optional(),
  seconds: z.number().min(0).max(59).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tob: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  place: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional()
}).refine((data) => {
  // Either provide dob/tob OR day/month/year and hours/minutes/seconds
  const hasDateFields = data.dob || (data.day && data.month && data.year);
  const hasTimeFields = data.tob || (data.hours !== undefined && data.minutes !== undefined);
  return hasDateFields && hasTimeFields;
}, {
  message: "Either provide dob/tob or day/month/year and hours/minutes/seconds"
}).transform((data) => {
  // Ensure dob and tob are always present
  let dob = data.dob;
  let tob = data.tob;
  
  if (!dob && data.day && data.month && data.year) {
    const monthStr = String(data.month).padStart(2, "0");
    const dayStr = String(data.day).padStart(2, "0");
    dob = `${data.year}-${monthStr}-${dayStr}`;
  }
  
  if (!tob && data.hours !== undefined && data.minutes !== undefined) {
    const hoursStr = String(data.hours).padStart(2, "0");
    const minutesStr = String(data.minutes).padStart(2, "0");
    const secondsStr = data.seconds !== undefined ? String(data.seconds).padStart(2, "0") : "00";
    tob = `${hoursStr}:${minutesStr}:${secondsStr}`;
  }
  
  return {
    ...data,
    dob: dob!,
    tob: tob!
  };
});

export const MatchSchema = z.object({
  a: BirthDetailsSchema,
  b: BirthDetailsSchema
});

export const ChatSessionCreateSchema = z.object({
  userName: z.string().min(1),
  astrologerId: z.string().min(1)
});

export const ChatMessageCreateSchema = z.object({
  sender: z.enum(["user", "astrologer"]),
  text: z.string().min(1).max(2000)
});

// Enhanced validation schemas for production
export const NameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const EmailSchema = z.string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase();

export const PhoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .max(20, "Phone number must be less than 20 characters");

export const AmountSchema = z.number()
  .positive("Amount must be positive")
  .min(1, "Minimum amount is ₹1")
  .max(1000000, "Maximum amount is ₹10,00,000");

export const PlaceSchema = z.string()
  .min(2, "Place must be at least 2 characters")
  .max(200, "Place must be less than 200 characters");

export const DateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d >= new Date('1900-01-01') && d <= new Date('2100-12-31');
  }, "Date must be between 1900 and 2100");

export const TimeSchema = z.string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM or HH:MM:SS format")
  .refine((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  }, "Invalid time value");

export const CoordinateSchema = z.number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

export const LongitudeSchema = z.number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");
