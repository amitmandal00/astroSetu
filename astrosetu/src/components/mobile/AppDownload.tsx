"use client";

import Link from "next/link";

export function AppDownload() {
  return (
    <div className="w-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-amber-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        {/* App Name */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-2">
            AstroSetu Kundli App
          </h2>
          <div className="w-32 md:w-48 h-1 bg-amber-400 mx-auto rounded-full"></div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          {/* Apple App Store Button */}
          <Link
            href="https://apps.apple.com/app/astrosage-kundli/id123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-black/90 hover:bg-black rounded-lg p-4 flex items-center gap-4 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-800 hover:border-gray-700"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.18 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </div>
            <div className="flex-grow text-left">
              <div className="text-xs text-white/80 mb-0.5">Available on the</div>
              <div className="text-lg font-bold text-white">App Store</div>
            </div>
          </Link>

          {/* Google Play Store Button */}
          <Link
            href="https://play.google.com/store/apps/details?id=com.astrosage.kundli"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-black/90 hover:bg-black rounded-lg p-4 flex items-center gap-4 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-800 hover:border-gray-700"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z"
                  fill="#00D9FF"
                />
                <path
                  d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"
                  fill="#00FF88"
                />
                <path
                  d="M3.84 2.15L13.69 12L3.84 21.85L3.84 2.15Z"
                  fill="#00D9FF"
                />
                <path
                  d="M16.81 8.88L14.54 11.15L6.05 2.66L16.81 8.88Z"
                  fill="#FFCE00"
                />
                <path
                  d="M16.81 15.12L20.16 12.85L16.81 10.58L16.81 15.12Z"
                  fill="#FF3A44"
                />
                <path
                  d="M16.81 8.88L20.16 11.15L16.81 13.42L16.81 8.88Z"
                  fill="#FFCE00"
                />
                <path
                  d="M6.05 21.34L16.81 15.12L20.16 12.85L6.05 21.34Z"
                  fill="#00FF88"
                />
                <path
                  d="M6.05 2.66L20.16 11.15L16.81 13.42L6.05 2.66Z"
                  fill="#00D9FF"
                />
              </svg>
            </div>
            <div className="flex-grow text-left">
              <div className="text-xs text-white/80 mb-0.5">Get it on</div>
              <div className="text-lg font-bold text-white">Google play</div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-amber-200/80">
            Download our mobile app for instant access to your Kundli, horoscopes, and more
          </p>
        </div>
      </div>
    </div>
  );
}

