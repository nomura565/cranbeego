/**
 * モーダルオプションクラス
 *
 */
export class ModalOptions {
    onShow;
    onVisible;
    onHide;
    onHidden;
    onDeny;
    onApprove;
    message: string;
    closable: boolean;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        this.onShow = () => { };
        this.onVisible = () => { };
        this.onHide = () => { };
        this.onHidden = () => { };
        this.onDeny = () => { };
        this.onApprove = () => { };
        this.message = "";
        this.closable = false;

    }
}