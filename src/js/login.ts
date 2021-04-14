import { AjaxOptions } from './ajax-options';
import { CranberryCommon, CommonViewModel } from './cranberry-common';

const config = require('/conf/config.json');

/**
 * 個別ビュークラス
 *
 */
 class LoginViewModel extends CommonViewModel {
    NextUseLoginCode: string = "NextUseLoginCode";
    Password: string      = "Password";
    LoginCode: string     = "LoginCode";
}

/**
 * 個別クラス
 *
 */
class Login extends CranberryCommon {
    readonly model: LoginViewModel;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        super();
        this.model = new LoginViewModel();

    }

	/**
	 * バインドを実行する
	 *
	 * @returns 実行結果
	 */
    async bind(): Promise<any> {
        await super.bind();

        $(this.model.LoginBtn.id()).on("click", (event) => {
            //userIdをクッキーに保存
            if ($(this.model.NextUseLoginCode.id()).prop("checked")) {
                let userId = $(this.model.LoginCode.id()).val();
                let date = new Date();
                //クッキーの保存期間を一週間に設定
                date.setDate(date.getDate() + 7);

                document.cookie = this.model.NextUseLoginCode + "=" + encodeURIComponent(userId.toString()) + "; expires=" + date.toUTCString();
            } else {
                document.cookie = this.model.NextUseLoginCode + "=; max-age=0";
            }

            let options = new AjaxOptions();
            options.validationMode = "DoLogin";
            //ログイン処理がOKならTOPに移動
            options.done = (returnData) => {
                this.startLoading();
                location.href = config.routingURL.top;
            };

            this.submit(config.routingURL.doLogin, options);
            return false;
        });
        //パスワードでエンター押下時ログインボタン押下とする
        $(this.model.Password.id()).on("keypress", (event) => {
            if (event.keyCode == 13) {
                $(this.model.LoginBtn.id()).trigger("click");
            }
        });

        return true;
	}

    /**
	 * 初期化を実行する
	 *
	 * @returns 実行結果
	 */
    async init(): Promise<any> {
        var self = this;
        await super.init();

        var cookie: string[] = document.cookie.split(';');
        var exist: boolean = false;
        cookie.forEach(function (value) {
            //cookie名と値に分ける
            var content: string[] = value.split('=');
            //クッキーが保存されていればUserIdを復元
            if (content[0].trim() == self.model.NextUseLoginCode) {
                $(self.model.LoginCode.id()).val(content[1]);
                exist = true;
            }
        })
        //クッキーが保存されていれば初期フォーカス位置を変える
        if (exist) {
            $(this.model.NextUseLoginCode.id()).prop("checked", true);
            $(this.model.Password.id()).focus();
        } else {
            $(this.model.LoginCode.id()).focus();
        }

        return true;
    }
}

$(function () {
    let login = new Login();
});