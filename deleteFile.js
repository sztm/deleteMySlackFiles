/* Slack API Token */
var token = '**************';

var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');

Promise.promisifyAll(request);

/* バックアップ用のディレクトリを作成 */
Promise.resolve()
.then(function(){
    /* 自分のユーザidを取得 */
    return request.postAsync({url: 'https://slack.com/api/auth.test', formData: {token: token}});
})
.spread(function(resp, body){
    var result = JSON.parse(body);
    var my_id = result.user_id;

    /* 自分がアップロードしたファイルの一覧を取得 */
    return request.postAsync({url:'https://slack.com/api/files.list', formData: {
        token: token,
        count: 1000, // 1000個のファイル (上限不明)
        user: my_id,
        page: 1
    }});
})
.spread(function(res, body){
    /* ファイルリストを保存 */
    fs.writeFile('./files.json', JSON.stringify(JSON.parse(body), null, 4), function(err){
        if(err){console.log(err);}
    });

    var file_list = JSON.parse(body).files;

    console.log('start: delete', file_list.length, 'files');

    /* ファイルバックアップ */
    return Promise.reduce(file_list, deleteFileAsync, 0)
    .then(function(delete_count){
        console.log('finish: delete', delete_count, 'files');
    });
})
.catch(function(err){
    console.error(err);
});

/* 一つのファイルを削除 */
function deleteFileAsync(count, file){
    // return Promise.resolve(count+1);
    return request.postAsync({url: 'https://slack.com/api/files.delete', formData: {token: token, file: file.id}})
    .then(function(){
        console.log('delete complete:', file.id, file.name);
        return Promise.resolve(count + 1);
    })
    .catch(function(err){
        console.log('delete error:', file.id, file.name);
        console.error(err);
        return Promise.resolve(count);
    });
}
