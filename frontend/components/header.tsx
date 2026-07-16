import { MapPinned } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <MapPinned className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">
              Lead Platform
            </h1>
            <p className="text-sm text-gray-500">
              Google Maps Lead Scraper
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}