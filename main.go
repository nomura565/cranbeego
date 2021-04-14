package main

import (
	"cranbeego/controllers"
	"cranbeego/models"
	_ "cranbeego/routers"
	"fmt"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/mattn/go-sqlite3"
)

func init() {

	var connectionStrings string
	switch beego.AppConfig.String("dbkind") {
	case "sqlite3":
		orm.RegisterDriver(beego.AppConfig.String("dbkind"), orm.DRSqlite)
		connectionStrings = beego.AppConfig.String("connectionstrings")
	case "postgres":
		orm.RegisterDriver(beego.AppConfig.String("dbkind"), orm.DRPostgres)
		connectionStrings = fmt.Sprintf(beego.AppConfig.String("connectionstrings"),
			beego.AppConfig.String("server"),
			beego.AppConfig.String("database"),
			beego.AppConfig.String("userid"),
			beego.AppConfig.String("password"))
	}

	// set default database
	orm.RegisterDataBase(
		beego.AppConfig.String("dbname"),
		beego.AppConfig.String("dbkind"),
		connectionStrings)

	orm.RegisterModel(
		new(models.User),
		new(models.UserMaster),
		new(models.AuthMaster),
	)

	debug, _:= beego.AppConfig.Bool("database.debug");
	if (debug == true) {
		orm.Debug = true
	}

	beego.ErrorController(&controllers.ErrorController{})
	beego.SetStaticPath("/node_modules", "node_modules")
}

func main() {
	beego.Run()
}
