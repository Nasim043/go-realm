package main

import "fmt"

func Sum(nums ...int) int {
	sum := 0
	for _, v := range nums {
		sum += v
	}
	return sum;
}
func main() {
	fmt.Println(Sum(1, 2, 3, 4, 5))
}
