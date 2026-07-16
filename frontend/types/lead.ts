export interface Lead {
  name: string
  category: string | null
  rating: number | null
  reviews: number | null
  address: string | null
  phone: string | null
  website: string | null
  email: string | null
  facebook: string | null
  instagram: string | null
  linkedin: string | null
  google_maps: string
}

export interface SearchResponse {
  success: boolean
  count: number
  results: Lead[]
}