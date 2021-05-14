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
	c.ResetBreadcrumb()
	c.TplName = "top.tpl"
	logger.End()
}
