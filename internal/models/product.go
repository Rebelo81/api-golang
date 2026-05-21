package models

import (
	"strings"
	"time"
)

// Product representa o recurso principal do CRUD.
type Product struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Category    string    `json:"category,omitempty"`
	ImageURL    string    `json:"image_url,omitempty"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	ImageURL    string  `json:"image_url"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	ImageURL    string  `json:"image_url"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

func (r CreateProductRequest) Validate() map[string]string {
	errors := make(map[string]string)

	if strings.TrimSpace(r.Name) == "" {
		errors["name"] = "nome é obrigatório"
	}
	if r.Price < 0 {
		errors["price"] = "preço não pode ser negativo"
	}
	if r.Stock < 0 {
		errors["stock"] = "estoque não pode ser negativo"
	}

	return errors
}

func (r UpdateProductRequest) Validate() map[string]string {
	return CreateProductRequest(r).Validate()
}
