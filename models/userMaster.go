package models

import (

)

//UserMaster comment
type UserMaster struct {
	CommonModel
	UserId int32 `orm:"pk"`
	UserName string
	DelFlag int64
	Guid string
}
