package controllers

import (

)

//TopController comment
type TopController struct {
	CommonController
}

//Get comment
func (c *TopController) Get() {

	c.TplName = "top.tpl"
}
