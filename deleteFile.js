'use strict';

const token = '**************';
const delete_mode = [
    'hosted',
    'external',
    'space',
    'snippet'
];

const request = require('request');
const fs = require('fs');
var Promise = require('bluebird');

Promise.promisifyAll(request);


/*
    実行部
*/
getMyId()
.then(getMyFileList)
.then((files) => {
    console.log('get', files.length, 'files');

    return Promise.reduce(files, (count, file) => {
        if(judgeDelete(file.mode)) {
            /* バックアップ有り */
            return backupFile(count, file).spread(deleteFile).catch(() => Promise.resolve(count));

            /* バックアップ無し */
            // return deleteFile(count, file);

            /* バックアップのみ */
            // return backupFile(count, file).then(() => count).catch(() => Promise.resolve(count));
        } else {
            return Promise.resolve(count);
        }
    }, 0);
})
.then((delete_count) => {
    console.log('finish: delete', delete_count, 'files');
})
.catch((err) => {
    console.error(err.stack);
});


/*
    関数部
*/
/* 自分のslackのIDを取得 */
function getMyId() {
    return new Promise((resolve, reject) => {
        request.postAsync({
            url: 'https://slack.com/api/auth.test',
            formData: {
                token: token
            }
        })
        .spread((resp, body) => {
            const my_id = JSON.parse(body).user_id;

            resolve(my_id);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

/* 自分がアップロードしたファイルのリストをAPIで取得 */
function getMyFileList(my_id) {
    return new Promise((resolve, reject) => {
        /* 全てのファイルを取得できていなかったら再帰的に取得する */
        getFileListByOnePage(my_id, 1)
        .then((files) => {
            resolve(files);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

/* 再帰的にAPIから全ファイルのリストを取得する */
function getFileListByOnePage(my_id, page) {
    return new Promise((resolve, reject) => {
        request.postAsync({
            url: 'https://slack.com/api/files.list',
            formData: {
                token: token,
                count: 1000, // 1000個のファイル (上限不明)
                user: my_id,
                page: page
            }
        })
        .spread((resp, body) => {
            const file_data = JSON.parse(body);

            /* ファイルリストを保存 */
            fs.writeFile('./files'+page+'.json', JSON.stringify(file_data, null, 4))

            /* 全てのファイルを取得できるまで再帰的に実行 */
            const paging = file_data.paging;
            if(paging.pages > paging.page) {
                getFileListByOnePage(my_id, paging.page+1)
                .then((next_file_data) => {
                    resolve(file_data.files.concat(next_file_data));
                });
            } else {
                resolve(file_data.files);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

/* 削除するファイルのモードを判定 */
function judgeDelete(file_mode) {
    return delete_mode.indexOf(file_mode) > -1;
}

/* 一つのファイルをバックアップする */
function backupFile(count, file) {
    const download_link = file.url_private_download;

    return new Promise((resolve, reject) => {
        /* ダウンロードリンクがあればバックアップ */
        if(download_link){
            request.get(download_link, {
                'auth': {
                    'bearer': token
                }
            })
            .pipe(
                fs.createWriteStream('./buckup/' + file.id + '-' + file.name)
                .on('finish', () => {
                    console.log('download complete:', file.id, file.name);
                    resolve([count, file]);
                })
                .on('err', (err) => {
                    console.log('download error:', file.id, file.name);
                    console.error(err.stack);
                    reject(err);
                })
            );
        /* ダウンロードリンクが無ければ(GoogleDriveなどからファイルを共有した場合)スルー */
        } else {
            console.log('no download link:', file.id, file.name);
            resolve([count, file]);
        }
    });
}

/* 一つのファイルを削除する */
function deleteFile(count, file){
    return request.postAsync({
        url: 'https://slack.com/api/files.delete',
        formData: {
            token: token,
            file: file.id
        }
    })
    .then(() => {
        console.log('delete complete:', file.id, file.name);
        return Promise.resolve(count + 1);
    })
    .catch((err) => {
        console.log('delete error:', file.id, file.name);
        console.error(err.stack);
        return Promise.resolve(count);
    });
}
