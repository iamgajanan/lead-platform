"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { SearchResponse } from "@/types/lead";

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);

  async function search(keyword: string, location: string, enrich = false) {
    try {
      setLoading(true);
      const response = await api.post<SearchResponse>("/search", {
        keyword: keyword.trim(),
        location: location.trim(),
        enrich,
      });
      setData(response.data);
      toast.success(`${response.data.count} Businesses Found`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Unable to search leads");
    } finally {
      setLoading(false);
    }
  }

  return { loading, data, search };
}
