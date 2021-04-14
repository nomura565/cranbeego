package viewmodels

import (
	"github.com/beego/beego/v2/core/validation"
	"cranbeego/models"
)

//TemplateRegist comment
type TemplateRegist struct {
	CommonViewModel
	RoleId int32 `json:"RoleId,string"`
	RoleName string
	RoleDescription string
}

func (u *TemplateRegist) Valid() (valid validation.Validation) {
	messages, _ := models.NewMessages()
	valid = validation.Validation{}
	switch u.ValidationMode {
	case "DoRegist":
		valid.Required(u.RoleName, "RoleName").Message(messages.E_000, "ロール名")
		valid.MaxSize(u.RoleName, 100, "RoleName").Message(messages.E_013, "ロール名", "100")
		valid.Required(u.RoleDescription, "RoleDescription").Message(messages.E_000, "ロール説明")
		valid.MaxSize(u.RoleDescription, 100, "RoleDescription").Message(messages.E_013, "ロール説明", "100")
	}
	return
}
