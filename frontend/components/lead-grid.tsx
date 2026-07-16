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

export default function LeadGrid({
  data,
  loading,
}: Props) {
  const [search, setSearch] = useState("");

  const [websiteOnly, setWebsiteOnly] = useState(false);

  const [emailOnly, setEmailOnly] = useState(false);

  const [phoneOnly, setPhoneOnly] = useState(false);

  const [sortBy, setSortBy] = useState("rating");

  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let leads = [...data];

    // Search

    if (search.trim()) {
      const q = search.toLowerCase();

      leads = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(q) ||
          lead.address?.toLowerCase().includes(q)
      );
    }

    // Filters

    if (websiteOnly) {
      leads = leads.filter((x) => !!x.website);
    }

    if (emailOnly) {
      leads = leads.filter((x) => !!x.email);
    }

    if (phoneOnly) {
      leads = leads.filter((x) => !!x.phone);
    }

    // Sorting

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
  }, [
    data,
    search,
    websiteOnly,
    emailOnly,
    phoneOnly,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        Searching Google Maps...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Toolbar
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        websiteOnly={websiteOnly}
        setWebsiteOnly={(v) => {
          setWebsiteOnly(v);
          setPage(1);
        }}
        emailOnly={emailOnly}
        setEmailOnly={(v) => {
          setEmailOnly(v);
          setPage(1);
        }}
        phoneOnly={phoneOnly}
        setPhoneOnly={(v) => {
          setPhoneOnly(v);
          setPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((lead, index) => (
              <LeadCard
                key={`${lead.google_maps}-${index}`}
                lead={lead}
              />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
        />
        </>
      )}
    </div>
  );
}