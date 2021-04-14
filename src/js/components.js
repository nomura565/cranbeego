/// <summary>
/// チェックボックスヘッダコンポーネント
/// </summary>
export function CheckBoxHeaderComponent() {
    this.eGui = document.createElement('span');
}
CheckBoxHeaderComponent.prototype.init = function (params) {
    var self = this;
    self.eGui.className = "ag-icon ag-icon-checkbox-unchecked";

    $(self.eGui).on('click', function () {

        //params.column.colDef.onHeaderClicked(this);

        var checkedFlg = false;
        var checkedClass = "ag-icon-checkbox-checked";
        var unCheckedClass = "ag-icon-checkbox-unchecked";

        if ($(self.eGui).hasClass(unCheckedClass)) {
            $(self.eGui).removeClass(unCheckedClass).addClass(checkedClass);
            checkedFlg = true;
        } else {
            $(self.eGui).removeClass(checkedClass).addClass(unCheckedClass);
        }
        /*
        var $check_target = $(this).closest(".ag-grid").find('[col-id=Check]');
        if (checkedFlg) {
            $check_target = $check_target.find('.' + unCheckedClass);
        } else {
            $check_target = $check_target.find('.' + checkedClass);
        }

        $check_target.trigger("click");
        */
        //画面に表示されていない行のデータを更新する
        params.api.gridOptionsWrapper.gridOptions.api.forEachNodeAfterFilter(function (node) {
            node.setSelected(checkedFlg);
        });
        //内部データを更新する
        params.api.gridOptionsWrapper.gridOptions.api.forEachNode(function (node) {
            node.data["Check"] = checkedFlg;
        });

        return false;
    });
};
CheckBoxHeaderComponent.prototype.getGui = function getGui() {
    return this.eGui;
};
CheckBoxHeaderComponent.prototype.destroy = function () {

};

/// <summary>
/// セレクトボックスコンポーネント
/// </summary>
export function SelectRenderer() {
    this.eGui = document.createElement('select');
}
SelectRenderer.prototype.init = function (params) {
    var self = this;
    self.eGui.className = "ui dropdown";
    self.eGui.name = params.colDef.field;
    var options = "<option value=''></option>";
    if (params.colDef.cellEditorParams["noSpace"] === true) {
        options = "";
    }

    eGuiClassSetting(self.eGui, params);
    disabledSetting(self.eGui, params);
    hideSetting(self.eGui, params);

    if (typeof params.colDef.SelectRendererOptionFunc === "function") {
        options += params.colDef.SelectRendererOptionFunc(params);
    } else {
        var selectedFlg = false;
        $.each(params.colDef.cellEditorParams.values, function (i, cellEditorParam) {
            var selected = (cellEditorParam.Value === params.value) ? "selected=selected" : "";
            var option = "<option value='" + cellEditorParam.Value + "' " + selected + ">" + cellEditorParam.Text + "</option>";
            options += option;
            if (selected != "" && !selectedFlg) selectedFlg = true;
        });
        //ドロップダウンの中に一致するものがなければ値を削除する
        if (!selectedFlg) params.data[params.colDef.field] = "";
    }

    $(this.eGui).append(options);

    $(self.eGui).on('change', function () {
        params.data[params.colDef.field] = $(this).val();
        if (typeof params.colDef.onCellValueChanged === "function") {
            params.colDef.onCellValueChanged(params);
        }

    });
};
SelectRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
SelectRenderer.prototype.destroy = function () {

};

/// <summary>
/// スパンコンポーネント
/// </summary>
export function SpanRenderer() {
    this.eGui = document.createElement('span');
}
SpanRenderer.prototype.init = function (params) {
    var self = this;

    eGuiClassSetting(self.eGui, params);
    disabledSetting(self.eGui, params);
    hideSetting(self.eGui, params);

    $(self.eGui).text((params.value == null) ? "" : params.value);

};
SpanRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
SpanRenderer.prototype.destroy = function () {

};

/// <summary>
/// ボタンコンポーネント
/// </summary>
export function ButtonRenderer() {
    this.eGui = document.createElement('button');
}
ButtonRenderer.prototype.init = function (params) {
    var self = this;
    var i = document.createElement('i');
    i.className = "icon edit";
    self.eGui.className = "ui teal basic button";
    self.eGui.name = params.colDef.field;

    $(self.eGui).append(params.colDef.cellRendererParams["buttonValue"]);

    eGuiClassSetting(self.eGui, params);
    disabledSetting(self.eGui, params);
    hideSetting(self.eGui, params);

    $(self.eGui).on('click', function () {
        if (typeof params.colDef.onButtonClicked === "function") {
            params.colDef.onButtonClicked(params);
        }
        return false;
    });
};
ButtonRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
ButtonRenderer.prototype.destroy = function () {

};

/// <summary>
/// インプットコンポーネント
/// </summary>
export function InputRenderer() {
    this.eGui = document.createElement('input');
}
InputRenderer.prototype.init = function (params) {
    var self = this;

    //editableが設定されていた場合
    if (typeof params.colDef["editable"] === "undefined") {
        params.colDef["editable"] = {};
        params.colDef["editable"] = true;
    }
    //ファンクションが設定されていた場合はファンクションを優先する
    if (typeof params.colDef.editableFunc === "function") {
        var editable = params.colDef.editableFunc(params);
        params.colDef["editable"] = editable;
    }
    if (typeof params.colDef["editable"] !== "undefined") {
        //ehidtableがfalseだった場合、spanにする
        if (!params.colDef["editable"]) {
            self.eGui = document.createElement('span');
            $(self.eGui).text((params.value == null) ? "" : params.value);
        }
    }

    eGuiClassSetting(self.eGui, params);
    disabledSetting(self.eGui, params);
    hideSetting(self.eGui, params);

    $(self.eGui).val((params.value == null) ? "" : params.value);

    $(self.eGui).on('change', function () {
        if (typeof params.colDef.onCellValueChanged === "function") {
            params.colDef.onCellValueChanged(params);
        }
    });
};
InputRenderer.prototype.getGui = function getGui() {
    return this.eGui;
};
InputRenderer.prototype.destroy = function () {

};

/// <summary>
/// 活性非活性設定
/// </summary>
function disabledSetting(eGui, params) {
    //disabledが設定されていた場合
    if (typeof params.node["disabled"] === "undefined") {
        params.node["disabled"] = {};
    }
    //ファンクションが設定されていた場合はファンクションを優先する
    if (typeof params.colDef.disabledFunc === "function") {
        var disabled = params.colDef.disabledFunc(params);
        params.node["disabled"][params.colDef.field] = disabled;
    }
    if (typeof params.node["disabled"] !== "undefined") {
        eGui.disabled = params.node["disabled"][params.colDef.field];
    }
}

/// <summary>
/// 表示非表示設定
/// </summary>
function hideSetting(eGui, params) {
    //hideが設定されていた場合
    if (typeof params.node["hide"] === "undefined") {
        params.node["hide"] = {};
    }
    //ファンクションが設定されていた場合はファンクションを優先する
    if (typeof params.colDef.hideFunc === "function") {
        var hide = params.colDef.hideFunc(params);
        params.node["hide"][params.colDef.field] = hide;
    }
    if (typeof params.node["hide"] !== "undefined") {
        if (params.node["hide"][params.colDef.field]) {
            $(eGui).addClass("hide");
        } else {
            $(eGui).removeClass("hide");
        }
    }
}

/// <summary>
/// クラス設定
/// </summary>
function eGuiClassSetting(eGui, params) {
    //eGuiClassが設定されていた場合
    if (typeof params.colDef["eGuiClass"] === "function") {
        $(eGui).addClass(params.colDef["eGuiClass"](params));
    } else if (typeof params.colDef["eGuiClass"] === "string") {
        $(eGui).addClass(params.colDef["eGuiClass"]);
    }
}