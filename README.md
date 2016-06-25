# deleteMySlackFiles

自分がSlackにアップロードしたファイルを一括ダウンロードし，Slack上から削除するスクリプトです．

## 動作確認環境

* OS X El Capitan
* npm 2.14.7
* node v4.2.0

## 利用方法

1. [こちら](https://api.slack.com/web)からファイルを削除したいチームのSlack Web APIのtokenを発行する．
2. このリポジトリをクローンする．
3. 取得したtokenをdeleteFile.jsの3行目へ貼り付ける．
4. 設定を行う．
 1. 削除しないファイルの[mode](https://api.slack.com/types/file)をdeleteFile.jsの5~8行目で選択(コメントアウト)する．※デフォルトで全てのmode
 1. deleteFile.jsの28~35行目でバックアップと削除の有無を決める．
5. 必要なパッケージのインストール
 ```
 $ npm install
 ```
6. スクリプトの実行
 ```
 $ node deleteFile
 ```
