"use client";

import { Search, Globe, Mail, Phone, ArrowUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ToolbarProps = {
  search: string;
  setSearch: (value: string) => void;

  websiteOnly: boolean;
  setWebsiteOnly: (value: boolean) => void;

  emailOnly: boolean;
  setEmailOnly: (value: boolean) => void;

  phoneOnly: boolean;
  setPhoneOnly: (value: boolean) => void;

  sortBy: string;
  setSortBy: (value: string) => void;

  total: number;
};

export default function Toolbar({
  search,
  setSearch,
  websiteOnly,
  setWebsiteOnly,
  emailOnly,
  setEmailOnly,
  phoneOnly,
  setPhoneOnly,
  sortBy,
  setSortBy,
  total,
}: ToolbarProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-md">

          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business or address..."
            className="pl-10"
          />

        </div>

        {/* Sort */}

        <div className="flex items-center gap-2">

          <ArrowUpDown className="h-4 w-4 text-gray-500" />

          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="rating">
                Highest Rating
              </SelectItem>

              <SelectItem value="reviews">
                Most Reviews
              </SelectItem>

              <SelectItem value="name">
                Business Name
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">

        {/* Website */}

        <label className="flex cursor-pointer items-center gap-2">

          <Checkbox
            checked={websiteOnly}
            onCheckedChange={(checked) =>
              setWebsiteOnly(Boolean(checked))
            }
          />

          <Globe className="h-4 w-4 text-blue-600" />

          <span>Website</span>

        </label>

        {/* Email */}

        <label className="flex cursor-pointer items-center gap-2">

          <Checkbox
            checked={emailOnly}
            onCheckedChange={(checked) =>
              setEmailOnly(Boolean(checked))
            }
          />

          <Mail className="h-4 w-4 text-green-600" />

          <span>Email</span>

        </label>

        {/* Phone */}

        <label className="flex cursor-pointer items-center gap-2">

          <Checkbox
            checked={phoneOnly}
            onCheckedChange={(checked) =>
              setPhoneOnly(Boolean(checked))
            }
          />

          <Phone className="h-4 w-4 text-orange-600" />

          <span>Phone</span>

        </label>

      </div>

      <div className="mt-6 border-t pt-4">

        <span className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-black">
            {total}
          </span>{" "}
          businesses
        </span>

      </div>

    </div>
  );
}