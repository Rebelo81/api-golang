package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/paulorebelo/go-crud-backend/internal/models"
	"github.com/paulorebelo/go-crud-backend/internal/store"
)

type ProductHandler struct {
	store store.ProductStore
}

func NewProductHandler(store store.ProductStore) *ProductHandler {
	return &ProductHandler{store: store}
}

func (h *ProductHandler) Products(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.list(w, r)
	case http.MethodPost:
		h.create(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "método não permitido")
	}
}

func (h *ProductHandler) ProductByID(w http.ResponseWriter, r *http.Request) {
	id, ok := parseID(w, r.URL.Path, "/api/v1/products/")
	if !ok {
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getByID(w, r, id)
	case http.MethodPut:
		h.update(w, r, id)
	case http.MethodDelete:
		h.delete(w, r, id)
	default:
		writeError(w, http.StatusMethodNotAllowed, "método não permitido")
	}
}

func (h *ProductHandler) list(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.store.List())
}

func (h *ProductHandler) create(w http.ResponseWriter, r *http.Request) {
	var input models.CreateProductRequest
	if !decodeJSON(w, r, &input) {
		return
	}

	if validationErrors := input.Validate(); len(validationErrors) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "dados inválidos", "errors": validationErrors})
		return
	}

	product := h.store.Create(input)
	writeJSON(w, http.StatusCreated, product)
}

func (h *ProductHandler) getByID(w http.ResponseWriter, _ *http.Request, id int64) {
	product, err := h.store.GetByID(id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}

	writeJSON(w, http.StatusOK, product)
}

func (h *ProductHandler) update(w http.ResponseWriter, r *http.Request, id int64) {
	var input models.UpdateProductRequest
	if !decodeJSON(w, r, &input) {
		return
	}

	if validationErrors := input.Validate(); len(validationErrors) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "dados inválidos", "errors": validationErrors})
		return
	}

	product, err := h.store.Update(id, input)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}

	writeJSON(w, http.StatusOK, product)
}

func (h *ProductHandler) delete(w http.ResponseWriter, _ *http.Request, id int64) {
	if err := h.store.Delete(id); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, err.Error())
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func parseID(w http.ResponseWriter, path, prefix string) (int64, bool) {
	idText := strings.TrimPrefix(path, prefix)
	if idText == "" || strings.Contains(idText, "/") {
		writeError(w, http.StatusNotFound, "rota não encontrada")
		return 0, false
	}

	id, err := strconv.ParseInt(idText, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "id inválido")
		return 0, false
	}

	return id, true
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		writeError(w, http.StatusBadRequest, "json inválido")
		return false
	}

	return true
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}
