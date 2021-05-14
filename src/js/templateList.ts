import { AjaxOptions } from './ajax-options';
import { AgGrid } from './ag-grid';
import { CranberryCommon, CommonViewModel } from './cranberry-common';
import { ButtonRenderer } from './components';
const config = require('/conf/config.json');

import "../css/common.scss";
import "../css/templateList.scss";

/**
 * 個別ビュークラス
 *
 */
class TemplateListViewModel extends CommonViewModel {
    RoleMasterGrid: string = "RoleMasterGrid";
}

/**
 * 個別クラス
 *
 */
class TemplateList extends CranberryCommon {
    readonly model: TemplateListViewModel;
    readonly gridId: string;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        super();
        this.model = new TemplateListViewModel();
        this.gridId = this.model.RoleMasterGrid;
    }

	/**
	 * バインドを実行する
	 *
	 * @returns 実行結果
	 */
    async bind(): Promise<any> {

        await super.bind();

        //検索ボタン
        $(this.model.SearchBtn.id()).on("click", (event) => {
            //スクロール位置をリセットする
            this.grid[this.gridId].resetScrollTop();
            this.GetRoleMaster();
            return false;
        });
        //新規登録ボタン
        $(this.model.NewRegistBtn.id()).on("click", (event) => {
            this.startLoading();
            //現在のスクロール位置をセットする
            this.grid[this.gridId].setScrollTop();
            //登録画面へ遷移
            location.href = config.routingURL.templateRegist;
            return false;
        });
        //削除ボタン
        $(this.model.DeleteBtn.id()).on("click", (event) => {
            let modalOptions = this.getUsualRegistModalOptions(
                this.messageFormat("C_000")
                , "DoDelete"
                , this.messageFormat("I_000")
                , returnData => config.routingURL.templateList
                , config.routingURL.templateListDoDelete
            );

            this.startConfirmModal(modalOptions);
            return false;
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

        this.grid[this.gridId] = new AgGrid(this.gridId);
        var grid = this.grid[this.gridId];
        //列定義を設定する
        var columnDefs = [
            grid.getCheckColumnDef(),
            {
                headerName: "編集"
                , field: "Edit"
                , width: 85
                , pinned: "left"
                //ボタンコンポーネントを設定する
                , cellRenderer: ButtonRenderer
                , cellRendererParams: { buttonValue: "編集" }
                , onButtonClicked: (params) => {
                    this.startLoading();
                    //現在のスクロール位置をセットする
                    grid.setScrollTop();
                    location.href = config.routingURL.templateRegist + "?id=" + params.data.RoleId;
                }
            },
            { headerName: "ロールID", field: "RoleId", width: 100 },
            { headerName: "ロール名", field: "RoleName" },
            { headerName: "ロール説明", field: "RoleDescription", width: 250 }
        ];

        grid.setColumnDefs(columnDefs);
        grid.init();
        await this.GetRoleMaster();
        return true;
	}

    /**
	 * ロールマスタを取得する
	 *
	 * @returns プロミス
	 */
    async GetRoleMaster(): Promise<any> {
        return this.submitSetGrid("DoSearch", this.gridId, config.routingURL.templateListGetRoleMaster);
    }
}

$(function () {
    let templateList = new TemplateList();
});

