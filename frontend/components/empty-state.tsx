import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed">

      <SearchX className="mb-5 h-14 w-14 text-gray-400" />

      <h2 className="text-xl font-semibold">
        No Leads Found
      </h2>

      <p className="mt-2 text-gray-500">
        Search for businesses using Google Maps.
      </p>

    </div>
  );
}