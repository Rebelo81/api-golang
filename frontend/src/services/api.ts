import type { ApiError, Product, ProductPayload } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = data as ApiError | null;
    const errorMessage = apiError?.errors
      ? `${apiError.message}: ${Object.values(apiError.errors).join(', ')}`
      : apiError?.message ?? 'Erro inesperado na API';

    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  listProducts: () => request<Product[]>('/api/v1/products'),
  createProduct: (payload: ProductPayload) =>
    request<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: number, payload: ProductPayload) =>
    request<Product>(`/api/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: number) =>
    request<void>(`/api/v1/products/${id}`, {
      method: 'DELETE',
    }),
};
