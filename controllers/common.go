package controllers

import (
	"cranbeego/models"
	"cranbeego/utils"
	"cranbeego/viewmodels"
	"encoding/json"
	"errors"
	_ "fmt"
	"net/http"
	"net/url"

	"github.com/astaxie/beego"
	"github.com/beego/beego/v2/core/validation"
)

//CommonController comment
type CommonController struct {
	beego.Controller
	userInfo models.UserInfo
}

func (c *CommonController) ngReturn(err error) {
	logger := utils.NewLogger()
	logger.Panic(err.Error())
	c.Data[c.getDataKey()] = map[string]interface{}{
		"status": "ng",
		"data":   err.Error(),
	}
	if c.IsAjax() {
		c.Ctx.Output.SetStatus(http.StatusBadRequest)
		c.ServeJSON()
	}
}

func (c *CommonController) getDataKey() (key string) {
	key = "modelErrors"
	if c.IsAjax() {
		key = "json"
	}
	return
}

func (c *CommonController) convertToJson(val interface{}) (ret string) {
	bytes, err := json.Marshal(val)
	if err != nil {
		return
	}
	ret = string(bytes)
	return
}

func (c *CommonController) errorReturn(errors []*validation.Error) {
	logger := utils.NewLogger()
	logger.Start()
	data := make(map[string]string)
	//data["UserId"] = "akan"

	for _, err := range errors {
		data[err.Key] = err.Message
		logger.Error(err.Message)
	}
	config, _ := models.NewConfig()
	mapData := map[string]interface{}{
		config.RequestParameter["isValid"]:           false,
		config.RequestParameter["validationSummary"]: data,
	}
	if c.IsAjax() {
		c.Data[c.getDataKey()] = mapData
		c.Ctx.Output.SetStatus(http.StatusOK)
		c.ServeJSON()
	} else {
		c.Data[c.getDataKey()] = c.convertToJson(mapData)
	}
	logger.End()
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
		config.RequestParameter["data"]:    d,
	}

	if c.IsAjax() {
		c.Ctx.Output.SetStatus(http.StatusOK)
		c.ServeJSON()
	}
}

//setUserInfo comment
func (c *CommonController) setUserInfo(userInfo models.UserInfo) {
	c.SetSession("user", userInfo)
}

//getUserInfo comment
func (c *CommonController) getUserInfo() (userInfo models.UserInfo) {
	temp := c.GetSession("user")
	if temp != nil {
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
	logger := utils.NewLogger()
	logger.Start()
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
			} else {
				config, _ := models.NewConfig()
				c.Redirect(config.RoutingURL["login"], http.StatusFound)
				return
			}
		} else {
			if c.userInfo.PhotoImage == "" {
				c.userInfo.PhotoImage = "default_person.png"
			}
			c.Data["userInfo"] = &c.userInfo
			c.Data["breadCrumbList"] = c.getBreadcrumbList()
			//c.Data["breadCrumbListCount"] = len(c.getBreadcrumbList()) - 1
		}
	}
	config, _ := models.NewConfig()
	c.Data["config"] = &config
	logger.End()
}

func (c *CommonController) ResetBreadcrumb() {
	config, _ := models.NewConfig()
	breadCrumb := new(models.BreadCrumb)
	breadCrumb.Text = "トップ"
	breadCrumb.Link = config.RoutingURL["top"]
	breadCrumbList := make([]models.BreadCrumb, 0)
	breadCrumbList = append(breadCrumbList, *breadCrumb)
	c.setBreadcrumbList(breadCrumbList)
}

func (c *CommonController) AddBreadcrumb(text string, link string) {
	linkUrl, err := url.ParseRequestURI(link)
	if err == nil {
		//ぱんくずリストのフラグをgetパラメータに上書きする
		v := linkUrl.Query()
		v.Set("bcl", "true")
		linkUrl.RawQuery = v.Encode()
		link = linkUrl.RequestURI()
		//logger := utils.NewLogger()
		//logger.Info("RequestURI:" + test.RequestURI())
	}

	breadCrumb := new(models.BreadCrumb)
	breadCrumb.Text = text
	breadCrumb.Link = link
	breadCrumbList := c.getBreadcrumbList()
	//breadCrumbList = append(breadCrumbList, *breadCrumb)
	existFlg := false
	newBreadCrumbList := make([]models.BreadCrumb, 0)
	for _, bcl := range breadCrumbList {
		if bcl.Text == breadCrumb.Text {
			newBreadCrumbList = append(newBreadCrumbList, *breadCrumb)
			existFlg = true
		} else {
			newBreadCrumbList = append(newBreadCrumbList, bcl)
		}
	}

	if existFlg == false {
		newBreadCrumbList = append(newBreadCrumbList, *breadCrumb)
	}
	c.setBreadcrumbList(newBreadCrumbList)
	//c.Data["breadCrumbListCount"] = len(c.getBreadcrumbList()) - 1
}

//setBreadcrumb comment
func (c *CommonController) setBreadcrumbList(breadCrumbList []models.BreadCrumb) {
	c.SetSession("breadcrumbList", breadCrumbList)
	c.Data["breadCrumbList"] = c.getBreadcrumbList()
}

//getBreadcrumb comment
func (c *CommonController) getBreadcrumbList() (breadCrumbList []models.BreadCrumb) {
	temp := c.GetSession("breadcrumbList")
	if temp != nil {
		breadCrumbList = c.GetSession("breadcrumbList").([]models.BreadCrumb)
	} else {
		c.ResetBreadcrumb()
	}
	return
}

//setBreadcrumbCondition comment
func (c *CommonController) setBreadcrumbCondition(key string, value interface{}) {
	c.SetSession("breadcrumbCondition_"+key, value)
}

//delBreadcrumbCondition comment
func (c *CommonController) delBreadcrumbCondition(key string) {
	c.DelSession("breadcrumbCondition_" + key)
}

//getBreadcrumbCondition comment
func (c *CommonController) getBreadcrumbCondition(key string) (breadcrumbCondition interface{}) {
	breadcrumbCondition = c.GetSession("breadcrumbCondition_" + key)
	return
}

func (c *CommonController) ExistsBreadcrumbCondition(key string) (existsFlg bool, breadcrumbCondition interface{}) {
	bcl := c.GetString("bcl")
	if bcl != "true" {
		c.delBreadcrumbCondition(key)
	} else {
		existsFlg = true
		breadcrumbCondition = c.getBreadcrumbCondition(key).(viewmodels.TemplateList)
	}
	return
}
