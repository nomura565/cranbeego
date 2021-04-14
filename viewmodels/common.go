package viewmodels

import (

)

//User comment
type CommonViewModel struct {
	ValidationMode   string
	RowVersion int32  `json:"RowVersion,string"`
}
