package logics

import (
	"github.com/astaxie/beego"
	"cranbeego/models"
	"cranbeego/viewmodels"
	"cranbeego/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

func Authenticate(viewModel viewmodels.Login) (userId int32, err error) {
	o := orm.NewOrm()
	auth, count, err := models.SelectByLoginCode(o, viewModel.LoginCode)

	if err != nil || count == 0 {
		return
	}

	resultVerify := utils.VerifyPassword(auth[0].PasswordToken, viewModel.Password)

	if !resultVerify {
		return
	}
	// アカウントの有効期間をチェックする。
	resultActive := IsActive(auth[0])
	if !resultActive {
		return
	}

	return auth[0].UserId, err
}

func IsActive(auth models.AuthMaster) (ret bool) {
	layout := beego.AppConfig.String("dayformat")
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)

	effectiveStartDate, err := time.Parse(layout, auth.EffectiveStartDate)

	if err != nil {
		effectiveStartDate = time.Date(1, 1, 1, 0, 0, 0, 0, time.Local)
	}

	expirationDate, err := time.Parse(layout, auth.ExpirationDate)

	if err != nil {
		expirationDate = time.Date(9999, 12, 31, 23, 59, 59, 59, time.Local)
	}

	if(today.Sub(effectiveStartDate) <= 0){
		return false
	}
	if(today.Sub(expirationDate) > 0){
		return false
	}
	return true
}
