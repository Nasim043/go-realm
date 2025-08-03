package main

import (
	"fmt"
	"net/http"
)

func main() {
	// Define Route
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/about", aboutHandler)
	http.HandleFunc("/contact", contactHandler)
	// starat serve
	fmt.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the Home Page!")
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the About Page!")
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "welcome to the contact page!")
}
