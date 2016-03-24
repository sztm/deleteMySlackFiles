# deleteMySlackFiles

自分がSlackにアップロードしたファイルを一括ダウンロードし，Slack上から削除するスクリプトです．

## 動作確認環境

* OS X Elcapitan
* Node 4.0.0

## 利用方法

1. [こちら](https://api.slack.com/web)からファイルを削除したいチームのSlack Web APIのtokenを発行する．
2. このリポジトリをクローン
3. 取得したtokenをdeleteFile.jsの2行目へ貼り付け
4. 必要なパッケージのインストール
 ```
 $ npm install
 ```
5. スクリプトの実行
 ```
 $ node deleteFile
 ```
