package main

import "fmt"

func a() {

	i := 0
	fmt.Println("first ", i)        // 0
	defer fmt.Println("second ", i) // 0
	i++
	fmt.Println("third", i) // 1
	i++
	defer fmt.Println("fourth", i)
}

func main() {
	a()
}
