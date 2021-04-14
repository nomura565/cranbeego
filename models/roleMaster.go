package models

import (
	"github.com/astaxie/beego/orm"
	"strings"
	"database/sql"
)

//RoleMaster comment
type RoleMaster struct {
	CommonModel
	RoleId int32 `orm:"pk"`
	RoleName string
	RoleDescription string
	Guid string
}

//GetRoleList comment
func GetRoleList(o orm.Ormer, roleName string) (roleMaster []RoleMaster, count int64, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  role_id ")
	sql.WriteString("  , role_name ")
	sql.WriteString("  , role_description ")
	sql.WriteString("  , created_date ")
	sql.WriteString("  , created_user_id ")
	sql.WriteString("  , updated_date ")
	sql.WriteString("  , updated_user_id ")
	sql.WriteString("  , row_version ")
	sql.WriteString("FROM ")
	sql.WriteString("  role_master ")
	if roleName != ""{
		sql.WriteString(" WHERE role_name LIKE ? ")
		count, err = o.Raw(sql.String(), "%" + roleName + "%").QueryRows(&roleMaster)
	}else{
		count, err = o.Raw(sql.String()).QueryRows(&roleMaster)
	}

	return
}

//DeleteRole comment
func DeleteRole(o orm.Ormer, roleId int32) (err error) {
	sql := &strings.Builder{}
	sql.WriteString("DELETE FROM role_master ")
	sql.WriteString("WHERE ")
	sql.WriteString("  role_id = ? ")
	_, err = o.Raw(sql.String(), roleId).Exec()

	return
}

//InsertRole comment
func InsertRole(o orm.Ormer, model RoleMaster) (count int64, err error) {
	sqls := &strings.Builder{}
	sqls.WriteString("INSERT ")
	sqls.WriteString("INTO role_master( ")
	sqls.WriteString("  role_name ")
	sqls.WriteString("  , role_description ")
	sqls.WriteString("  , guid ")
	sqls.WriteString("  , created_date ")
	sqls.WriteString("  , created_user_id ")
	sqls.WriteString("  , row_version ")
	sqls.WriteString(") ")
	sqls.WriteString("VALUES ( ")
	sqls.WriteString("  ? ")
	sqls.WriteString("  , ? ")
	sqls.WriteString("  , ? ")
	sqls.WriteString("  , ? ")
	sqls.WriteString("  , ? ")
	sqls.WriteString("  , 1 ")
	sqls.WriteString(") ")
	var result sql.Result
	result, err = o.Raw(sqls.String(),
		model.RoleName,
		model.RoleDescription,
		model.Guid,
		model.CreatedDate,
		model.CreatedUserId).Exec()
	if err == nil  {
		count, _ = result.RowsAffected()
	}
	return
}

//UpdateRole comment
func UpdateRole(o orm.Ormer, model RoleMaster) (count int64, err error) {
	sqls := &strings.Builder{}
	sqls.WriteString("UPDATE role_master ")
	sqls.WriteString("SET ")
	sqls.WriteString("  role_name = ? ")
	sqls.WriteString("  , role_description = ? ")
	sqls.WriteString("  , updated_date = ? ")
	sqls.WriteString("  , updated_user_id = ? ")
	sqls.WriteString("  , row_version = row_version + 1 ")
	sqls.WriteString("WHERE ")
	sqls.WriteString("  role_id = ? ")
	sqls.WriteString("  and row_version = ? ")
	var result sql.Result
	result, err = o.Raw(sqls.String(),
		model.RoleName,
		model.RoleDescription,
		model.UpdatedDate,
		model.UpdatedUserId,
		model.RoleId,
		model.RowVersion).Exec()
	if err == nil  {
		count, _ = result.RowsAffected()
	}
	return
}

//GetRole comment
func GetRole(o orm.Ormer, roleId int32) (roleMaster RoleMaster, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  role_id ")
	sql.WriteString("  , role_name ")
	sql.WriteString("  , role_description ")
	sql.WriteString("  , created_date ")
	sql.WriteString("  , created_user_id ")
	sql.WriteString("  , updated_date ")
	sql.WriteString("  , updated_user_id ")
	sql.WriteString("  , row_version ")
	sql.WriteString("FROM ")
	sql.WriteString("  role_master ")
	sql.WriteString("WHERE role_id = ? ")
	var temp []RoleMaster
	var count int64
	count, err = o.Raw(sql.String(), roleId).QueryRows(&temp)

	if err == nil && count != 0 {
		roleMaster = temp[0]
	}else{
		return
	}

	return
}

//GetRoleByGuid comment
func GetRoleByGuid(o orm.Ormer, guid string) (roleMaster RoleMaster, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  role_id ")
	sql.WriteString("  , role_name ")
	sql.WriteString("  , role_description ")
	sql.WriteString("  , created_date ")
	sql.WriteString("  , created_user_id ")
	sql.WriteString("  , updated_date ")
	sql.WriteString("  , updated_user_id ")
	sql.WriteString("  , row_version ")
	sql.WriteString("FROM ")
	sql.WriteString("  role_master ")
	sql.WriteString("WHERE guid = ? ")
	var temp []RoleMaster
	var count int64
	count, err = o.Raw(sql.String(), guid).QueryRows(&temp)

	if err == nil && count != 0 {
		roleMaster = temp[0]
	}else{
		return
	}

	return
}
