package models

//TargetMaster comment
type TargetMaster struct {
	CommonModel
	TargetId   int32 `orm:";pk"`
	TargetName string
}
