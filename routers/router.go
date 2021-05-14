package routers

import (
	"cranbeego/controllers"
	"cranbeego/models"

	"github.com/astaxie/beego"
)

func init() {
	config, _ := models.NewConfig()
	beego.Router("/", &controllers.LoginController{})
	beego.Router(config.RoutingURL["login"], &controllers.LoginController{})
	beego.Router(config.RoutingURL["loginDoLogin"], &controllers.LoginController{}, "post:DoLogin")
	beego.Router(config.RoutingURL["loginDoLogout"], &controllers.LoginController{}, "get:DoLogout")

	beego.Router(config.RoutingURL["top"], &controllers.TopController{})

	beego.Router(config.RoutingURL["templateList"], &controllers.TemplateListController{})
	beego.Router(config.RoutingURL["templateListGetRoleMaster"], &controllers.TemplateListController{}, "post:GetRoleMaster")
	beego.Router(config.RoutingURL["templateListDoDelete"], &controllers.TemplateListController{}, "post:DoDelete")
	beego.Router(config.RoutingURL["templateRegist"], &controllers.TemplateRegistController{})
	beego.Router(config.RoutingURL["templateRegistDoRegist"], &controllers.TemplateRegistController{}, "post:DoRegist")
}
