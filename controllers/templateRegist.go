package controllers

import (
	"cranbeego/logics"
	"cranbeego/models"
	"cranbeego/utils"
	"cranbeego/viewmodels"
	"encoding/json"
	"strconv"

	"github.com/astaxie/beego/orm"
)

//TemplateRegistController comment
type TemplateRegistController struct {
	CommonController
}

//Get comment
func (c *TemplateRegistController) Get() {
	logger := utils.NewLogger()
	logger.Start()
	config, _ := models.NewConfig()
	bcText, bcLink := "登録系画面テンプレート", config.RoutingURL["templateRegist"]
	c.TplName = "templateRegist.tpl"
	id := c.GetString("id")
	var viewmodel = viewmodels.TemplateRegist{}
	valid := viewmodel.Valid()
	messages, _ := models.NewMessages()
	if id != "" {
		bcLink = bcLink + "?id=" + id
		roleId, err := strconv.Atoi(id)

		if err == nil && roleId != 0 {
			o := orm.NewOrm()
			role, err := models.GetRole(o, int32(roleId))
			if err != nil || role.RoleId == 0 {
				valid.SetError("GetRole", messages.E_014)
				c.errorReturn(valid.Errors)
				return
			}
			c.Data["role"] = role
		} else {
			valid.SetError("GetRole", messages.E_014)
			c.errorReturn(valid.Errors)
			return
		}
	}

	c.AddBreadcrumb(bcText, bcLink)
	logger.End()
}

//DoRegist comment
func (c *TemplateRegistController) DoRegist() {
	logger := utils.NewLogger()
	logger.Start()
	defer c.errorRecover()
	var viewmodel = viewmodels.TemplateRegist{}
	json.Unmarshal(c.Ctx.Input.RequestBody, &viewmodel)
	messages, _ := models.NewMessages()

	valid := viewmodel.Valid()

	if valid.HasErrors() {
		c.errorReturn(valid.Errors)
		return
	}

	model := new(models.RoleMaster)
	model.RoleId = viewmodel.RoleId
	model.RoleName = viewmodel.RoleName
	model.RoleDescription = viewmodel.RoleDescription
	model.RowVersion = viewmodel.RowVersion
	model.CreatedUserId = c.getUserInfo().UserId
	model.UpdatedUserId = model.CreatedUserId
	model.CreatedDate = utils.GetNow()
	model.UpdatedDate = model.CreatedDate

	ret, err := logics.RegistRoleMaster(model)
	if ret == false || err != nil {
		valid.SetError("RegistRoleMaster", messages.E_009)
		c.errorReturn(valid.Errors)
		return
	}

	c.okDataReturn(model)
	logger.End()
}
