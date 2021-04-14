
import { AgGrid } from './ag-grid';
import { AjaxOptions } from './ajax-options';
import { ModalOptions } from './modal-options';
import flatpickr from 'flatpickr';

const config = require('/conf/config.json');
const messages = require('/conf/messages.json');

/**
 * 拡張メソッドの定義
 *
 */
declare global {
    interface String {
        id(): string;
    }
}

String.prototype.id = function() {
    return "#" + this;
};

/**
 * 共通ビューモデルクラス
 *
 */
export class CommonViewModel {
    ValidationMode: string = "ValidationMode";
    LoginBtn: string       = "LoginBtn";
    LogoutBtn: string      = "LogoutBtn";
    SearchBtn: string      = "SearchBtn";
    DeleteBtn: string      = "DeleteBtn";
    RegistBtn: string      = "RegistBtn";
    NewRegistBtn: string   = "NewRegistBtn";
    EditBtn: string        = "EditBtn";
    CSVOutputBtn: string   = "CSVOutputBtn";
    EXCELOutputBtn: string = "EXCELOutputBtn";
    OutputBtn: string      = "OutputBtn";
    CancelBtn: string      = "CancelBtn";
    ApprovalBtn: string    = "ApprovalBtn";
    AddBtn: string         = "AddBtn";
    Language: string       = "Language";
    SearchLanguage: string = "SearchLanguage";
    ModelErrors: string    = "ModelErrors";
    TmpSelect: string      = "TmpSelect";
}

/**
 * 共通クラス
 *
 */
export class CranberryCommon {
    grid: { [key: string]: AgGrid; };
    isFormChange: boolean;
    fileDataList: { [key: string]: any; };
    modelErrors: { [key: string]: string; };
    tmpKeys: { [key: string]: any; };
    isModalShow: boolean;
    readonly model: CommonViewModel;

	/**
	 * コンストラクタ
	 *
	 */
    constructor() {
        this.grid = {};
        this.isFormChange = false;
        this.fileDataList = {};
        this.modelErrors = {};
        this.tmpKeys = {};
        this.isModalShow = false;
        this.model = new CommonViewModel();

        this.load();
    }
	/**
	 * ロード
	 *
	 * @returns boolean
	 */
    async load(): Promise<any> {
        await this.bind();
        await this.init();

        this.stopLoading();

        return true;
    }

	/**
	 * undefinedかを判定する
	 *
	 * @param object 判定オブジェクト
	 * @returns チェック結果
	 */
    isUndefined(object: any): boolean {
        if (object == null) {
            return true;
        }
        if (typeof object === "undefined") {
            return true;
        }
        return false;
	}

	/**
	 * NullOrWhiteSpaceかを判定する
	 *
	 * @param object 判定オブジェクト
	 * @returns チェック結果
	 */
    isNullOrWhiteSpace(object: any): boolean {
        if (this.isUndefined(object)) {
            return true;
        }
        if (typeof object === "string") {
            let tmp = object.toString().trim();
            if (tmp == "") {
                return true;
            }
        }
        return false;
    }

	/**
	 * 日付判定
	 *
	 * @param checkValue チェック値
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    isDate(checkValue: string, requireFlg: boolean = true): boolean {
        if (!requireFlg && this.isNullOrWhiteSpace(checkValue)) {
            return true;
        }
        var ret:number = Date.parse(checkValue);
        if (!isNaN(ret)) {
            return true;
        }

        return false;
    }

	/**
	 * 電話番号判定
	 *
	 * @param checkValue チェック値
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    isPhoneNumber(checkValue: string, requireFlg: boolean = true): boolean {
        if (!requireFlg && this.isNullOrWhiteSpace(checkValue)) {
            return true;
        }
        var pattern: RegExp = /^0\d{1,4}-\d{1,4}-\d{4}$/;
        var ret: RegExpMatchArray = checkValue.match(pattern);

        return (ret != null);
    }

	/**
	 * メールアドレス判定
	 *
	 * @param checkValue チェック値
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    isMailAddress(checkValue: string, requireFlg: boolean = true): boolean {
        if (!requireFlg && this.isNullOrWhiteSpace(checkValue)) {
            return true;
        }
        var pattern: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        var ret: RegExpMatchArray = checkValue.match(pattern);

        return (ret != null);
    }

	/**
	 * バインドを実行する
	 *
	 * @returns 実行結果
	 */
    async bind(): Promise<any> {

        //メッセージのクローズボタンイベント
        $("body").on("click", ".message .close", (event) => {
            $(event.currentTarget).closest('.message')
                .transition('fade');
        });
        //入力項目の変更イベント
        $(window).bind("change", "input, select, textarea", (event) => {
            //form-change-ignoreクラスが設定されているか、上位にsearchクラスが設定されてなければフラグを立てる
            if (!$(event.target).hasClass("form-change-ignore")) {
                let $element = $(event.target).closest(".search");
                if ($element.length == 0) {
                    this.isFormChange = true;
                }
            }
        });
        //aタグクリックイベント
        $("body").on("click", "a", (event) => {
            var href: string = $(event.currentTarget).attr('href');
            var target: string = $(event.currentTarget).attr('target');
            //hrefがある、#、_blankでない場合
            if (!this.isUndefined(href)
                && href != ''
                && href.indexOf('#') != 0
                && target != '_blank') {

                let modalOptions = new ModalOptions();
                modalOptions.onApprove = ($element) => {
                    this.startLoading();
                    location.href = href;
                };
                //遷移確認モーダルを表示する
                this.startMoveConfirmModal(modalOptions);
                return false;
            }

            return true;
        });
        //file項目の変更イベント
        $("body").find(":file").wrap("<div class='drag-drop'></div>");
        $(document).on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        $(document).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        $(document).on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        //drag開始
        $(".drag-drop").on("dragenter", (event: any) => {
            event.stopPropagation();
            event.preventDefault();
        });
        //drag終了
        $(".drag-drop").on("dragleave", (event: any) => {
            event.stopPropagation();
            event.preventDefault();
        });
        //drag中
        $(".drag-drop").on("dragover", (event: any) => {
            event.stopPropagation();
            event.preventDefault();
        });
        //drop
        $(".drag-drop").on("drop", (event: any) => {
            event.preventDefault();
            var files = event.originalEvent.dataTransfer.files;
            this.fileUpload(event.currentTarget.querySelector("input"), files[0]);
            $(event.currentTarget.querySelector("input")).val("");
        });

        $("body").on("change", ":file", (event: any) => {
            this.fileUpload(event.target, event.target.files[0]);
            return false;
        });
        //ログアウトボタンクリックイベント
        $(this.model.LogoutBtn.id()).on("click", (event) => {
            this.startLoading();
            location.href = config.routingURL.doLogout;
            return false;
        });

        //検索条件の表示非表示ボタンクリックイベント
        $("body").on("click", ".search-hide-show", (event) => {
            var $target: JQuery<Element> = $(event.currentTarget);
            var $prev: JQuery<Element>  = $target.parent().prev();
            if ($target.hasClass("up")) {
                var prevHeight: number = $prev.height() + parseInt($prev.css("margin-top"), 10);
                $prev.hide();
                $target.removeClass("up").addClass("down");
                //以降の要素にgridがあれば減った分の高さを追加する
                var $agGrid: JQuery<Element>  = $prev.nextAll(".ag-grid");
                $agGrid.each(function (i, elem) {
                    var elemHeight: number = $(elem).height();
                    $(elem).height(elemHeight + prevHeight);
                });
            } else {
                $prev.show();
                var prevHeight: number = $prev.height() + parseInt($prev.css("margin-top"), 10);
                $target.removeClass("down").addClass("up");

                //以降の要素にgridがあれば増えた分の高さを削除する
                var $agGrid: JQuery<Element>  = $prev.nextAll(".ag-grid");
                $agGrid.each(function (i, elem) {
                    var elemHeight: number = $(elem).height();
                    $(elem).height(elemHeight - prevHeight);
                });
            }

        });

        return true;
	}

	/**
	 * ファイルアップロード
	 *
	 * @param targetSelector ファイルアップロード対象のセレクタ
	 * @param file アップロードファイル
	 */
    fileUpload(targetSelector: any, file: any): void {
        let self = this;

        let name: string = $(targetSelector).attr("name");
        let $img: JQuery = $("img[for='" + name + "']");
        //ファイルが選択されていない場合
        if (self.isUndefined(file)) {
            //targetSelector.files = null;
            self.fileDataList[name] = {};
            //デフォルトの画像を表示
            if (!self.isUndefined($img)) {
                $img.attr("src", "/images/default_person.png");
            }
            return;
        }
        //許可されているタイプのファイルかチェック
        let allowMineType: string = $(targetSelector).data("allow-mine-type");
        if (!self.isUndefined(allowMineType)) {
            let arr: string[] = allowMineType.split(",");
            let type: string = file.type;
            let allowFlg: boolean = false;
            for (var i = 0; i < arr.length; i++) {
                if (type == arr[i]) {
                    allowFlg = true;
                }
            }
            if (!allowFlg) {
                //target.files = null;
                alert(self.messageFormat("E_002", allowMineType));
                return;
            }
        }

        //読み込み中はプログレスバー表示
        self.startProgressModal();

        //ファイルを一時フォルダにアップロードする
        var formdata = new FormData();
        formdata.append("file", file);

        var xmlhttp = new XMLHttpRequest();
        //通信中
        xmlhttp.onreadystatechange = function (e: any) {
            var loaded: number = e.loaded;
            var total: number = e.total;
            var per: number = (loaded / total) * 100;
            var perString: string = per.toFixed(0);

            $('#progress-modal').find(".progress").progress(
                "set percent", Number(perString)
            );
        };
        //通信完了
        xmlhttp.onloadend = function (e: any) {
            if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
                $('#progress-modal').find(".progress").progress(
                    "set percent", 100
                );
                var jsonResponse = JSON.parse(xmlhttp.responseText);

                self.fileDataList[name] = file.name + "," + jsonResponse.data;

                if (!self.isUndefined($img)) {
                    let fr = new FileReader();
                    fr.readAsDataURL(file);

                    //ファイルのbase64バイナリコードを取得する
                    fr.onload = (onloadEvent: any) => {
                        //self.fileDataList[name] = file.name + "," + onloadEvent.target.result;

                        if (!self.isUndefined($img)) {
                            $img.attr("src", onloadEvent.target.result);
                            self.isFormChange = true;
                        }
                        fr = null;
                        //self.stopProgressModal();
                    }
                    //$.each(event.target.files, function () {
                    //    let name = $(event.target).attr("name");
                    //    self.fileDataList[name] = this;
                    //});
                }
            } else {
                self.stopProgressModal();
                alert(xmlhttp.responseText);
            }
            self.stopProgressModal();
        };

        xmlhttp.open("POST", "/Util/TempUpload", true);
        //xmlhttp.setRequestHeader("RequestVerificationToken", $("input[name='__RequestVerificationToken']").val());
        xmlhttp.send(formdata);
	}

	/**
	 * 初期化を実行する
	 *
	 * @returns 実行結果
	 */
    async init(): Promise<any> {
        let defer: JQueryDeferred<void> = $.Deferred<void>();
        //semantic-UIのプラグイン
        $(".ui.dropdown").dropdown().removeClass("hide");

        // $(this.model.Language.id()).dropdown({
        //     onChange: (value: string, text: string, $selectedItem) => {
        //         let options = new AjaxOptions();
        //         options.done = (returnData) => {
        //             location.reload();
        //         };

        //         return this.submit("/Util/SetLanguage?language=" + value, options);
        //     }
        // }).removeClass("hide");

        $(".ui.sidebar").sidebar("attach events", ".open.button");
        $('.ui.checkbox').checkbox();
        $('.ui.accordion').accordion();
        //カレンダー
        flatpickr(".flatpickr", {});
        //$(".flatpickr").flatpickr({ locale: $("#lang").val() });
        //メッセージの取得

        //await this.getResources();
        //await this.getModals();

        $(".drag-drop").attr("data-tooltip", this.messageFormat("I_002")).attr("data-inverted", "");

        let errors = $("#ModelErrors").val();
        if (!this.isNullOrWhiteSpace(errors)) {
            let data = JSON.parse(errors.toString());
            this.modelErrors = data[config.requestParameter.validationSummary];
            return this.isValid();
        }
        return true;
	}

	/**
	 * リソースを取得する
	 *
	 * @param valueOrId 値orリソースID
	 * @param args 置換文字
	 * @returns リソース
	 */
    messageFormat(valueOrId: string, ...args: string[]): string {

        let message: string = messages[valueOrId];

        if (this.isUndefined(message)) {
            message = valueOrId;
        }

        if (args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                message = message.replace("{" + i + "}", args[i]);
            }
        }

        return message;
	}

	/**
	 * ローディングを表示する
	 *
	 */
    startLoading(): void {
        $("#loader").addClass("active");
	}

	/**
	 * ローディングを非表示にする
	 *
	 */
    stopLoading(): void {
        $("#loader").removeClass("active");
	}

	/**
	 * ajax送信を行う
	 *
	 * @param url リクエストURL
	 * @param data リクエストデータ
	 * @param options ajaxオプション
	 * @returns プロミス
	 */
    /// <summary>
    /// ajax送信を行う
    /// </summary>
    /// <returns></returns>
    ajax(url: string, data: string, options: AjaxOptions = null): JQuery.jqXHR {
        this.startLoading();
        this.hideError();

        let done: Function = (returnData) => { };
        let fail: Function = (returnData) => { };
        let always: Function = (returnData) => { };
        //引数がない場合、Optionsを初期化
        if (this.isUndefined(options)) options = new AjaxOptions();

        if (this.isUndefined(options.done)) options.done = done;
        if (this.isUndefined(options.fail)) options.fail = fail;
        if (this.isUndefined(options.always)) options.always = always;

        return $.ajax({
            //headers: {
            //    "RequestVerificationToken": JSON.parse(data)["__RequestVerificationToken"]
            //},
            url: url,
            type: options.type,
            contentType: options.contentType,
            data: data
        })
        .done(
            returnData => {
                options.done(returnData);
            }
        ).fail(
            returnData => {
                options.fail(returnData);
            }
        ).always(
            returnData => {
                options.always(returnData);
                this.stopLoading();
            }
        );
	}

	/**
	 * サブミットを行う
	 *
	 * @param url リクエストURL
	 * @param options ajaxオプション
	 * @param formSelector フォームセレクタ
	 * @returns プロミス
	 */
    async submit(url: string, options: AjaxOptions, formSelector: string = "#form1"): Promise<any> {

        let data: any = "";
        let self = this;
        //gridの編集モード終了
        for (var n in this.grid) {
            var g: AgGrid = this.grid[n];
            if (!this.isUndefined(g) && !this.isUndefined(g.getGrid())) {
                // gridセル編集モード終了
                g.getGridOptions().api.stopEditing();
                // 行エラーフラグリセット
                g.resetRowErrorFlg();
            }
        }
        var inputs: JQuery = $(formSelector).find('input,select,textarea, .ag-grid');
        var inputValues: object = {};
        inputValues['form_id'] = $(formSelector).attr('id');
        inputs.each(function () {
            var type: string = $(this).attr('type');
            if (!self.isUndefined(type)) type = type.toLowerCase();
            var tag: string = $(this).prop('tagName');
            if (!self.isUndefined(tag)) tag = tag.toLowerCase();
            //.ag-gridの場合
            if (tag == "div") {
                var id: string = $(this).attr('id');

                var g: AgGrid = self.grid[id];
                //gridが初期化されている場合データを収集
                if (!self.isUndefined(g) && !self.isUndefined(g.getGrid())) {
                    var gridOptions = g.getGridOptions();
                    //gridの行を再描画
                    gridOptions.api.redrawRows();
                    var idx: number = 0;
                    //gridの全行データをリクエスト送信用に加工
                    //.net coreで配列の受け取り方が変更となった
                    //test[0].Id = 1 →test[] {id : 1}のように単純に配列で送る形に変更
                    //.net core対応START
                    inputValues[id] = [];
                    gridOptions.api.forEachNode(function (node) {
                        //var idx = node.id;
                        //チェック済みの行しか送信しない
                        if (node.isSelected()) {
                            var tmp = {};
                            for (var name in node.data) {
                                tmp[name] = node.data[name];
                            }
                            tmp['Check'] = node.isSelected();
                            tmp['RowIndex'] = node.rowIndex;
                            tmp['RowId'] = node.id;

                            inputValues[id].push(tmp);
                        }

                    });
                    //.net core対応END
                    //gridOptions.api.forEachNode(function (node) {
                    //    //var idx = node.id;
                    //    //チェック済みの行しか送信しない
                    //    if (node.selected) {
                    //        for (var name in node.data) {
                    //            var key: string = id + '[' + idx + '].' + name;
                    //            inputValues[key] = node.data[name];
                    //        }
                    //        var key: string = id + '[' + idx + '].Check';
                    //        inputValues[key] = node.selected;
                    //        key = id + '[' + idx + '].RowIndex';
                    //        inputValues[key] = node.rowIndex;
                    //        key = id + '[' + idx + '].RowId';
                    //        inputValues[key] = node.id;
                    //        idx++;
                    //    }

                    //});
                }
            } else {
                var name: string = $(this).attr('name');
                var checked: boolean = $(this).prop("checked");
                var multiple: string = $(this).attr("multiple");
                //複数選択のselectの場合
                if (tag === 'select' && !self.isUndefined(multiple)) {
                    var options = $(this).find('option');
                    inputValues[name] = [];
                    options.each(function () {
                        var checked: boolean = $(this).prop("checked");
                        var selected: boolean = $(this).prop("selected");
                        if (checked || selected) {
                            inputValues[name].push($(this).val());
                        }
                    });
                } else if (type === 'checkbox') {
                    inputValues[name] = checked;
                } else if (type === 'radio') {
                    if (checked) {
                        inputValues[name] = $(this).val();
                    }
                } else if (type === 'file') {
                    //fileの場合base64バイナリコードを取得する
                    if (!self.isUndefined(self.fileDataList[name])) {
                        inputValues[name] = self.fileDataList[name];
                    } else {
                        inputValues[name] = $(this).val();
                    }
                } else {
                    //複数のname項目があっても後勝ちにはしない
                    if (self.isUndefined(inputValues[name])) inputValues[name] = $(this).val();
                }
            }
        });
        //バリデーションモード
        inputValues[this.model.ValidationMode] = options.validationMode;
        //inputValues[this.model.ModelErrors] = this.modelErrors;

        $.each(this.tmpKeys, (index, val) => {
            inputValues[index] = val;
        });

        data = JSON.stringify(inputValues, null, 2);
        if (this.isUndefined(options)) options = new AjaxOptions();

        let errorFunc: Function = (data) => {
            let $target = $("#validation-summary");
            //modal表示中の場合、modalにエラー表示
            if (this.isModalShow) {

                $target = $(".ui.dimmer.modals").find(".modal.active").find(".ui.error.message");
            }
            this.modelErrors = data[config.requestParameter.validationSummary];
            this.isValid();
            //$target.append(data["validationSummary"]).removeClass("transition hidden").show();
        };

        if (this.isUndefined(options.done)) {
            options.done = (returnData) => {
                //バリデーションエラーでない場合
                if (returnData["isValid"] == true) {
                } else {
                    errorFunc(returnData);
                }
            };
        } else {
            let done: Function = options.done;

            options.done = (returnData) => {
                if (returnData["isValid"] == true) {
                    done(returnData);
                } else {
                    errorFunc(returnData);
                }
            };
        }
        if (this.isUndefined(options.fail)) {
            options.fail = (returnData) => {
                errorFunc(returnData);
            };
        }

        return this.ajax(url, data, options);
	}

	/**
	 * インフォモーダルを表示する
	 *
	 * @param modalOptions モーダルオプション
	 */
    startInfoModal(modalOptions: ModalOptions = new ModalOptions()): void {
        let $target: JQuery = $('#info-modal');
        this.startModal($target, modalOptions);
	}

	/**
	 * インフォモーダルを非表示にする
	 *
	 */
    stopInfoModal(): void {
        let $target: JQuery = $('#info-modal');
        this.stopModal($target);
	}

	/**
	 * 確認モーダルを表示する
	 *
	 * @param modalOptions モーダルオプション
	 */
    startConfirmModal(modalOptions: ModalOptions = new ModalOptions()): void {
        let $target: JQuery = $('#confirm-modal');
        this.startModal($target, modalOptions);
    }

	/**
	 * 確認モーダルを非表示にする
	 *
	 */
    stopConfirmModal(): void {
        let $target: JQuery = $('#confirm-modal');
        this.stopModal($target);
    }

	/**
	 * プログレスモーダルを表示する
	 *
	 * @param modalOptions モーダルオプション
	 */
    startProgressModal(modalOptions: ModalOptions = new ModalOptions()): void {
        let $target: JQuery = $('#progress-modal');

        modalOptions.onShow = () => {
            $('#progress-modal').find(".progress").progress(
                "set percent", 0
            );
        };

        this.startModal($target, modalOptions);
	}

	/**
	 * プログレスモーダルを非表示にする
	 *
	 */
    stopProgressModal(): void {
        let $target: JQuery = $('#progress-modal');
        this.stopModal($target);
	}

    /**
	 * モーダルを表示する
	 *
	 * @param $target モーダルのJQueryエレメント
	 * @param modalOptions モーダルオプション
	 */
    startModal($target: JQuery, modalOptions: ModalOptions = new ModalOptions()): void {
        $target.find(".content p").empty().append(modalOptions.message);

        let onHide = modalOptions.onHide;

        modalOptions.onHide = () => {
            this.isModalShow = false;
            return onHide();
        }
        this.isModalShow = true;
        $target.modal({
            onShow: modalOptions.onShow
            , onVisible: modalOptions.onVisible
            , onHide: modalOptions.onHide
            , onHidden: modalOptions.onHidden
            , onDeny: modalOptions.onDeny
            , onApprove: modalOptions.onApprove
            , closable: modalOptions.closable
        }).modal('show');
	}

	/**
	 * モーダルを非表示にする
	 *
	 * @param $target モーダルのJQueryエレメント
	 */
    stopModal($target: JQuery): void {
        $target.modal("hide");
	}

	/**
	 * 遷移確認モーダルを表示する
	 *
	 * @param modalOptions モーダルオプション
	 */
    startMoveConfirmModal(modalOptions: ModalOptions): void {
        //フラグが立っていれば遷移確認モーダルを表示する
        if (this.isFormChange) {
            let $target: JQuery = $('#confirm-modal');

            modalOptions.message = this.messageFormat("W_000");
            this.startModal($target, modalOptions);
        } else {
            //設定された元のイベントを実行
            modalOptions.onApprove();
        }
	}

	/**
	 * モーダルを取得する
	 *
	 */
    async getModals(): Promise<any> {
        let options = new AjaxOptions();
        options.done = (returnData) => {
            $("#progress-modal").after(returnData[config.requestParameter.data]);
        };

        return this.submit("/Util/GetModals", options);
    }

	/**
	 * 定型の登録ModalOptionsを取得する
	 * 確認メッセージ→リクエスト送信→完了メッセージ→画面遷移
	 *
	 * @param confirmMessage 確認メッセージ
	 * @param validationMode バリデーションモード
	 * @param infoMessage 登録完了メッセージ
	 * @param url リクエストURL
	 * @param formSelector フォームセレクタ
	 * @returns モーダルオプション
	 */
    getUsualRegistModalOptions(confirmMessage: string, validationMode: string
        , infoMessage: string, moveUrl: Function, url: string, formSelector: string = "#form1"): ModalOptions {
        let modalOptions = new ModalOptions();
        modalOptions.message = confirmMessage;
        modalOptions.onApprove = ($element) => {
            let options = new AjaxOptions();
            options.validationMode = validationMode;
            options.done = (returnData) => {
                let InfoModalOptions = new ModalOptions();
                InfoModalOptions.message = infoMessage;
                InfoModalOptions.onApprove = ($element) => {
                    this.startLoading();
                    location.href = moveUrl(returnData);
                };
                this.startInfoModal(InfoModalOptions);
            };
            this.submit(url, options, formSelector);
        };
        return modalOptions;
    }

	/**
	 * 定型の検索Optionsを取得する
	 * クエスト送信→gridにセット
	 *
	 * @param validationMode バリデーションモード
	 * @param gridId グリッドID
	 * @param extraDone gridにセット後の追加処理
	 * @returns ajaxオプション
	 */
    getUsualSearchOptions(validationMode: string, gridId: string, extraDone: Function = () => { }): AjaxOptions {
        let options = new AjaxOptions();

        options.validationMode = validationMode;
        options.done = (returnData) => {
            this.grid[gridId].setRowData(returnData[config.requestParameter.data]);
            extraDone(returnData);
        };

        return options;
    }

	/**
	 * グリッドに受信結果をセットする
	 * クエスト送信→gridにセット
	 *
	 * @param validationMode バリデーションモード
	 * @param gridId グリッドID
	 * @param url リクエストURL
	 * @param extraDone gridにセット後の追加処理
	 * @returns プロミス
	 */
    /// <summary>
    /// グリッドに受信結果をセットする
    /// リクエスト送信→gridにセット
    /// </summary>
    /// <returns></returns>
    async submitSetGrid(validationMode: string, gridId: string, url: string, extraDone: Function = () => { }): Promise<any> {
        let options = this.getUsualSearchOptions(validationMode, gridId, extraDone);

        return this.submit(url, options);
    }

	/**
	 * グリッドに受信結果をセットする（Modal用）
	 * クエスト送信→gridにセット
	 *
	 * @param validationMode バリデーションモード
	 * @param gridId グリッドID
	 * @param url リクエストURL
	 * @param modalId モーダルID
	 * @param extraDone gridにセット後の追加処理
	 * @returns プロミス
	 */
    async submitSetGridForModal(validationMode: string, gridId: string, url: string, modalId: string, extraDone: Function = () => { }): Promise<any> {
        let options = this.getUsualSearchOptions(validationMode, gridId, extraDone);

        return this.submit(url, options, "#" + modalId + " form");
    }

	/**
	 * バリデーションチェック
	 *
	 * @returns チェック結果
	 */
    isValid(): boolean {
        let ret: boolean = (Object.keys(this.modelErrors).length == 0);
        this.hideError();
        if (!ret) {
            let liList = [];
            for (let key in this.modelErrors) {
                let li = $("<li />");
                li.append(this.modelErrors[key]);
                $("#"+key).closest(".field").addClass("error");
                liList.push(li);
            }
            let $target = $("#validation-summary").find(".list");
            $target.append(liList).end().removeClass("transition hidden").show();
            //this.submit("/Util/GetValidationSummary", new AjaxOptions());
        }
        this.modelErrors = {};
        return ret;
    }

	/**
	 * エラーを追加する
	 *
	 * @param key キー
	 * @param message メッセージ
	 */
    addModelError(key: string, message: string): void {
        if (this.isNullOrWhiteSpace(key)) {
            key = "tmpErrorKey_" + Object.keys(this.modelErrors).length;
        }

        this.modelErrors[key] = message;
    }

	/**
	 * エラー表示を非表示にする
	 *
	 */
    hideError(): void {
        $(".field").removeClass("error");
        $("#validation-summary").find(".list").empty().end().hide();
        $(".ui.dimmer.modals").find(".ui.error.message").empty().hide();
    }

	/**
	 * 定型のgrid付きModalのModalOptionsを取得する
	 * 選択行を指定GridIdに追加
	 *
	 * @param gridId グリッドID
	 * @param extraDone 選択行を指定GridIdに追加後の追加処理
	 * @returns モーダルオプション
	 */
    getUsualGridModalOptions(gridId: string, extraDone: Function = () => { }): ModalOptions {
        let modalOptions: ModalOptions = new ModalOptions();
        //モーダルの登録ボタン押下時
        modalOptions.onApprove = ($element: JQuery, checkedRows: Array<any>) => {
            if (checkedRows.length == 0) {
                this.addModelError("", this.messageFormat("E_011"));
            }

            if (!this.isValid()) {
                return false;
            }
            this.grid[gridId].addRows(checkedRows);
            extraDone($element, checkedRows);
            return true;
        };

        return modalOptions;
    }

	/**
	 * 必須バリデーション
	 *
	 * @param checkValue チェック値
	 * @param arg 置換文字
	 * @param memberNames エラーエレメント名
	 * @returns チェック結果
	 */
    requireVaidate(checkValue: string, arg: string, memberNames: string): boolean {
        if (this.isNullOrWhiteSpace(checkValue)) {
            this.addModelError(memberNames, this.messageFormat("E_000", arg));
            return false;
        }
        return true;
    }

	/**
	 * 日付バリデーション
	 *
	 * @param checkValue チェック値
	 * @param message 置換文字
	 * @param memberNames エラーエレメント名
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    dateVaidate(checkValue: string, message: string, memberNames: string, requireFlg: boolean = true): boolean {
        let ret: boolean = true;

        if (requireFlg) {
            ret = this.requireVaidate(checkValue, message, memberNames);
        }
        if (ret) {
            if (!this.isDate(checkValue, requireFlg)) {
                this.addModelError(memberNames, this.messageFormat("E_003", message));
                return false;
            }
        }
        return ret;
    }

	/**
	 * 電話番号バリデーション
	 *
	 * @param checkValue チェック値
	 * @param arg 置換文字
	 * @param memberNames エラーエレメント名
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    phoneNumberVaidate(checkValue: string, message: string, memberNames: string, requireFlg: boolean = true): boolean {
        let ret: boolean = true;

        if (requireFlg) {
            ret = this.requireVaidate(checkValue, message, memberNames);
        }
        if (ret) {
            if (!this.isPhoneNumber(checkValue, requireFlg)) {
                this.addModelError(memberNames, this.messageFormat("E_004", message));
            }
        }
        return ret;
    }

	/**
	 * メールアドレスバリデーション
	 *
	 * @param checkValue チェック値
	 * @param arg 置換文字
	 * @param memberNames エラーエレメント名
	 * @param requireFlg 必須フラグ
	 * @returns チェック結果
	 */
    mailAddressVaidate(checkValue: string, message: string, memberNames: string, requireFlg: boolean = true): boolean {
        let ret: boolean = true;

        if (requireFlg) {
            ret = this.requireVaidate(checkValue, message, memberNames);
        }
        if (ret) {
            if (!this.isMailAddress(checkValue, requireFlg)) {
                this.addModelError(memberNames, this.messageFormat("E_005", message));
            }
        }
        return ret;
    }

	/**
	 * セレクトボックスに受信結果をセットする
	 *
	 * @param url リクエストURL
	 * @param getSelectSelector 送信セレクトボックスセレクタ
	 * @param setSelectSelector 受信結果セットセレクトボックスセレクタ
	 * @returns プロミス
	 */
    async submitSetSelect(url: string, getSelectSelector: string, setSelectSelector: string): Promise<any> {
        let options = new AjaxOptions();

        this.tmpKeys[this.model.TmpSelect] = $(getSelectSelector).val();

        options.done = (returnData) => {
            var $options = $.map(returnData[config.requestParameter.data], (item, i) => {
                let $option = $('<option />', { value: item.Value, text: item.Text, selected: item.Selected });
                return $option;
            });

            $(setSelectSelector).empty().append($options);
            if ($(setSelectSelector).parent().hasClass("dropdown")) {
                //semantic-UIの選択状態をクリアする
                $(setSelectSelector).parent().find(".delete").trigger("click");
            }
        };

        return this.submit(url, options);
    }

	/**
	 * ファイルダウンロード
	 *
	 * @param url リクエストURL
	 * @param filePath ファイルパス
	 */
    doDownload(filePath: string) {
        let getParam = {
            filePath: filePath
        };
        location.href = "/Util/DoDownload?" + $.param(getParam);
    }

	/**
	 * メソッドにリクエスト送信後ファイルダウンロード
	 *
	 * @param url リクエストURL
	 * @param validationMode バリデーションモード
	 * @returns プロミス
	 */
    /// <summary>
    /// メソッドにリクエスト送信後ファイルダウンロード
    /// </summary>
    /// <returns></returns>
    async submitDoDownload(url: string, validationMode: string = ""): Promise<any> {
        let options = new AjaxOptions();

        options.done = (returnData) => {
            this.doDownload(returnData[config.requestParameter.data]);
        };

        return this.submit(url, options);
    }
}