package controllers

import (
	"cranbeego/models"
	"cranbeego/viewmodels"
	"github.com/astaxie/beego/orm"
	"encoding/json"
)

//TemplateListController comment
type TemplateListController struct {
	CommonController
}

//Get comment
func (c *TemplateListController) Get() {

	c.TplName = "templateList.tpl"
}

//GetRoleMaster comment
func (c *TemplateListController) GetRoleMaster() {
	defer c.errorRecover()

	var viewmodel = viewmodels.TemplateList{}
	valid := viewmodel.Valid()
	json.Unmarshal(c.Ctx.Input.RequestBody, &viewmodel)

	o := orm.NewOrm()
	roleList, _, err := models.GetRoleList(o, viewmodel.RoleName)
	if err != nil {
		valid.SetError("GetRoleList", err.Error())
		c.errorReturn(valid.Errors)
		return
	}

	c.okDataReturn(roleList)
}

//DoDelete comment
func (c *TemplateListController) DoDelete() {
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
}
