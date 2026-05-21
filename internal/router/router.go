package router

import (
	"net/http"
	"time"

	"github.com/paulorebelo/go-crud-backend/internal/handlers"
	"github.com/paulorebelo/go-crud-backend/internal/store"
)

func New(productStore store.ProductStore) http.Handler {
	mux := http.NewServeMux()
	productHandler := handlers.NewProductHandler(productStore)

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	mux.HandleFunc("/api/v1/products", productHandler.Products)
	mux.HandleFunc("/api/v1/products/", productHandler.ProductByID)

	return cors(logging(mux))
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		println(r.Method, r.URL.Path, time.Since(start).String())
	})
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
