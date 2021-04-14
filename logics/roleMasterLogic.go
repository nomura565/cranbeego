package logics

import (
	"cranbeego/models"
	"github.com/astaxie/beego/orm"
	"github.com/google/uuid"
)

func RegistRoleMaster(model *models.RoleMaster) (ret bool, err error) {
	o := orm.NewOrm()
	var count int64
	if model.RoleId == 0 {
		var guid uuid.UUID
		guid, err = uuid.NewRandom()
		if err != nil {
			return false, err
		}
		model.Guid = guid.String()
		count, err = models.InsertRole(o, *model)
		if count == 0 || err != nil {
			return false, err
		}
		var latestRoleMaster models.RoleMaster
		latestRoleMaster, err = models.GetRoleByGuid(o, model.Guid)
		model.RoleId = latestRoleMaster.RoleId
	}else{
		count, err = models.UpdateRole(o, *model)
		if count == 0 || err != nil {
			return false, err
		}
	}
	ret = true
	return
}
