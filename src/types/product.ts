export interface Product {
  id: string
  name: string
  brand: string
  description: string
  model: string
  price: string
  price_numeric?: number
  price_text?: string
  gst_amount?: number
  price_with_gst?: number
  cooling_capacity?: string
  heating_capacity?: string
  has_wifi?: boolean
  series?: string
  image?: string
  product_images?: string[] | string | null
  promotions?: string[] | null
  created_at: string
  updated_at: string
  // Additional fields that might be useful
  [key: string]: any
}

export interface CreateProductData {
  name: string
  brand: string
  description: string
  model: string
  price: string | number
  price_numeric?: number
  price_text?: string
  gst_amount?: number
  price_with_gst?: number
  cooling_capacity?: string
  heating_capacity?: string
  has_wifi?: boolean
  series?: string
  image?: string
  product_images?: string[] | string | null
  promotions?: string[] | null
  [key: string]: any
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}
