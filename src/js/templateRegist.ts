import { AjaxOptions } from './ajax-options';
import { CranberryCommon, CommonViewModel } from './cranberry-common';
const config = require('/conf/config.json');

import "../css/common.scss";
import "../css/templateRegist.scss";

/**
 * 個別ビュークラス
 *
 */
 class TemplateRegistViewModel extends CommonViewModel {
}

/**
 * 個別クラス
 *
 */
class TemplateRegist extends CranberryCommon {
    readonly model: TemplateRegistViewModel;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        super();
        this.model = new TemplateRegistViewModel();
    }

	/**
	 * バインドを実行する
	 *
	 * @returns 実行結果
	 */
    async bind(): Promise<any> {
        await super.bind();

        //キャンセルボタン
        $(this.model.CancelBtn.id()).on("click", (event) => {
            this.startLoading();
            location.href = config.routingURL.templateList;
        });
        //登録ボタン
        $(this.model.RegistBtn.id()).on("click", (event) => {
            let modalOptions = this.getUsualRegistModalOptions(
                this.messageFormat("C_001")
                , "DoRegist"
                , this.messageFormat("I_001")
                , returnData => config.routingURL.templateRegist + "?id=" + returnData.data.RoleId
                , config.routingURL.templateRegistDoRegist
            );

            this.startConfirmModal(modalOptions);
        });

        return true;
    }

    /**
	 * 初期化を実行する
	 *
	 * @returns 実行結果
	 */
    async init(): Promise<any> {

        await super.init();

        return true;
    }
}

$(function () {
    let templateRegist = new TemplateRegist();
});


