package controllers

import (
	"cranbeego/models"
	"cranbeego/utils"
	"cranbeego/viewmodels"
	"encoding/json"
	"fmt"

	"github.com/astaxie/beego/orm"
)

//TemplateListController comment
type TemplateListController struct {
	CommonController
}

//Get comment
func (c *TemplateListController) Get() {
	logger := utils.NewLogger()
	logger.Start()
	config, _ := models.NewConfig()
	bcText, bcLink := "一覧系画面テンプレート", config.RoutingURL["templateList"]
	c.AddBreadcrumb(bcText, bcLink)
	var viewmodel = viewmodels.TemplateList{}
	existsFlg, bcc := c.ExistsBreadcrumbCondition(bcLink)
	if existsFlg == true {
		viewmodel = bcc.(viewmodels.TemplateList)
	}
	c.Data["viewmodel"] = &viewmodel
	c.TplName = "templateList.tpl"
	logger.End()
}

//GetRoleMaster comment
func (c *TemplateListController) GetRoleMaster() {
	logger := utils.NewLogger()
	logger.Start()
	config, _ := models.NewConfig()
	defer c.errorRecover()

	var viewmodel = viewmodels.TemplateList{}
	valid := viewmodel.Valid()
	json.Unmarshal(c.Ctx.Input.RequestBody, &viewmodel)
	c.setBreadcrumbCondition(config.RoutingURL["templateList"], viewmodel)

	o := orm.NewOrm()
	roleList, _, err := models.GetRoleList(o, viewmodel.RoleName)
	if err != nil {
		valid.SetError("GetRoleList", err.Error())
		c.errorReturn(valid.Errors)
		return
	}

	c.okDataReturn(roleList)
	logger.End()
}

//DoDelete comment
func (c *TemplateListController) DoDelete() {
	logger := utils.NewLogger()
	logger.Start()
	defer c.errorRecover()

	var viewmodel = viewmodels.TemplateList{}
	json.Unmarshal(c.Ctx.Input.RequestBody, &viewmodel)
	messages, _ := models.NewMessages()

	valid := viewmodel.Valid()

	if valid.HasErrors() {
		c.errorReturn(valid.Errors)
		return
	}
	o := orm.NewOrm()
	_, err := models.DoExecute(o, func(db orm.Ormer) (interface{}, error) {
		for _, v := range viewmodel.RoleMasterGrid {
			logger.Info(fmt.Sprintf("delete role RoleId:%d", v.RoleId))
			err := models.DeleteRole(db, v.RoleId)
			if err != nil {
				return nil, err
			}
		}
		return nil, nil
	})

	if err != nil {
		valid.SetError("DeleteRole", messages.E_010)
		c.errorReturn(valid.Errors)
		return
	}

	c.okReturn()
	logger.End()
}
