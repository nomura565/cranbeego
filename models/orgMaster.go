package models

import (

)

//OrgMaster comment
type OrgMaster struct {
	CommonModel
	OrgId int32 `orm:";pk"`
	Organization string
}
