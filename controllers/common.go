package controllers

import (
	"errors"
	"net/http"
	"cranbeego/models"
	"github.com/astaxie/beego"
	"github.com/beego/beego/v2/core/validation"
	_ "fmt"
	"encoding/json"
)

//CommonController comment
type CommonController struct {
	beego.Controller
	userInfo models.UserInfo
}

func (c *CommonController) ngReturn(err error) {
	c.Data[c.getDataKey()] = map[string]interface{}{
		"status":  "ng",
		"data": err.Error(),
	}
	if c.IsAjax() {
		c.Ctx.Output.SetStatus(http.StatusBadRequest)
		c.ServeJSON()
	}
}

func (c *CommonController) getDataKey()(key string){
	key = "modelErrors"
	if c.IsAjax() {
		key = "json"
	}
	return
}

func (c *CommonController) convertToJson(val interface{})(ret string){
	bytes, err := json.Marshal(val)
    if err != nil {
        return
    }
	ret = string(bytes)
	return
}

func (c *CommonController) errorReturn(errors []*validation.Error) {
	data :=  make(map[string]string)
	//data["UserId"] = "akan"

	for _, err := range errors {
		data[err.Key] = err.Message
	}
	config, _ := models.NewConfig()
	mapData := map[string]interface{}{
		config.RequestParameter["isValid"]: false,
		config.RequestParameter["validationSummary"]: data,
	}
	if c.IsAjax() {
		c.Data[c.getDataKey()] = mapData
		c.Ctx.Output.SetStatus(http.StatusOK)
		c.ServeJSON()
	}else{
		c.Data[c.getDataKey()] = c.convertToJson(mapData)
	}
}

func (c *CommonController) okReturn() {
	config, _ := models.NewConfig()
	c.Data[c.getDataKey()] = map[string]interface{}{
		config.RequestParameter["isValid"]: true,
	}

	if c.IsAjax() {
		c.Ctx.Output.SetStatus(http.StatusOK)
		c.ServeJSON()
	}
}

func (c *CommonController) okDataReturn(d interface{}) {
	config, _ := models.NewConfig()
	c.Data[c.getDataKey()] = map[string]interface{}{
		config.RequestParameter["isValid"]: true,
		config.RequestParameter["data"]: d,
	}

	if c.IsAjax() {
		c.Ctx.Output.SetStatus(http.StatusOK)
		c.ServeJSON()
	}
}

//setUserInfo comment
func (c *CommonController) setUserInfo(userInfo models.UserInfo){
	c.SetSession("user", userInfo)
}

//getUserInfo comment
func (c *CommonController) getUserInfo() (userInfo models.UserInfo){
	temp := c.GetSession("user")
	if temp != nil{
		userInfo = c.GetSession("user").(models.UserInfo)
	}
	return
}

//deleteUserInfo comment
func (c *CommonController) deleteUserInfo() {
	c.DelSession("user")
	return
}

//errorRecover comment
func (c *CommonController) errorRecover() {
	if err := recover(); err != nil {
		var err2 error
		switch x := err.(type) {
		case string:
			err2 = errors.New(x)
		case error:
			err2 = x
		default:
			err2 = errors.New("unknown panic")
		}
		c.ngReturn(err2)
	}
}

//Prepare comment
func (c *CommonController) Prepare() {
	controller, _ := c.GetControllerAndAction()
	if controller != beego.AppConfig.String("defaultController") {
		c.userInfo = c.getUserInfo()
		if c.userInfo.UserId == 0 {
			c.DestroySession()
			if c.IsAjax() {
				messages, _ := models.NewMessages()
				valid := validation.Validation{}
				valid.SetError("NoSession", messages.E_012)
				c.errorReturn(valid.Errors)
				return
			}else{
				config, _ := models.NewConfig()
				c.Redirect(config.RoutingURL["login"], http.StatusPermanentRedirect)
				return
			}
		}else{
			if c.userInfo.PhotoImage == "" {
				c.userInfo.PhotoImage = "default_person.png"
			}
			c.Data["userInfo"] = &c.userInfo
		}
	}
	config, _ := models.NewConfig()
	c.Data["config"] = &config
}