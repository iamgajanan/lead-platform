export interface Lead {
  name: string
  category: string | null
  rating: number | null
  reviews: number | null
  address: string | null
  phone: string | null
  website: string | null
  email?: string | null
  emails?: string[]
  phones_from_website?: string[]
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  enrichment_pages?: string[]
  google_maps: string
}

export interface SearchResponse {
  success: boolean
  count: number
  enriched?: boolean
  results: Lead[]
}
