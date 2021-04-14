package models

import (
	"github.com/astaxie/beego/orm"
	"strings"
)

//AuthMaster comment
type AuthMaster struct {
	CommonModel
	AuthId int32 `orm:";pk"`
	UserId int32
	LoginCode string
	PasswordToken string
	EffectiveStartDate string
	ExpirationDate string
}

//SelectByLoginCode comment
func SelectByLoginCode(o orm.Ormer, loginCode string) (auth []AuthMaster, count int64, err error) {
	sql := &strings.Builder{}
	sql.WriteString("SELECT ")
	sql.WriteString("  a.auth_id ")
	sql.WriteString("  , a.user_id ")
	sql.WriteString("  , a.login_code ")
	sql.WriteString("  , a.password_token ")
	sql.WriteString("  , a.effective_start_date ")
	sql.WriteString("  , a.expiration_date ")
	sql.WriteString("  , a.created_date ")
	sql.WriteString("  , a.created_user_id ")
	sql.WriteString("  , a.updated_date ")
	sql.WriteString("  , a.updated_user_id ")
	sql.WriteString("  , a.row_version ")
	sql.WriteString("FROM ")
	sql.WriteString("  auth_master a ")
	sql.WriteString("  INNER JOIN user_master b ")
	sql.WriteString("    ON a.user_id = b.user_id ")
	sql.WriteString("   AND b.del_flag = 0 ")
	sql.WriteString("WHERE ")
	sql.WriteString("  a.login_code = ? ")
	count, err = o.Raw(sql.String(), loginCode).QueryRows(&auth)

	if err != nil {
		return auth, count, err
	}
	return
}