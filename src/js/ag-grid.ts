//import agGrid from "../Content/Ag-grid/ag-grid-community.min.noStyle";

import { Grid, GridOptions } from 'ag-grid-community';
import { 
    CheckBoxHeaderComponent,
    ButtonRenderer,
    InputRenderer,
    SelectRenderer,
    SpanRenderer } from './components';
import FileSaver from './FileSaver';
import { utils, writeFile } from 'xlsx';

const config = require('/conf/config.json');

/**
 * ag-gridクラス
 *
 */
export class AgGrid {
    private readonly gridId: string;
    private columnDefs: Array<any>;
    private rowData: Array<any>;
    private gridOptions: GridOptions;
    private extraGridOptions: object | undefined;
    private eGridDiv: HTMLElement | null;
    private grid: Grid | undefined;

	/**
	 * コンストラクタ
	 *
	 * @param pGridId グリッドID
	 * @param pResources リソース
	 */
    constructor(pGridId: string) {
        this.gridId = pGridId || 'myGrid';
        pGridId = this.gridId;
        this.gridId = '#' + this.gridId;

        this.columnDefs = [];
        this.rowData = [];
        this.gridOptions = {};
        this.eGridDiv = null;
	}

    /**
	 * 初期化を実行する
	 *
	 * @returns 実行結果
	 */
    init(): boolean {
        this.setDefaultGridOptions();
        // グリッドを作成する要素を格納する
        this.eGridDiv = document.querySelector(this.gridId);
        // グリッドを作成する
        this.grid = new Grid(this.eGridDiv, this.gridOptions);
        return true;
	}

	/**
	 * 列定義をセットする
	 *
	 * @param pColumnDefs 列定義
	 */
    setColumnDefs(pColumnDefs: Array<any>): void {
        this.columnDefs = pColumnDefs;
	}

	/**
	 * 行データをセットする
	 *
	 * @param pRowData 行データ
	 */
    setRowData(pRowData: Array<any>): void {
        this.rowData = pRowData;
        if (this.gridOptions) {
            this.gridOptions.api.setRowData(this.rowData);
        }
        this.moveScrollTop();
	}

	/**
	 * グリッドオプションを取得する
	 *
	 * @returns グリッドオプション
	 */
    getGridOptions(): GridOptions {
        return this.gridOptions;
	}

	/**
	 * グリッドオブジェクトを取得する
	 *
	 * @returns グリッドオブジェクト
	 */
    getGrid(): Grid | undefined {
        return this.grid;
	}

	/**
	 * 拡張グリッドオプションをセットする
	 *
	 * @param pGridOptions 拡張グリッドオプション
	 */
    setExtraGridOptions(pGridOptions: object): void {
        this.extraGridOptions = pGridOptions;
	}

	/**
	 * スクロール位置をセットする
	 *
	 */
    setScrollTop(): void {
        var scrollTop: number = $(this.gridId).find(".ag-body-viewport").scrollTop();
        sessionStorage.setItem(this.gridId, scrollTop.toString());
	}

	/**
	 * スクロール位置をリセットする
	 *
	 */
    resetScrollTop(): void {
        sessionStorage.setItem(this.gridId, "0");
	}

	/**
	 * スクロール位置に移動する
	 *
	 */
    moveScrollTop(): void {
        var scrollTop: string | null = sessionStorage.getItem(this.gridId);
        $(this.gridId).find(".ag-body-viewport").scrollTop(parseInt(scrollTop));
	}

	/**
	 * 初期グリッドオプションをセットする
	 *
	 */
    private setDefaultGridOptions(): void {
        // グリッドに適用する列定義、行データを指定
        let defaultGridOptions: GridOptions = {
            columnDefs: this.columnDefs,
            //rowData: this.rowData,
            singleClickEdit: true,
            groupSelectsChildren: false,
            suppressRowClickSelection: true,
            rowSelection: "multiple",
            //列幅リサイズ
            defaultColDef: {
                resizable: true,
                sortable: true,
                filter: true,
            },
            //列移動不可
            suppressMovableColumns: true,
            components: {
                ButtonRenderer: ButtonRenderer,
                SelectRenderer: SelectRenderer,
                SpanRenderer: SpanRenderer,
                InputRenderer: InputRenderer
            },
            rowClassRules: {
                'field-validation-error': function (params) { return params.node.hasError; },
                'alert-danger': function (params) { return params.node.hasError; },
            },
            localeText: {
                filterOoo: config.agGrid_filterOoo,
                equals: config.agGrid_equals,
                notEqual: config.agGrid_notEqual,
                lessThan: config.agGrid_lessThan,
                greaterThan: config.agGrid_greaterThan,
                inRange: config.agGrid_inRange,
                lessThanOrEqual: config.agGrid_lessThanOrEqual,
                greaterThanOrEqual: config.agGrid_greaterThanOrEqual,
                contains: config.agGrid_contains,
                notContains: config.agGrid_notContains,
                startsWith: config.agGrid_startsWith,
                endsWith: config.agGrid_endsWith,
                noRowsToShow: config.agGrid_noRowsToShow
            }
        };

        $.extend(defaultGridOptions, this.extraGridOptions);
        this.gridOptions = defaultGridOptions;
	}

	/**
	 * 行エラーフラグをリセットする
	 *
	 */
    resetRowErrorFlg(): void {
        this.gridOptions.api.forEachNode((node) => {
            //node.hasError = false;
        });
	}

	/**
	 * 行データをcsvでエクスポートする
	 *
	 */
    exportDataAsCsv(): void {
        let params = {
            fileName: "エクスポート.csv" // CSVファイル名を設定する
        };
        this.gridOptions.api.exportDataAsCsv(params);
	}

	/**
	 * check列定義を取得する
	 *
	 * @returns check列定義
	 */
    getCheckColumnDef(): object {
        return {
            headerName: "選択"
            , field: "Check"
            , filter: false
            , checkboxSelection: true
            , pinned: "left"
            , width: 40
            , headerComponent: CheckBoxHeaderComponent
        };
	}

	/**
	 * 行データをexcelでエクスポートする
	 *
	 * @param addTitleFlg 列名付与フラグ
	 */
    exportDataAsExcel(addTitleFlg: boolean = true): void {
        var dataRows: Array<any> = [];
        var titleCols: Array<any> = [];
        var titleNameCols: Array<any> = [];
        var fileName: string = "エクスポート.xlsx";
        var sheetName: string = "sheet1";

        // タイトル行追加
        this.columnDefs.forEach(function (columnDef) {
            titleCols.push(columnDef.headerName);
            titleNameCols.push(columnDef.field);
        });

        if (addTitleFlg) {
            dataRows.push(titleCols);
        }

        this.gridOptions.api.forEachNode(function (node) {
            var dataRow: Array<any> = [];
            for (var name in titleNameCols) {
                dataRow.push(node.data[titleNameCols[name]]);
            }
            dataRows.push(dataRow);
        });

        // Excel出力
        var wb = utils.book_new();
        var ws = utils.aoa_to_sheet(dataRows);
        utils.book_append_sheet(wb, ws, sheetName);
        var wopts: object = {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
        };
        var wbout: Function = writeFile(wb, fileName, wopts);

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        var blob = new Blob(
            [s2ab(wbout)],
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
        FileSaver.saveAs(blob, fileName);
    }

	/**
	 * 選択行を取得する
	 *
	 * @returns 選択行
	 */
    getCheckedRows(): Array<any> {
        let rows: Array<any> = [];
        this.gridOptions.api.forEachNode(function (node) {
            if (node.isSelected()) {
                rows.push(node.data);
            }
        });
        return rows;
    }

	/**
	 * 行を追加する
	 *
	 * @param rowData 行
	 */
    addRows(rowData: Array<any>): void {
        this.gridOptions.api.updateRowData({ add: rowData });
        $.merge(this.rowData, rowData);
    }
}