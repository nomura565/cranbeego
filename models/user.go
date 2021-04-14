package models

import (
	"github.com/astaxie/beego/orm"
)

//User comment
type User struct {
	Id   int64  `orm:"auto"`
	Name string `form:"name"`
}

// func (m *User) init() {
// 	orm.RegisterModel(new(User))
// }

//GetAllUser comment
func GetAllUser(o orm.Ormer) (users []User, err error) {
	_, err = o.QueryTable(new(User)).All(&users, "Id", "Name")
	if err == nil {
		return users, err
	}
	return nil, err
}

//AddUser comment
func AddUser(o orm.Ormer, user *User) (id int64, err error) {
	id, err = o.Insert(user)
	return
}

//DeleteUser comment
func DeleteUser(o orm.Ormer, id int64) (num int64, err error) {
	v := User{Id: id}
	if err = o.Read(&v); err == nil {
		num, err = o.Delete(&User{Id: id})
	}

	return
}

//UpdateUser comment
func UpdateUser(o orm.Ormer, user *User) (num int64, err error) {
	v := User{Id: user.Id}
	if err = o.Read(&v); err == nil {
		num, err = o.Update(user)
	}
	return
}
