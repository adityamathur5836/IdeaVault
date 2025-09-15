/**
 * Ideas Pool Hook
 * 
 * Purpose: React hook for accessing the global ideas pool (Account A)
 * Functionality: Browse, search, filter ideas from the curated pool
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Use Account B for product hunt data
const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_B_URL,
  import.meta.env.VITE_SUPABASE_B_ANON_KEY
)

export interface ProductHuntProduct {
  id: number
  product_id: string
  name: string
  product_description: string
  upvotes: number
  comments: string
  websites: string
  category_tags: string
  makers: string
  created_at: string
  updated_at: string
  embedding?: any
}

export const useIdeasPool = () => {
  const [products, setProducts] = useState<ProductHuntProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (filters?: {
    category?: string
    search?: string
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabaseB
        .from('product_hunt_products')
        .select('*')
        .order('upvotes', { ascending: false })

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,product_description.ilike.%${filters.search}%`)
      }

      if (filters?.category) {
        query = query.ilike('category_tags', `%${filters.category}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      toast.error('Failed to load ideas from pool')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    refetch: () => fetchProducts()
  }
}
