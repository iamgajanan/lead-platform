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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search business or address..."
            className="h-10 pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 w-[190px]">
              <SelectValue placeholder="Sort results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="name">Business Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={websiteOnly} onCheckedChange={(checked) => setWebsiteOnly(Boolean(checked))} />
          <Globe className="h-4 w-4 text-blue-600" />
          Website
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={emailOnly} onCheckedChange={(checked) => setEmailOnly(Boolean(checked))} />
          <Mail className="h-4 w-4 text-emerald-600" />
          Email
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={phoneOnly} onCheckedChange={(checked) => setPhoneOnly(Boolean(checked))} />
          <Phone className="h-4 w-4 text-orange-600" />
          Phone
        </label>
        <span className="ml-auto text-xs text-slate-500">
          Showing <strong className="text-slate-900">{total}</strong> businesses
        </span>
      </div>
    </div>
  );
}
