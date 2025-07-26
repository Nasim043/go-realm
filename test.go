package main
 
import "fmt"
 
func count() (result int) {
    defer func() { result++ }()
    return 5 // Returns 6
}

func main() {
	fmt.Println(count())
}