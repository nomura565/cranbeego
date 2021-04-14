package controllers

import (
	"github.com/astaxie/beego"
)

// ErrorController ...
type ErrorController struct {
	beego.Controller
}

// Error404 ...
func (c *ErrorController) Error404() {
	//c.Data["json"] = map[string]string{"message": "page not found"}
	c.Data["json"] = map[string]interface{}{
		"status":  "ng",
		"message": "page not found",
	}
	c.ServeJSON()
}
