"use client";

import { Lead } from "@/types/lead";
import { Globe, MapPinned, Phone, Mail, AtSign } from "lucide-react";
import Rating from "./rating";
import CopyButton from "./copy-button";
import SocialLinks from "./social-links";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function LeadCard({ lead }: { lead: Lead }) {
  const emails = lead.emails?.length ? lead.emails : lead.email ? [lead.email] : [];
  const websitePhones = lead.phones_from_website ?? [];

  return (
    <Card className="p-5 hover:shadow-xl transition">
      <div className="flex justify-between gap-3"><h2 className="font-bold text-lg">{lead.name}</h2><Rating rating={lead.rating} /></div>
      <p className="text-sm text-gray-500 mt-2">{lead.category ?? "Business"}</p>
      <div className="space-y-3 mt-5">
        <div className="flex gap-2"><MapPinned className="w-4 h-4 mt-1 shrink-0" /><span className="text-sm">{lead.address || "Address unavailable"}</span></div>
        {lead.phone && <div className="flex justify-between gap-2"><div className="flex gap-2 text-sm"><Phone className="w-4 h-4 shrink-0" />{lead.phone}</div><CopyButton value={lead.phone} /></div>}
        {websitePhones.map((phone) => <div key={phone} className="flex justify-between gap-2"><div className="flex gap-2 text-sm"><Phone className="w-4 h-4 shrink-0" />{phone}</div><CopyButton value={phone} /></div>)}
        {lead.website && <div className="flex gap-2"><Globe className="w-4 h-4 shrink-0" /><a href={lead.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600">Website</a></div>}
        {emails.map((email) => <div key={email} className="flex justify-between gap-2"><div className="flex gap-2 text-sm min-w-0"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">{email}</span></div><CopyButton value={email} /></div>)}
        <SocialLinks facebook={lead.facebook ?? undefined} instagram={lead.instagram ?? undefined} linkedin={lead.linkedin ?? undefined} />
        {lead.enrichment_pages?.length ? <div className="flex items-center gap-2 text-xs text-slate-500"><AtSign className="w-3 h-3" />Enriched from {lead.enrichment_pages.length} page(s)</div> : null}
        <div className="flex gap-3 mt-4"><Button asChild><a href={lead.google_maps} target="_blank" rel="noopener noreferrer">Google Maps</a></Button>{lead.website && <Button variant="secondary" asChild><a href={lead.website} target="_blank" rel="noopener noreferrer">Website</a></Button>}</div>
      </div>
    </Card>
  );
}
