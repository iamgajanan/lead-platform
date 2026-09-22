"use client";

import { useMemo, useState } from "react";
import { Lead } from "@/types/lead";
import LeadCard from "./lead-card";
import EmptyState from "./empty-state";
import Toolbar from "./toolbar";
import Pagination from "./pagination";

type Props = {
  data: Lead[];
  loading: boolean;
};

const PAGE_SIZE = 9;

export default function LeadGrid({ data, loading }: Props) {
  const [search, setSearch] = useState("");
  const [websiteOnly, setWebsiteOnly] = useState(false);
  const [emailOnly, setEmailOnly] = useState(false);
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let leads = [...data];
    const query = search.trim().toLowerCase();

    if (query) {
      leads = leads.filter((lead) =>
        [lead.name, lead.address, lead.category]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      );
    }

    if (websiteOnly) leads = leads.filter((lead) => Boolean(lead.website));

    if (emailOnly) {
      leads = leads.filter((lead) => Boolean(lead.email || lead.emails?.length));
    }

    if (phoneOnly) {
      leads = leads.filter((lead) => Boolean(lead.phone || lead.phones_from_website?.length));
    }

    switch (sortBy) {
      case "name":
        leads.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "reviews":
        leads.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      default:
        leads.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return leads;
  }, [data, search, websiteOnly, emailOnly, phoneOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Searching Google Maps and collecting businesses...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={(value) => { setSearch(value); setPage(1); }}
        websiteOnly={websiteOnly}
        setWebsiteOnly={(value) => { setWebsiteOnly(value); setPage(1); }}
        emailOnly={emailOnly}
        setEmailOnly={(value) => { setEmailOnly(value); setPage(1); }}
        phoneOnly={phoneOnly}
        setPhoneOnly={(value) => { setPhoneOnly(value); setPage(1); }}
        sortBy={sortBy}
        setSortBy={(value) => { setSortBy(value); setPage(1); }}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {paginated.map((lead, index) => (
              <LeadCard key={`${lead.google_maps}-${index}`} lead={lead} />
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
