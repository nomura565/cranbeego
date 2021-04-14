package models

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

//Messages comment
type Messages struct {
	E_000   string
	E_001 string
	E_002 string
	E_003 string
	E_004 string
	E_005 string
	E_006 string
	E_007 string
	E_008 string
	E_009 string
	E_010 string
	E_011 string
	E_012 string
	E_013 string
	E_014 string
	I_000 string
	I_001 string
	I_002 string
	W_000 string
}

//NewMessages comment
func NewMessages() (c *Messages, err error) {
	c = new(Messages)
	p, _ := os.Getwd()
	fmt.Println(p)
	jsonString, err := ioutil.ReadFile("./conf/messages.json") //カレントディレクトリからの相対パス
	if err != nil {
		return c, err
	}
	err = json.Unmarshal(jsonString, c)
	return
}
