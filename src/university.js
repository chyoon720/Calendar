const UNIVERSITY_DATABASE = 'universityDB';
const DB_VERSION = 1;
const DB_UNIVERSITY_STORE = 'university';

window.onload = function() {
    openDB();

    var request = window.indexedDB.open(UNIVERSITY_DATABASE);

    request.onerror = function(event) {
        alert('Database error');
    }
    request.onsuccess = function(event) {
        var db = this.result;
        var transaction = db.transaction([DB_UNIVERSITY_STORE], 'readwrite');
        var objectStore = transaction.objectStore(DB_UNIVERSITY_STORE);

        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                var request = objectStore.get(cursor.key);
                request.onsuccess = function(event) {
                    var name = event.target.result.name;
                    var url = event.target.result.url;

                    addUrl(name, url, cursor.key);
                }
                cursor.continue();
            }
        }
    }
}

function openDB() {                     // DataBase open
    var db;
    var request = window.indexedDB.open(UNIVERSITY_DATABASE, DB_VERSION);

    // DB 새로 생성 or 버전 높을 때
    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore(DB_UNIVERSITY_STORE, { keyPath: 'dbid', autoIncrement: true });
    };
    // DB 생성 성공
    request.onsuccess = function (event) {
        db = this.result;
    };
    // DB 생성 오류
    request.onerror = function (event) {
        alert("indexedDB : ", event.target.errorCode);
    };
}

function addDB() {                      // 대학 링크 입력받는 함수, DataBase에서 삭제
    var name = document.getElementById("name").value;
    var inputValue = document.getElementById("Element").value;

    var request = window.indexedDB.open(UNIVERSITY_DATABASE);

    request.onerror = function(event) {
        alert('Database error');
    }
    request.onsuccess = function(event) {
        var link = {
            name: name,
            url: inputValue
        };

        var db = this.result;
        var transaction = db.transaction([DB_UNIVERSITY_STORE], 'readwrite');
        var objectStore = transaction.objectStore(DB_UNIVERSITY_STORE);

        var req = objectStore.add(link);

        req.onerror = function(event) {
            alert('Database error');
        }
        req.onsuccess = function(event) {
            addUrl(name, inputValue, event.target.result);
        }
    }
}
function delDB(number) {                // DataBase에서 삭제
    var request = window.indexedDB.open(UNIVERSITY_DATABASE);

    request.onerror = function(event) {
        alert('Database error');
    }
    request.onsuccess = function(event) {
        var db = this.result;
        var transaction = db.transaction([DB_UNIVERSITY_STORE], 'readwrite');
        var objectStore = transaction.objectStore(DB_UNIVERSITY_STORE);

        objectStore.delete(number);
    }
}

function addUrl(name, url, id) {            // 링크 추가 함수
    let addUrlTag = document.getElementById('addUrl');
    
    // 아래 세 객체를 포함한 태그 생성
    var newUrlTag = document.createElement('p');
    newUrlTag.setAttribute('id', id);

    // 대학 링크 추가
    let newUrl = document.createElement('a');
    newUrl.setAttribute('href', url);
    newUrl.setAttribute('target', 'blank');
    newUrl.innerHTML = name;

    // 삭제 버튼
    var delUrl = document.createElement('input');
    delUrl.setAttribute('type','button');
    delUrl.setAttribute('value','삭제');
    delUrl.onclick = function(){
        deleteUrl(id);
    }

    // 한 칸 띄어쓰기
    let newSpaceTag = document.createElement('a');
    newSpaceTag.innerHTML = "&nbsp;"
    

    newUrlTag.appendChild(newUrl);
    newUrlTag.appendChild(delUrl);
    newUrlTag.appendChild(newSpaceTag);

    addUrlTag.appendChild(newUrlTag);
}

function deleteUrl(number){                 // 링크 삭제 함수
    delDB(number);
    
    var delUrlTag = document.getElementById(number);
    var addUrlTag = delUrlTag.parentElement;
    addUrlTag.removeChild(delUrlTag);
}