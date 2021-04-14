package viewmodels

import (
	"github.com/beego/beego/v2/core/validation"
	"cranbeego/models"
)

//templateList comment
type TemplateList struct {
	CommonViewModel
	RoleName   string
	RoleMasterGrid []models.RoleMaster
}

func (u *TemplateList) Valid() (valid validation.Validation) {
	messages, _ := models.NewMessages()
	valid = validation.Validation{}
	switch u.ValidationMode {
	case "DoSearch":
	case "DoDelete":
		if len(u.RoleMasterGrid) == 0 {
			valid.SetError("RoleMasterGrid", messages.E_006)
		}
	}
	return
}
