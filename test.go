package main

import ("fmt"
	"strings"
)

func main() {
	message := "Hello World!"
	fmt.Println(strings.Replace(message, "World", "Go", 1)) // "Hello Go!"
} 