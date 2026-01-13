/**
 * Unit Tests for Validation Schemas
 * 
 * This is an example of how Cursor can help generate comprehensive tests.
 * Ask Cursor: "Generate more test cases for edge cases and error scenarios"
 */

import { describe, it, expect } from 'vitest';
import {
  BirthDetailsSchema,
  MatchSchema,
  NameSchema,
  EmailSchema,
  PhoneSchema,
  AmountSchema,
  DateSchema,
  TimeSchema,
  CoordinateSchema,
  LongitudeSchema,
} from '@/lib/validators';

describe('BirthDetailsSchema', () => {
  describe('valid inputs', () => {
    it('should validate with dob and tob', () => {
      const result = BirthDetailsSchema.safeParse({
        name: 'Amit Kumar Mandal',
        gender: 'Male',
        dob: '1984-11-26',
        tob: '21:40:00',
        place: 'Noamundi, Jharkhand',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dob).toBe('1984-11-26');
        expect(result.data.tob).toBe('21:40:00');
      }
    });

    it('should validate with day/month/year and hours/minutes', () => {
      const result = BirthDetailsSchema.safeParse({
        name: 'Test User',
        day: 26,
        month: 11,
        year: 1984,
        hours: 21,
        minutes: 40,
        seconds: 0,
        place: 'Noamundi, Jharkhand',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dob).toBe('1984-11-26');
        expect(result.data.tob).toBe('21:40:00');
      }
    });

    it('should transform day/month/year to dob format', () => {
      const result = BirthDetailsSchema.safeParse({
        day: 5,
        month: 1,
        year: 2000,
        hours: 10,
        minutes: 30,
        place: 'Mumbai',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dob).toBe('2000-01-05');
        expect(result.data.tob).toBe('10:30:00');
      }
    });

    it('should pad single digit months and days', () => {
      const result = BirthDetailsSchema.safeParse({
        day: 1,
        month: 1,
        year: 2000,
        hours: 0,
        minutes: 0,
        place: 'Delhi',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dob).toBe('2000-01-01');
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing date fields', () => {
      const result = BirthDetailsSchema.safeParse({
        name: 'Test',
        place: 'Mumbai',
        // Missing date
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing time fields', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000-01-01',
        place: 'Mumbai',
        // Missing time
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid dob format', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000/01/01', // Wrong format
        tob: '10:00',
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid tob format', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000-01-01',
        tob: '10.00', // Wrong format
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid day range', () => {
      const result = BirthDetailsSchema.safeParse({
        day: 32, // Invalid
        month: 1,
        year: 2000,
        hours: 10,
        minutes: 0,
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid month range', () => {
      const result = BirthDetailsSchema.safeParse({
        day: 1,
        month: 13, // Invalid
        year: 2000,
        hours: 10,
        minutes: 0,
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid year range', () => {
      const result = BirthDetailsSchema.safeParse({
        day: 1,
        month: 1,
        year: 1800, // Too old
        hours: 10,
        minutes: 0,
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid hours', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000-01-01',
        hours: 24, // Invalid
        minutes: 0,
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid minutes', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000-01-01',
        hours: 10,
        minutes: 60, // Invalid
        place: 'Mumbai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty place', () => {
      const result = BirthDetailsSchema.safeParse({
        dob: '2000-01-01',
        tob: '10:00',
        place: '', // Too short
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('NameSchema', () => {
  it('should accept valid names', () => {
    expect(NameSchema.safeParse('Amit Kumar Mandal').success).toBe(true);
    expect(NameSchema.safeParse('John O\'Brien').success).toBe(true);
    expect(NameSchema.safeParse('Mary-Jane Smith').success).toBe(true);
  });

  it('should reject names that are too short', () => {
    expect(NameSchema.safeParse('A').success).toBe(false);
  });

  it('should reject names that are too long', () => {
    const longName = 'A'.repeat(101);
    expect(NameSchema.safeParse(longName).success).toBe(false);
  });

  it('should reject names with numbers', () => {
    expect(NameSchema.safeParse('John123').success).toBe(false);
  });

  it('should reject names with special characters', () => {
    expect(NameSchema.safeParse('John@Doe').success).toBe(false);
  });
});

describe('EmailSchema', () => {
  it('should accept valid emails', () => {
    expect(EmailSchema.safeParse('test@example.com').success).toBe(true);
    expect(EmailSchema.safeParse('user.name+tag@example.co.uk').success).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(EmailSchema.safeParse('notanemail').success).toBe(false);
    expect(EmailSchema.safeParse('@example.com').success).toBe(false);
    expect(EmailSchema.safeParse('user@').success).toBe(false);
  });

  it('should convert emails to lowercase', () => {
    const result = EmailSchema.safeParse('TEST@EXAMPLE.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });
});

describe('PhoneSchema', () => {
  it('should accept valid phone numbers', () => {
    expect(PhoneSchema.safeParse('+919876543210').success).toBe(true);
    expect(PhoneSchema.safeParse('9876543210').success).toBe(true);
  });

  it('should reject invalid phone formats', () => {
    // Note: PhoneSchema regex is /^\+?[1-9]\d{1,14}$/
    // "123" actually passes because it starts with 1 and has 2 more digits (total 3, which is >= 2)
    // So we need to test with actually invalid formats
    expect(PhoneSchema.safeParse('0123456789').success).toBe(false); // Starts with 0
    expect(PhoneSchema.safeParse('abc123').success).toBe(false); // Has letters
    expect(PhoneSchema.safeParse('1').success).toBe(false); // Too short (only 1 digit after first)
  });
});

describe('AmountSchema', () => {
  it('should accept valid amounts', () => {
    expect(AmountSchema.safeParse(100).success).toBe(true);
    expect(AmountSchema.safeParse(1).success).toBe(true);
    expect(AmountSchema.safeParse(1000000).success).toBe(true);
  });

  it('should reject negative amounts', () => {
    expect(AmountSchema.safeParse(-100).success).toBe(false);
  });

  it('should reject zero', () => {
    expect(AmountSchema.safeParse(0).success).toBe(false);
  });

  it('should reject amounts above maximum', () => {
    expect(AmountSchema.safeParse(1000001).success).toBe(false);
  });
});

describe('DateSchema', () => {
  it('should accept valid dates', () => {
    expect(DateSchema.safeParse('2000-01-01').success).toBe(true);
    expect(DateSchema.safeParse('1984-11-26').success).toBe(true);
  });

  it('should reject invalid date formats', () => {
    expect(DateSchema.safeParse('2000/01/01').success).toBe(false);
    expect(DateSchema.safeParse('01-01-2000').success).toBe(false);
  });

  it('should reject dates before 1900', () => {
    expect(DateSchema.safeParse('1899-12-31').success).toBe(false);
  });

  it('should reject dates after 2100', () => {
    expect(DateSchema.safeParse('2101-01-01').success).toBe(false);
  });
});

describe('TimeSchema', () => {
  it('should accept valid times', () => {
    expect(TimeSchema.safeParse('10:30').success).toBe(true);
    expect(TimeSchema.safeParse('21:40:00').success).toBe(true);
    expect(TimeSchema.safeParse('00:00').success).toBe(true);
    expect(TimeSchema.safeParse('23:59').success).toBe(true);
  });

  it('should reject invalid time formats', () => {
    expect(TimeSchema.safeParse('10.30').success).toBe(false);
    expect(TimeSchema.safeParse('10:30:00:00').success).toBe(false);
  });

  it('should reject invalid hours', () => {
    expect(TimeSchema.safeParse('24:00').success).toBe(false);
    expect(TimeSchema.safeParse('25:00').success).toBe(false);
  });

  it('should reject invalid minutes', () => {
    expect(TimeSchema.safeParse('10:60').success).toBe(false);
    expect(TimeSchema.safeParse('10:99').success).toBe(false);
  });
});

describe('CoordinateSchema', () => {
  it('should accept valid latitudes', () => {
    expect(CoordinateSchema.safeParse(0).success).toBe(true);
    expect(CoordinateSchema.safeParse(90).success).toBe(true);
    expect(CoordinateSchema.safeParse(-90).success).toBe(true);
    expect(CoordinateSchema.safeParse(22.1667).success).toBe(true);
  });

  it('should reject invalid latitudes', () => {
    expect(CoordinateSchema.safeParse(91).success).toBe(false);
    expect(CoordinateSchema.safeParse(-91).success).toBe(false);
  });
});

describe('LongitudeSchema', () => {
  it('should accept valid longitudes', () => {
    expect(LongitudeSchema.safeParse(0).success).toBe(true);
    expect(LongitudeSchema.safeParse(180).success).toBe(true);
    expect(LongitudeSchema.safeParse(-180).success).toBe(true);
    expect(LongitudeSchema.safeParse(85.5167).success).toBe(true);
  });

  it('should reject invalid longitudes', () => {
    expect(LongitudeSchema.safeParse(181).success).toBe(false);
    expect(LongitudeSchema.safeParse(-181).success).toBe(false);
  });
});

describe('MatchSchema', () => {
  it('should validate two valid birth details', () => {
    const result = MatchSchema.safeParse({
      a: {
        dob: '1984-11-26',
        tob: '21:40:00',
        place: 'Noamundi',
      },
      b: {
        dob: '1990-05-15',
        tob: '10:30:00',
        place: 'Mumbai',
      },
    });
    expect(result.success).toBe(true);
  });

  it('should reject if one birth detail is invalid', () => {
    const result = MatchSchema.safeParse({
      a: {
        dob: '1984-11-26',
        tob: '21:40:00',
        place: 'Noamundi',
      },
      b: {
        dob: 'invalid',
        tob: '10:30:00',
        place: 'Mumbai',
      },
    });
    expect(result.success).toBe(false);
  });
});

