package utils

import (
	"runtime"

	"github.com/astaxie/beego"
	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

type NLogger struct {
	logger *logrus.Logger
}

func NewLogger() (NL NLogger) {
	NL.logger = logrus.New()
	//logger.Out = os.Stdout
	//ファイル取得
	//ファイルは無ければ生成(os.O_CREATE)、書き込み(os.O_WRONLY)、追記モード(os.O_APPEND)、権限は0666
	//file, err := os.OpenFile(beego.AppConfig.String("logFile"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	//if err == nil {
	//	NL.logger.Out = file
	//}

	NL.logger.SetOutput(&lumberjack.Logger{
		Filename:   beego.AppConfig.String("logFile"), // ファイル名
		MaxSize:    500,                               // ローテーションするファイルサイズ(megabytes)
		MaxBackups: 3,                                 // 保持する古いログの最大ファイル数
		MaxAge:     365,                               // 古いログを保持する日数
		LocalTime:  true,                              // バックアップファイルの時刻フォーマットをサーバローカル時間指定
		Compress:   false,                             // ローテーションされたファイルのgzip圧縮
	})

	level := logrus.InfoLevel
	logLevel, err := beego.AppConfig.Int("logLevel")

	if err != nil {
		switch logLevel {
		case 0:
			level = logrus.PanicLevel
		case 1:
			level = logrus.FatalLevel
		case 2:
			level = logrus.ErrorLevel
		case 3:
			level = logrus.WarnLevel
		case 4:
			level = logrus.InfoLevel
		case 5:
			level = logrus.DebugLevel
		case 6:
			level = logrus.TraceLevel
		}
	}

	NL.logger.SetLevel(level)

	return
}

func (NL NLogger) Trace(args ...interface{}) {
	NL.commonFields().Trace(args...)
}

func (NL NLogger) Debug(args ...interface{}) {
	NL.commonFields().Debug(args...)
}

func (NL NLogger) Info(args ...interface{}) {
	NL.commonFields().Info(args...)
}
func (NL NLogger) Warn(args ...interface{}) {
	NL.commonFields().Warn(args...)
}

func (NL NLogger) Error(args ...interface{}) {
	NL.commonFields().Error(args...)
}

func (NL NLogger) Fatal(args ...interface{}) {
	NL.commonFields().Fatal(args...)
}

func (NL NLogger) Panic(args ...interface{}) {
	NL.commonFields().Panic(args...)
}

func (NL NLogger) Start() {
	NL.commonFields().Info("START")
}

func (NL NLogger) End() {
	NL.commonFields().Info("END")
}

func (NL NLogger) commonFields() *logrus.Entry {
	pc, _, line, _ := runtime.Caller(2)
	f := runtime.FuncForPC(pc)
	return NL.logger.WithFields(logrus.Fields{"call": f.Name(), "line": line})
}
