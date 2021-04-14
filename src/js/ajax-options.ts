const config = require('/conf/config.json');
/**
 * ajaxオプションクラス
 *
 */
export class AjaxOptions {
    done: Function;
    fail: Function;
    always: Function;
    type: string;
    contentType: string;
    validationMode: string;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        this.done = (returnData) => { };
        this.fail = (returnData) => {
            alert(returnData.statusText + ":" + returnData.responseJSON[config.requestParameter.data]);
        };
        this.always = (returnData) => { };
        this.type = "POST";
        this.contentType = "application/json";
        this.validationMode = "";
    }
}