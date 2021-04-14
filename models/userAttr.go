package models

import (

)

//UserAttr comment
type UserAttr struct {
	CommonModel
	UserAttrId int32
	Enabled int32
	OrgId int32
	EmployeeCode string
	HireDate string
	PhotoImage string
	TelNumber1 string
	TelNumber2 string
	Address1 string
	Address2 string
	MailAddress1 string
	MailAddress2 string
}
