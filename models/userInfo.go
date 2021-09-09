package models

import (
	"strings"

	"github.com/astaxie/beego/orm"
)

//UserInfo comment
type UserInfo struct {
	CommonModel
	UserMaster
	UserAttr
	OrgMaster
	RoleMemberList []RoleMemberList
	RoleName       string
}

func GetDefaultUser() (userInfo UserInfo, err error) {
	userInfo.UserId = 1
	userInfo.UserName = "DefaultUser"
	return
}

//GetUserInfo comment
func GetUserInfo(o orm.Ormer, userId int32) (userInfo UserInfo, err error) {
	//err = o.QueryTable(new(UserMaster)).Filter("UserId", id).One(&user)
	userInfo, err = SelectById(o, userId)
	if err != nil {
		return
	}
	userInfo.RoleMemberList, _, err = SelectByUserId(o, userId)

	//GetNotAllowTargetListの実行 @todo
	return
}

//SelectById comment
func SelectById(o orm.Ormer, userId int32) (userInfo UserInfo, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  a.user_id ")
	sql.WriteString("  , a.user_name ")
	sql.WriteString("  , a.del_flag ")
	sql.WriteString("  , a.created_date ")
	sql.WriteString("  , a.created_user_id ")
	sql.WriteString("  , a.updated_date ")
	sql.WriteString("  , a.updated_user_id ")
	sql.WriteString("  , a.row_version ")
	sql.WriteString("  , b.auth_id ")
	sql.WriteString("  , b.login_code ")
	sql.WriteString("  , b.password_token ")
	sql.WriteString("  , b.effective_start_date ")
	sql.WriteString("  , b.expiration_date ")
	sql.WriteString("  , b.row_version as auth_row_version ")
	sql.WriteString("  , c.user_attr_id ")
	sql.WriteString("  , c.enabled ")
	sql.WriteString("  , c.org_id ")
	sql.WriteString("  , c.employee_code ")
	sql.WriteString("  , c.hire_date ")
	sql.WriteString("  , c.retirement_date ")
	sql.WriteString("  , c.photo_image ")
	sql.WriteString("  , c.tel_number1 ")
	sql.WriteString("  , c.tel_number2 ")
	sql.WriteString("  , c.address1 ")
	sql.WriteString("  , c.address2 ")
	sql.WriteString("  , c.mail_address1 ")
	sql.WriteString("  , c.mail_address2 ")
	sql.WriteString("  , c.row_version as attr_row_version ")
	sql.WriteString("  , e.organization ")
	sql.WriteString("FROM ")
	sql.WriteString("  user_master a ")
	sql.WriteString("  INNER JOIN auth_master b ")
	sql.WriteString("    ON a.user_id = b.user_id ")
	sql.WriteString("  INNER JOIN user_attr c ")
	sql.WriteString("    ON a.user_id = c.user_id ")
	sql.WriteString("  INNER JOIN org_master e ")
	sql.WriteString("    ON c.org_id = e.org_id ")
	sql.WriteString("WHERE ")
	sql.WriteString("  a.user_id = ? ")
	var temp []UserInfo
	var count int64
	count, err = o.Raw(sql.String(), userId).QueryRows(&temp)

	if err == nil && count != 0 {
		userInfo = temp[0]
	} else {
		return
	}

	sql = &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  bb.role_name ")
	sql.WriteString("FROM ")
	sql.WriteString("  role_member_list aa ")
	sql.WriteString("  INNER JOIN role_master bb ")
	sql.WriteString("    ON aa.role_id = bb.role_id ")
	sql.WriteString("WHERE ")
	sql.WriteString("  aa.user_id = ? ")
	var temp2 []RoleMaster
	count, err = o.Raw(sql.String(), userId).QueryRows(&temp2)

	if err == nil && count != 0 {
		var roleNames []string
		for _, s := range temp2 {
			roleNames = append(roleNames, s.RoleName)
		}

		userInfo.RoleName = strings.Join(roleNames, ",")
	}
	return
}

//SelectByUserId comment
func SelectByUserId(o orm.Ormer, userId int32) (roleMemberList []RoleMemberList, count int64, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  role_member_id ")
	sql.WriteString("  , role_id ")
	sql.WriteString("  , user_id ")
	sql.WriteString("  , created_date ")
	sql.WriteString("  , created_user_id ")
	sql.WriteString("  , updated_date ")
	sql.WriteString("  , updated_user_id ")
	sql.WriteString("  , row_version ")
	sql.WriteString("FROM ")
	sql.WriteString("  role_member_list ")
	sql.WriteString("WHERE ")
	sql.WriteString("  user_id = ? ")
	sql.WriteString("ORDER BY ")
	sql.WriteString("  role_id ")
	count, err = o.Raw(sql.String(), userId).QueryRows(&roleMemberList)

	return
}
