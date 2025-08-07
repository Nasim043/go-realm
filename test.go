package main

import (
	"fmt"
)

func calculate() int {
	result := 0
	fmt.Println("first", result)

	defer func() {
		result = result + 10
		fmt.Println("defer", result)
	}()

	result = 5
	fmt.Println("second", result)

	return result
}
func main() {
	unnamedReturn := calculate()
	fmt.Println("Unnamed Return", unnamedReturn)
}
