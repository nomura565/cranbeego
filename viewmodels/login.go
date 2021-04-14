package viewmodels

import (
	"github.com/beego/beego/v2/core/validation"
	"cranbeego/models"
)

//Login comment
type Login struct {
	CommonViewModel
	LoginCode   string
	Password string
	NextUseLoginCode bool
}

func (u *Login) Valid() (valid validation.Validation) {
	messages, _ := models.NewMessages()
	valid = validation.Validation{}
	switch u.ValidationMode {
	case "DoLogin":
		valid.Required(u.LoginCode, "LoginCode").Message(messages.E_000, "ログインコード")
		valid.Required(u.LoginCode, "Password").Message(messages.E_000, "パスワード")
	}
	return
}
