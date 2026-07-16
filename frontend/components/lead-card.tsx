"use client";

import { Lead } from "@/types/lead";
import {
    Globe,
    MapPinned,
    Phone,
    Mail,
} from "lucide-react";

import Rating from "./rating";
import CopyButton from "./copy-button";
import SocialLinks from "./social-links";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card className="p-5 hover:shadow-xl transition">
      <div className="flex justify-between">
        <h2 className="font-bold text-lg">{lead.name}</h2>
        <Rating rating={lead.rating} />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {lead.category ?? "Business"}
      </p>

      <div className="space-y-3 mt-5">
        <div className="flex gap-2">
          <MapPinned className="w-4 h-4 mt-1" />
          <span className="text-sm">{lead.address}</span>
        </div>

        {lead.phone && (
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </div>
            <CopyButton value={lead.phone} />
          </div>
        )}

        {lead.website && (
          <div className="flex gap-2">
            <Globe className="w-4 h-4" />
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-blue-600"
            >
              Website
            </a>
          </div>
        )}

        {lead.email && (
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Mail className="w-4 h-4" />
              {lead.email}
            </div>
            <CopyButton value={lead.email} />
          </div>
        )}

        {/* Dynamic prop values fixed here: removed literal quotes */}
        <SocialLinks
          facebook={lead.facebook}
          instagram={lead.instagram}
          linkedin={lead.linkedin}
        />

        <div className="flex gap-3 mt-4">
          <Button asChild>
            <a href={lead.google_maps} target="_blank" rel="noopener noreferrer">
              Google Maps
            </a>
          </Button>

          {lead.website && (
            <Button variant="secondary" asChild>
              <a href={lead.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}