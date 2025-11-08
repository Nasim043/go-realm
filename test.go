package main

import (
	"fmt"
	"time"
)

func cookSoup(){
	for i:=0;i<5;i++{
		fmt.Println("soup",i)
		time.Sleep(time.Millisecond * 500)
	}
}

func chopVegetables(){
	for i:=0;i<5;i++{
		fmt.Println("vegetables",i)
		time.Sleep(time.Millisecond * 500)
	}
}

func main(){
	go cookSoup()        // concurreny - context swithing
	go chopVegetables()  // concurreny - context swithing

	time.Sleep(time.Second * 3)
	fmt.Println("All tasks managed concurrently!")
}
