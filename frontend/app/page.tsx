"use client";

import Header from "@/components/header";
import SearchForm from "@/components/search-form";
import StatsCards from "@/components/stats-cards";
import LeadGrid from "@/components/lead-grid";
import { useSearch } from "@/hooks/use-search";

export default function Home() {
  const { loading, data, search } = useSearch();
  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <SearchForm loading={loading} onSearch={search} />
        <StatsCards data={data} />
        <LeadGrid loading={loading} data={data?.results ?? []} />
      </div>
    </main>
  );
}
