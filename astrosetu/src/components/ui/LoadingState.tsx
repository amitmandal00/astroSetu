/**
 * Enhanced Loading State Component
 * Replaces vague "Calculating..." with specific, confidence-building messages
 */

interface LoadingStateProps {
  step?: "coordinates" | "planets" | "houses" | "dasha" | "dosha" | "general";
  place?: string;
  coordinates?: { latitude: number; longitude: number };
  ayanamsa?: string;
  timezone?: string;
  className?: string;
}

export function LoadingState({ 
  step = "general", 
  place,
  coordinates,
  ayanamsa = "Lahiri",
  timezone = "IST",
  className = ""
}: LoadingStateProps) {
  
  const getLoadingMessage = () => {
    switch (step) {
      case "coordinates":
        return place 
          ? `Resolving birth coordinates for ${place}`
          : "Determining location coordinates";
      
      case "planets":
        return `Computing planetary positions using ${ayanamsa} Ayanamsa`;
      
      case "houses":
        return "Calculating house divisions (Bhavas)";
      
      case "dasha":
        return "Applying Vimshottari Dasha rules";
      
      case "dosha":
        return "Analyzing planetary doshas and remedies";
      
      default:
        return coordinates
          ? `Computing planetary positions using ${ayanamsa} Ayanamsa`
          : "Processing astrological calculations";
    }
  };

  const getSubMessage = () => {
    if (coordinates) {
      return `${coordinates.latitude.toFixed(2)}°N, ${coordinates.longitude.toFixed(2)}°E • ${timezone}`;
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🌙</span>
        </div>
      </div>
      <div className="text-center space-y-2 max-w-md">
        <p className="text-base font-semibold text-slate-900">
          {getLoadingMessage()}
        </p>
        {getSubMessage() && (
          <p className="text-sm text-slate-600">
            {getSubMessage()}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Processing...
          </span>
        </div>
      </div>
    </div>
  );
}

