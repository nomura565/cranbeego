package controllers

import (
	"cranbeego/logics"
	"cranbeego/models"
	"cranbeego/utils"
	"cranbeego/viewmodels"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/astaxie/beego/orm"
)

//LoginController comment
type LoginController struct {
	CommonController
}

//Get comment
func (c *LoginController) Get() {
	logger := utils.NewLogger()
	logger.Start()
	c.TplName = "login.tpl"
	logger.End()
}

//DoLogin comment
func (c *LoginController) DoLogin() {
	logger := utils.NewLogger()
	logger.Start()
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

	logger.Info(fmt.Sprintf("login user userId:%d", userInfo.UserId))
	c.setUserInfo(userInfo)
	c.okReturn()
	logger.End()
}

//DoLogout comment
func (c *LoginController) DoLogout() {
	logger := utils.NewLogger()
	logger.Start()
	defer c.errorRecover()
	userInfo := c.getUserInfo()
	if userInfo.UserId != 0 {
		logger.Info(fmt.Sprintf("logout user userId:%d", userInfo.UserId))
		c.deleteUserInfo()
		c.DestroySession()
	}
	config, _ := models.NewConfig()
	c.Redirect(config.RoutingURL["login"], http.StatusPermanentRedirect)
	logger.End()
	return
}
