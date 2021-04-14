package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"github.com/astaxie/beego"
	"time"
	"fmt"
)

func HashPassword(rowPassword string) (hash string) {
	result := sha256.Sum256([]byte(rowPassword))
	hash = strings.ToUpper(hex.EncodeToString(result[:]))
	return
}

func VerifyPassword(hashedPassword string, rowPassword string) (ret bool) {
	hash := HashPassword(rowPassword)
	ret = hash == hashedPassword
	return
}

func GetNow() (now string) {
	layout := beego.AppConfig.String("dateformat")
	t := time.Now()
	now = t.Format(layout)
	fmt.Println(t)
	return
}
