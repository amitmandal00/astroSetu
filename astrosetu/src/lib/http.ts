export async function apiGet<T>(url: string): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch(url, { 
      cache: "no-store",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = errorText;
      
      // For auth endpoints, always try to extract the actual error message
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify') || url.includes('/auth/send-otp');
      
      try {
        const errorJson = JSON.parse(errorText);
        // Prioritize error field, then message, then use text
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as-is
        // But for auth endpoints, don't override with generic messages
        if (!isAuthEndpoint && errorText.trim() === '') {
          errorMessage = errorText;
        }
      }
      
      // Provide user-friendly error messages
      // IMPORTANT: For auth endpoints, NEVER override the error message
      if (res.status === 500) {
        if (!isAuthEndpoint) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (res.status === 404) {
        if (!isAuthEndpoint) {
          errorMessage = "Service not found. Please check the URL.";
        }
      } else if (res.status === 401) {
        // For auth endpoints, ALWAYS use the actual error message from API
        // Only use generic message for non-auth endpoints
        if (!isAuthEndpoint) {
          errorMessage = "Please log in to continue.";
        }
        // For auth endpoints, errorMessage already contains the actual API error
      } else if (res.status === 403) {
        if (!isAuthEndpoint) {
          errorMessage = "You don't have permission to perform this action.";
        }
      } else if (res.status === 429) {
        if (!isAuthEndpoint) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error("Request timed out. Please check your internet connection and try again.");
    }
    if (e.message === "fetch failed" || e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      throw new Error("Network error: Unable to connect to server. Please check your internet connection and ensure the server is running.");
    }
    throw e;
  }
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = errorText;
      
      // For auth endpoints, always try to extract the actual error message
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify') || url.includes('/auth/send-otp');
      
      try {
        const errorJson = JSON.parse(errorText);
        // Prioritize error field, then message, then use text
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as-is
        // But for auth endpoints, don't override with generic messages
        if (!isAuthEndpoint && errorText.trim() === '') {
          errorMessage = errorText;
        }
      }
      
      // Provide user-friendly error messages
      // IMPORTANT: For auth endpoints, NEVER override the error message
      if (res.status === 500) {
        if (!isAuthEndpoint) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (res.status === 404) {
        if (!isAuthEndpoint) {
          errorMessage = "Service not found. Please check the URL.";
        }
      } else if (res.status === 401) {
        // For auth endpoints, ALWAYS use the actual error message from API
        // Only use generic message for non-auth endpoints
        if (!isAuthEndpoint) {
          errorMessage = "Please log in to continue.";
        }
        // For auth endpoints, errorMessage already contains the actual API error
      } else if (res.status === 403) {
        if (!isAuthEndpoint) {
          errorMessage = "You don't have permission to perform this action.";
        }
      } else if (res.status === 429) {
        if (!isAuthEndpoint) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error("Request timed out. Please check your internet connection and try again.");
    }
    if (e.message === "fetch failed" || e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      throw new Error("Network error: Unable to connect to server. Please check your internet connection and ensure the server is running.");
    }
    throw e;
  }
}
