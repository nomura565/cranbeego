package controllers

import (
	"cranbeego/utils"
)

//TopController comment
type TopController struct {
	CommonController
}

//Get comment
func (c *TopController) Get() {
	logger := utils.NewLogger()
	logger.Start()
	c.TplName = "top.tpl"
	logger.End()
}
