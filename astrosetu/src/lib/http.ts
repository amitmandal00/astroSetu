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
      
      let parsedError = false;
      try {
        const errorJson = JSON.parse(errorText);
        // Prioritize error field, then message, then use text
        const parsedMessage = errorJson.error || errorJson.message;
        if (parsedMessage && typeof parsedMessage === 'string' && parsedMessage.trim().length > 0) {
          errorMessage = parsedMessage.trim();
          parsedError = true; // Mark that we successfully parsed an error message
          // Debug: Log when we successfully parse an error (can be removed after testing)
          console.log("[HTTP ERROR PARSED - apiGet]", { status: res.status, url: url?.substring?.(0, 50) || url, parsedMessage: errorMessage?.substring?.(0, 100) || errorMessage });
        }
      } catch (e) {
        // Not JSON, will use errorText or generic message below
        parsedError = false;
        console.warn("[HTTP ERROR PARSE FAILED - apiGet]", { status: res.status, url: url?.substring?.(0, 50) || url, errorText: errorText?.substring?.(0, 200) || errorText });
      }
      
      // Provide user-friendly error messages
      // IMPORTANT: For auth endpoints, NEVER override the error message
      // IMPORTANT: If we successfully parsed an error from JSON, preserve it (don't override)
      if (res.status === 500) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (res.status === 404) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Service not found. Please check the URL.";
        }
      } else if (res.status === 401) {
        // For auth endpoints, ALWAYS use the actual error message from API
        // Only use generic message for non-auth endpoints if we didn't parse an error
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Please log in to continue.";
        }
        // For auth endpoints, errorMessage already contains the actual API error
      } else if (res.status === 403) {
        // Only use generic message if we didn't successfully parse a specific error from JSON
        // This preserves the actual error message from the API (e.g., access restriction messages)
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "You don't have permission to perform this action.";
        }
      } else if (res.status === 429) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      // Check if this is a report generation request (longer timeout)
      const isReportGeneration = url.includes('/generate-report');
      const timeoutMessage = isReportGeneration 
        ? "Report generation is taking longer than expected. This can happen with complex reports. Please try again or contact support if the issue persists."
        : "Request timed out. Please check your internet connection and try again.";
      throw new Error(timeoutMessage);
    }
    if (e.message === "fetch failed" || e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      throw new Error("Network error: Unable to connect to server. Please check your internet connection and ensure the server is running.");
    }
    throw e;
  }
}

export async function apiPost<T>(url: string, body: unknown, options?: { timeout?: number }): Promise<T> {
  try {
    const controller = new AbortController();
    // Default timeout is 30 seconds, but report generation needs more time (up to 90 seconds)
    const timeout = options?.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
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
      
      let parsedError = false;
      try {
        const errorJson = JSON.parse(errorText);
        // Prioritize error field, then message, then use text
        const parsedMessage = errorJson.error || errorJson.message;
        if (parsedMessage && typeof parsedMessage === 'string' && parsedMessage.trim().length > 0) {
          errorMessage = parsedMessage.trim();
          parsedError = true; // Mark that we successfully parsed an error message
          // Debug: Log when we successfully parse an error (can be removed after testing)
          console.log("[HTTP ERROR PARSED - apiPost]", { status: res.status, url: url?.substring?.(0, 50) || url, parsedMessage: errorMessage?.substring?.(0, 100) || errorMessage });
        }
      } catch (e) {
        // Not JSON, will use errorText or generic message below
        parsedError = false;
        console.warn("[HTTP ERROR PARSE FAILED - apiPost]", { status: res.status, url: url?.substring?.(0, 50) || url, errorText: errorText?.substring?.(0, 200) || errorText });
      }
      
      // Provide user-friendly error messages
      // IMPORTANT: For auth endpoints, NEVER override the error message
      // IMPORTANT: If we successfully parsed an error from JSON, preserve it (don't override)
      if (res.status === 500) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (res.status === 404) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Service not found. Please check the URL.";
        }
      } else if (res.status === 401) {
        // For auth endpoints, ALWAYS use the actual error message from API
        // Only use generic message for non-auth endpoints if we didn't parse an error
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Please log in to continue.";
        }
        // For auth endpoints, errorMessage already contains the actual API error
      } else if (res.status === 403) {
        // Only use generic message if we didn't successfully parse a specific error from JSON
        // This preserves the actual error message from the API (e.g., access restriction messages)
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "You don't have permission to perform this action.";
        }
      } else if (res.status === 429) {
        if (!isAuthEndpoint && !parsedError) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      // Check if this is a report generation request (longer timeout)
      const isReportGeneration = url.includes('/generate-report');
      const timeoutMessage = isReportGeneration 
        ? "Report generation is taking longer than expected. This can happen with complex reports. Please try again or contact support if the issue persists."
        : "Request timed out. Please check your internet connection and try again.";
      throw new Error(timeoutMessage);
    }
    if (e.message === "fetch failed" || e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      throw new Error("Network error: Unable to connect to server. Please check your internet connection and ensure the server is running.");
    }
    throw e;
  }
}
