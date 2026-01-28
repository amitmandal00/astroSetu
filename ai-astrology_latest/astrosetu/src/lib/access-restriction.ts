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
    dob: "1990-05-15", // Add DOB if different
    tob: "10:30", // Add time if different
    place: "Delhi", // Add place if different
    gender: "Female",
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
  
  // Debug logging (can be removed after testing)
  console.log("[ACCESS RESTRICTION CHECK]", JSON.stringify({
    inputName,
    originalName: input.name,
    restrictAccess,
    allowedUsers: ALLOWED_USERS.map(u => u.name),
    inputDOB: input.dob,
    inputPlace: input.place
  }, null, 2));
  
  // Check if name matches any allowed user
  for (const allowedUser of ALLOWED_USERS) {
    const allowedName = allowedUser.name.toLowerCase().trim();
    
    // Flexible name matching (contains or matches)
    // Also check for exact match after normalization
    const normalizedInput = inputName.replace(/\s+/g, " ").replace(/[^\w\s]/g, ""); // Remove special chars
    const normalizedAllowed = allowedName.replace(/\s+/g, " ").replace(/[^\w\s]/g, ""); // Remove special chars
    
    // More flexible matching: check if all words from allowed name are present in input
    const allowedWords = normalizedAllowed.split(/\s+/).filter(w => w.length > 0);
    const inputWords = normalizedInput.split(/\s+/).filter(w => w.length > 0);
    const allWordsMatch = allowedWords.length > 0 && allowedWords.every(word => 
      inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
    );
    
    const nameMatches = 
      normalizedInput === normalizedAllowed ||
      normalizedInput.includes(normalizedAllowed) || 
      normalizedAllowed.includes(normalizedInput) ||
      allWordsMatch;
    
    console.log("[NAME MATCH CHECK]", JSON.stringify({
      allowedUser: allowedUser.name,
      normalizedInput,
      normalizedAllowed,
      allWordsMatch,
      nameMatches,
      allowedWords,
      inputWords
    }, null, 2));
    
    if (nameMatches) {
      // More flexible matching: check DOB if available, but don't require exact match for all fields
      let detailsMatch = true;
      
      if (allowedUser.dob && input.dob) {
        const inputDOB = input.dob.replace(/\//g, "-").trim();
        const dobMatches = 
          inputDOB.includes(allowedUser.dob) || 
          inputDOB.includes(allowedUser.dob.replace(/-/g, "/")) ||
          allowedUser.dob.includes(inputDOB.split("/")[0]) || // Partial match for dates
          inputDOB.includes(allowedUser.dob.split("-")[0]); // Partial match (year)
        
        if (!dobMatches) {
          detailsMatch = false;
          console.log("[DOB MISMATCH]", JSON.stringify({ 
            allowedUser: allowedUser.name, 
            expectedDOB: allowedUser.dob, 
            receivedDOB: input.dob 
          }, null, 2));
        }
      }
      
      // Check place if available (flexible matching)
      if (allowedUser.place && input.place) {
        const placeMatches = 
          input.place.toLowerCase().includes(allowedUser.place.toLowerCase()) ||
          allowedUser.place.toLowerCase().includes(input.place.toLowerCase());
        
        if (!placeMatches) {
          detailsMatch = false;
          console.log("[PLACE MISMATCH]", JSON.stringify({ 
            allowedUser: allowedUser.name, 
            expectedPlace: allowedUser.place, 
            receivedPlace: input.place 
          }, null, 2));
        }
      }
      
      // If name matches and details match (or no details required), grant access
      // For Ankita, be more lenient if DOB not set in allowed users
      if (detailsMatch || (!allowedUser.dob && nameMatches)) {
        console.log("[ACCESS GRANTED]", JSON.stringify({ 
          matchedUser: allowedUser.name, 
          reason: detailsMatch ? "Name and details match" : "Name match (flexible for test users)",
          inputName: input.name,
          inputDOB: input.dob,
          inputPlace: input.place
        }, null, 2));
        return true;
      }
    }
  }

  console.log("[ACCESS DENIED]", JSON.stringify({ 
    inputName, 
    originalName: input.name,
    reason: "No matching allowed user",
    checkedAgainst: ALLOWED_USERS.map(u => u.name)
  }, null, 2));
  return false;
}

/**
 * Get restriction error message
 */
export function getRestrictionMessage(): string {
  return "Access is currently restricted for production testing. Only authorized users can access this feature.";
}

