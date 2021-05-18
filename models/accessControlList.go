package models

import (
	"strings"

	"github.com/astaxie/beego/orm"
)

//AuthMaster comment
type AccessControlList struct {
	CommonModel
	AclId    int32 `orm:";pk"`
	TargetId int32
	RoleId   int32
	Access   string
	Guid     string
}

//IsAllowAccessControl comment
func IsAllowAccessControl(o orm.Ormer, controller string, action string, role []int32) (ret bool, err error) {
	ret = true
	var count int64
	var target []TargetMaster
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  * ")
	sql.WriteString("FROM ")
	sql.WriteString("  target_master ")
	sql.WriteString("WHERE ")
	sql.WriteString("  (target_name = ? OR target_name = ?) ")
	count, err = o.Raw(sql.String(), controller, controller+"/"+action).QueryRows(&target)

	if err != nil {
		return ret, err
	}

	if count > 0 {
		ret = false
	} else {
		ret = true
	}

	if ret == false {
		var count2 int64
		in := []string{}
		for i := 0; i < len(role); i++ {
			in = append(in, "?")
		}
		sql = &strings.Builder{}
		sql.WriteString("SELECT ")
		sql.WriteString("  A.acl_id ")
		sql.WriteString("FROM access_control_list A ")
		sql.WriteString("  INNER JOIN target_master B ")
		sql.WriteString("  ON A.target_id = B.target_id ")
		sql.WriteString("WHERE ")
		sql.WriteString("  A.ROLE_ID IN (" + strings.Join(in, ",") + ") ")
		sql.WriteString("  AND (B.target_name = ? OR B.target_name = ?) ")
		count2, err = o.Raw(sql.String(), role, controller, controller+"/"+action).QueryRows(&target)

		if count2 > 0 {
			ret = true
		} else {
			ret = false
		}
	}

	return
}
