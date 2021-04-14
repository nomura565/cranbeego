// 開発or本番モードの選択(development、production、noneのいずれか設定必須)
// development: 開発時のファイル出力のモード(最適化より時間短縮,エラー表示などを優先)
// production: 本番時のファイル出力のモード(最適化されて出力される)
const MODE = "development";
// ソースマップの利用有無(productionのときはソースマップを利用しない)
const enabledSourceMap = MODE === "development";

// ファイル出力時の絶対パス指定に使用
const path = require('path'),
    glob = require('glob'),
    _ = require('lodash');

// プラグイン
// js最適化
const TerserPlugin = require('terser-webpack-plugin');

const VueLoaderPlugin = require('vue-loader/lib/plugin')

const webpack = require('webpack');
const config = require('./conf/config.json');

const jsBasePath = path.resolve(__dirname, config.baseDir + "/" + config.jsDir),
    jsDistPath = path.resolve(__dirname, config.distDir + "/" + config.jsDir)

const {WebpackManifestPlugin} = require('webpack-manifest-plugin');

String.prototype.filename = function () {
    return this.match(".+/(.+?)([\?#;].*)?$")[1];
}

var targets = _.filter(glob.sync(`${jsBasePath}/**/*.ts`), (item) => {
    return !item.filename().match(/^_/) && !item.match(/node_modules/) && !item.match(/lib/)
});

// entryに入れるhash
var entries = {};

// pathも含めたfilenameからpathとfilenameでhashを作る
targets.forEach(value => {
    var path = jsBasePath.replace(/\\/g, '\/')
    var re = new RegExp(`${path}/`);
    var key = value.replace(re, '');
    key = key.replace(".ts", '');
    key = key.replace(".js", '');

    // 確認用に取得したファイル名を出す
    //console.log('--------------------------')
    //console.log(path)
    //console.log(key)
    //console.log(value.filename())
    entries[key] = value;
});


module.exports = {
  // エントリーポイント(メインのjsファイル)
  entry: entries,
  // ファイルの出力設定
  output: {
    path: jsDistPath,
    filename: '[name]-[hash].js'
  },
  mode: MODE,
  // ソースマップ有効
  devtool: 'source-map',
  // ローダーの設定
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        // 拡張子 .js の場合
        test: /\.ts$/,
        use: [
            {
                // Babel を利用する
                loader: 'babel-loader',
                // Babel のオプションを指定する
                options: {
                    presets: [
                        ["@babel/preset-env", {
                            targets: {
                                "browsers": ["last 2 versions", "ie >= 11"]
                            },
                            useBuiltIns: 'entry',
                            corejs: 3,
                            modules: false
                        }
                        ],
                        [
                            "@babel/preset-typescript", {
                                allowNamespaces: true
                            }
                        ]
                    ],
                    "plugins": [
                        "@babel/plugin-proposal-class-properties",
                        "@babel/plugin-transform-runtime"
                    ]
                }

            }
        ]
      },
      {
        // ローダーの対象 // 拡張子 .js の場合
        test: /\.js$/,
        // ローダーの処理対象から外すディレクトリ
        exclude: /node_modules/,
        // Babel を利用する
        loader: "babel-loader",
        // Babel のオプションを指定する
        options: {
          presets: [
            // プリセットを指定することで、ES2019 を ES5 に変換
            "@babel/preset-env"
          ]
        }
      }
    ]
  },
  // import 文で .ts ファイルを解決するため
  resolve: {
    // Webpackで利用するときの設定
    alias: {
      vue$: "vue/dist/vue.esm.js"
    },
    extensions: ["*", ".ts", ".js", ".vue", ".json"]
  },
  plugins: [
    // Vueを読み込めるようにするため
    new VueLoaderPlugin(),
    new WebpackManifestPlugin({
        publicPath: "",
        writeToFileEmit: true
    })
  ],
  // mode:puroductionでビルドした場合のファイル圧縮
  optimization: {
    minimizer: MODE
      ? []
      : [
        // jsファイルの最適化
        new TerserPlugin({
          // すべてのコメント削除
          extractComments: 'all',
          // console.logの出力除去
          terserOptions: {
            compress: { drop_console: true }
          },
        }),
      ]
  },
  // js, css, html更新時自動的にブラウザをリロード
  devServer: {
    // サーバーの起点ディレクトリ
    // contentBase: "dist",
    // バンドルされるファイルの監視 // パスがサーバー起点と異なる場合に設定
    publicPath: jsDistPath,
    //コンテンツの変更監視をする
    watchContentBase: true,
    // 実行時(サーバー起動時)ブラウザ自動起動
    open: true,
    // 自動で指定したページを開く
    openPage: "index.html",
    // 同一network内からのアクセス可能に
    host: "0.0.0.0"
  }
};