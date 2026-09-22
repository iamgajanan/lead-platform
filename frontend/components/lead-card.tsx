"use client";

import { Globe, MapPinned, Phone, Mail, AtSign } from "lucide-react";

import { Lead } from "@/types/lead";
import Rating from "./rating";
import CopyButton from "./copy-button";
import SocialLinks from "./social-links";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}

function isUsablePhone(value: string) {
  if (/[/%]/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const emails = uniqueValues(lead.emails?.length ? lead.emails : [lead.email]);
  const phones = uniqueValues([lead.phone, ...(lead.phones_from_website ?? [])]).filter(isUsablePhone);

  return (
    <Card className="h-full gap-0 p-4 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">{lead.name}</h2>
          <p className="mt-1 text-xs text-slate-500">{lead.category ?? "Business"}</p>
        </div>
        <div className="shrink-0">
          <Rating rating={lead.rating} />
        </div>
      </div>

      <div className="mt-4 flex min-w-0 items-start gap-2 border-t border-slate-100 pt-3">
        <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="line-clamp-3 text-xs leading-5 text-slate-600">{lead.address || "Address unavailable"}</p>
      </div>

      <div className="mt-3 space-y-2">
        {phones.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-2.5">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Phone className="h-3.5 w-3.5" />
              Phone{phones.length > 1 ? "s" : ""}
            </div>
            <div className="max-h-24 space-y-1 overflow-y-auto">
              {phones.map((phone) => (
                <div key={phone} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-xs text-slate-700" title={phone}>{phone}</span>
                  <CopyButton value={phone} />
                </div>
              ))}
            </div>
          </div>
        )}

        {lead.website && (
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <Globe className="h-4 w-4 shrink-0 text-slate-400" />
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">
              {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </div>
        )}

        {emails.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-2.5">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              Email{emails.length > 1 ? "s" : ""}
            </div>
            <div className="max-h-20 space-y-1 overflow-y-auto">
              {emails.map((email) => (
                <div key={email} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-xs text-slate-700" title={email}>{email}</span>
                  <CopyButton value={email} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <SocialLinks facebook={lead.facebook ?? undefined} instagram={lead.instagram ?? undefined} linkedin={lead.linkedin ?? undefined} />
      </div>

      {lead.enrichment_pages?.length ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <AtSign className="h-3 w-3" />
          Enriched from {lead.enrichment_pages.length} page(s)
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button size="sm" asChild>
          <a href={lead.google_maps} target="_blank" rel="noopener noreferrer">Google Maps</a>
        </Button>
        {lead.website && (
          <Button size="sm" variant="secondary" asChild>
            <a href={lead.website} target="_blank" rel="noopener noreferrer">Website</a>
          </Button>
        )}
      </div>
    </Card>
  );
}
