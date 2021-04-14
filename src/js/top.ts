import { AjaxOptions } from './ajax-options';
import { CranberryCommon, CommonViewModel } from './cranberry-common';

const config = require('/conf/config.json');

/**
 * 個別ビュークラス
 *
 */
class TopViewModel extends CommonViewModel {
}

/**
 * 個別クラス
 *
 */
class Top extends CranberryCommon {
    readonly model: TopViewModel;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        super();
        this.model = new TopViewModel();
    }

	/**
	 * バインドを実行する
	 *
	 * @returns 実行結果
	 */
    async bind(): Promise<any> {
        await super.bind();

        $('.ui.rating').rating();

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
    let top = new Top();
});

