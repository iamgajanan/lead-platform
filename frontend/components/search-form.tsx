"use client";

import { useState } from "react";
import { Search, MapPin, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  loading: boolean;
  onSearch: (keyword: string, location: string, enrich: boolean) => void;
};

export default function SearchForm({ loading, onSearch }: Props) {
  const [keyword, setKeyword] = useState("Dentist");
  const [location, setLocation] = useState("Pune");
  const [enrich, setEnrich] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;
    onSearch(keyword, location, enrich);
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input className="pl-10" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keyword" />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        </div>
        <Button disabled={loading || !keyword.trim() || !location.trim()} type="submit">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : "Search Leads"}
        </Button>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" checked={enrich} onChange={(e) => setEnrich(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span><strong>Enrich leads</strong> <span className="text-slate-500">(crawl websites for emails, phones and social profiles)</span></span>
      </label>
      {enrich && <p className="text-xs text-amber-700">Website enrichment may increase search time because each business website is checked.</p>}
    </form>
  );
}
