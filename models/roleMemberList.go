package models

import (

)

//UserMaster comment
type RoleMemberList struct {
	CommonModel
	RoleMemberId int32
	RoleId int32
	UserId int32
}
