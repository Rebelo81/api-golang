package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/paulorebelo/go-crud-backend/internal/router"
	"github.com/paulorebelo/go-crud-backend/internal/store"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	productStore := store.NewMemoryProductStore()
	store.SeedDevProducts(productStore)
	handler := router.New(productStore)

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("API rodando em http://localhost:%s", port)
	log.Fatal(server.ListenAndServe())
}
