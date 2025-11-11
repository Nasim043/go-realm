package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	
	go func () {
		time.Sleep(2 * time.Second)
		ch1 <- "🍎 From channel 1"
	}()


	select {
		case msg1 := <-ch1:
			fmt.Println(msg1)
		case <-time.After(2 * time.Second):
			fmt.Println("Timeout! ⏰ No data received.")
	}
}
