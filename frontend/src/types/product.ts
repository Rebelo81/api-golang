export type Product = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type ProductPayload = {
  name: string;
  description: string;
  category: string;
  image_url: string;
  price: number;
  stock: number;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string>;
};
