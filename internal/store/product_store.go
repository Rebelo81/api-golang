package store

import (
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/paulorebelo/go-crud-backend/internal/models"
)

var ErrNotFound = errors.New("produto não encontrado")

type ProductStore interface {
	Create(input models.CreateProductRequest) models.Product
	List() []models.Product
	GetByID(id int64) (models.Product, error)
	Update(id int64, input models.UpdateProductRequest) (models.Product, error)
	Delete(id int64) error
}

type MemoryProductStore struct {
	mu       sync.RWMutex
	products map[int64]models.Product
	nextID   int64
}

func NewMemoryProductStore() *MemoryProductStore {
	return &MemoryProductStore{
		products: make(map[int64]models.Product),
		nextID:   1,
	}
}

func (s *MemoryProductStore) Create(input models.CreateProductRequest) models.Product {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	product := models.Product{
		ID:          s.nextID,
		Name:        input.Name,
		Description: input.Description,
		Category:    input.Category,
		ImageURL:    input.ImageURL,
		Price:       input.Price,
		Stock:       input.Stock,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	s.products[product.ID] = product
	s.nextID++

	return product
}

func (s *MemoryProductStore) List() []models.Product {
	s.mu.RLock()
	defer s.mu.RUnlock()

	products := make([]models.Product, 0, len(s.products))
	for _, product := range s.products {
		products = append(products, product)
	}

	sort.Slice(products, func(i, j int) bool {
		return products[i].ID < products[j].ID
	})

	return products
}

func (s *MemoryProductStore) GetByID(id int64) (models.Product, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	product, ok := s.products[id]
	if !ok {
		return models.Product{}, ErrNotFound
	}

	return product, nil
}

func (s *MemoryProductStore) Update(id int64, input models.UpdateProductRequest) (models.Product, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	product, ok := s.products[id]
	if !ok {
		return models.Product{}, ErrNotFound
	}

	product.Name = input.Name
	product.Description = input.Description
	product.Category = input.Category
	product.ImageURL = input.ImageURL
	product.Price = input.Price
	product.Stock = input.Stock
	product.UpdatedAt = time.Now().UTC()

	s.products[id] = product

	return product, nil
}

func (s *MemoryProductStore) Delete(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.products[id]; !ok {
		return ErrNotFound
	}

	delete(s.products, id)
	return nil
}
