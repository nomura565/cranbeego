package models

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

//Config comment
type Config struct {
	Title   string `json:"title"`
	BaseURL string `json:"baseURL"`
	RequestParameter map[string]string `json:"requestParameter"`
	RoutingURL map[string]string `json:"routingURL"`
	ImageFolder string `json:"imageFolder"`
}

//NewConfig comment
func NewConfig() (c *Config, err error) {
	c = new(Config)
	p, _ := os.Getwd()
	fmt.Println(p)
	jsonString, err := ioutil.ReadFile("./conf/config.json") //カレントディレクトリからの相対パス
	if err != nil {
		return c, err
	}
	err = json.Unmarshal(jsonString, c)
	return
}
