/**
 * Access Restriction for Production Testing
 * Only allows Amit Kumar Mandal and Ankita Surabhi to access AI section
 */

export const ALLOWED_USERS = [
  {
    name: "Amit Kumar Mandal",
    dob: "1984-11-26",
    tob: "21:40",
    place: "Noamundi",
    gender: "Male",
  },
  {
    name: "Ankita Surabhi",
    // Add Ankita's details if known, or make it more flexible
    // For now, check by name only
  },
];

/**
 * Check if user input matches allowed users
 */
export function isAllowedUser(input: {
  name?: string;
  dob?: string;
  tob?: string;
  place?: string;
  gender?: string;
}): boolean {
  // Always allow if not in production restriction mode
  const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
  if (!restrictAccess) {
    return true;
  }

  const inputName = input.name?.toLowerCase().trim() || "";
  
  // Check if name matches any allowed user
  for (const allowedUser of ALLOWED_USERS) {
    const allowedName = allowedUser.name.toLowerCase().trim();
    
    // Flexible name matching (contains or matches)
    if (inputName.includes(allowedName) || allowedName.includes(inputName)) {
      // If full details available, verify them too
      if (allowedUser.dob && input.dob) {
        const inputDOB = input.dob.replace(/\//g, "-").trim();
        const dobMatches = 
          inputDOB.includes(allowedUser.dob) || 
          inputDOB.includes(allowedUser.dob.split("-").reverse().join("-"));
        
        if (dobMatches) {
          return true;
        }
      } else {
        // If no DOB check needed or available, allow by name match
        return true;
      }
    }
  }

  return false;
}

/**
 * Get restriction error message
 */
export function getRestrictionMessage(): string {
  return "Access is currently restricted for production testing. Only authorized users can access this feature.";
}

