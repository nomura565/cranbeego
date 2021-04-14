package models

import (
	"github.com/astaxie/beego/orm"
	_ "time"
)

//CommonModel comment
type CommonModel struct {
	CreatedDate   string
	CreatedUserId int32
	UpdatedDate   string
	UpdatedUserId int32
	RowVersion int32
}

//DoExecute comment
func DoExecute(db orm.Ormer, txFunc func(orm.Ormer) (interface{}, error)) (data interface{}, err error) {
	err = db.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if p := recover(); p != nil {
			db.Rollback()
			panic(p)
		} else if err != nil {
			db.Rollback()
		} else {
			err = db.Commit()
		}
	}()
	data, err = txFunc(db)
	return
}
