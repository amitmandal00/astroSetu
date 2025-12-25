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
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorText;
      } catch {
        // Not JSON, use text as-is
      }
      
      // Provide user-friendly error messages
      if (res.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (res.status === 404) {
        errorMessage = "Service not found. Please check the URL.";
      } else if (res.status === 401) {
        errorMessage = "Please log in to continue.";
      } else if (res.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (res.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
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
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorText;
      } catch {
        // Not JSON, use text as-is
      }
      
      // Provide user-friendly error messages
      if (res.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (res.status === 404) {
        errorMessage = "Service not found. Please check the URL.";
      } else if (res.status === 401) {
        errorMessage = "Please log in to continue.";
      } else if (res.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (res.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
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
