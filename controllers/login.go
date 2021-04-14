package controllers

import (
	"cranbeego/models"
	"cranbeego/viewmodels"
	"cranbeego/logics"
	"encoding/json"
	"github.com/astaxie/beego/orm"
	"net/http"
	"fmt"
)

//LoginController comment
type LoginController struct {
	CommonController
}

//Get comment
func (c *LoginController) Get() {

	c.TplName = "login.tpl"
}

//DoLogin comment
func (c *LoginController) DoLogin() {
	defer c.errorRecover()
	var viewmodel = viewmodels.Login{}
	json.Unmarshal(c.Ctx.Input.RequestBody, &viewmodel)
	messages, _ := models.NewMessages()

	valid := viewmodel.Valid()
	//fmt.Println(c.getUserInfo())

	if valid.HasErrors() {
		c.errorReturn(valid.Errors)
		return
	}

	userId, err := logics.Authenticate(viewmodel)

	if err != nil || userId == 0 {
		valid.SetError("LoginCodePassword", fmt.Sprintf(messages.E_001, "ログインコード", "パスワード"))
		c.errorReturn(valid.Errors)
		return
	}
	o := orm.NewOrm()
	var userInfo models.UserInfo
	userInfo, err = models.GetUserInfo(o, userId)

	if err != nil {
		valid.SetError("GetUserInfo", err.Error())
		c.errorReturn(valid.Errors)
		return
	}

	c.setUserInfo(userInfo)
	c.okReturn()
}

//DoLogout comment
func (c *LoginController) DoLogout() {
	defer c.errorRecover()
	c.deleteUserInfo()
	c.DestroySession()
	config, _ := models.NewConfig()
	c.Redirect(config.RoutingURL["login"], http.StatusPermanentRedirect)
	return
}

