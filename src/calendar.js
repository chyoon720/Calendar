const CALENDAR_DATABASE = 'calendarDB';
const DB_VERSION = 1;
const DB_EVENT_STORE = 'event';
const OPEN = 1;
const ADD = 2;
const DELETE = 3;
const LOAD = 4;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'addEventButton, delEventButton, dayGridMonth, listMonth, DdayEventButton'
        },
        customButtons: {
            addEventButton: {       // 일정 추가
                text: 'add',
                click: function() {
                    // 일정 입력
                    var dateStr = prompt('Enter a date in YYYY-MM-DD format\nEx. 2021-11-19');
                    var timeStr = prompt('Enter a time in HH:MM\nEx. 15:00');
                    var date = new Date(dateStr + 'T' + timeStr);
                    var titleStr = prompt('Enter a title');
                    var title = new String(titleStr);

                    // 일정 추가
                    if (canAddEvent(date, title)) {
                        var calEvent = {
                            id: title,
                            title: title,
                            start: date,
                            allDay: false
                        };

                        calendar.addEvent(calEvent);
                        useDB(ADD, calEvent);
                    }
                }
            },
            delEventButton: {       // 일정 삭제
                text: 'del',
                click: function() {
                    var titleStr = prompt('Enter a title to delete');
                    calendar.getEventById(titleStr).remove();
                    useDB(DELETE, titleStr);
                }
            },
            DdayEventButton: {
                text: 'D-day',
                click: function(){
                    var arrevents = calendar.getEvents();
                    let addTag = document.getElementById('d-day');
                    while (addTag.hasChildNodes()) {
                        addTag.removeChild(addTag.firstChild);
                    }
                    for(var i=0; i < arrevents.length; i++){
                        var newTag = document.createElement('p');
                        newTag.innerHTML = arrevents[i].title + " is " + moment(arrevents[i].start).fromNow();
                        addTag.appendChild(newTag);
                    }
                    if (addTag.style.display == 'block') {
                        addTag.style.display = 'none';
                    } else {
                        addTag.style.display = 'block';
                    }
                }
            }
        },
    });
    calendar.render();
    openDB();

    // 일정 불러오기
    useDB(LOAD);


    // function openDB()
    // function useDB()
    // function canAddEvent()

    function openDB() {         // DataBase open
        if (!window.indexedDB) {        // indexedDB 지원 여부 확인
            window.alert("browser doesn't support indexedDB");
        } else {
            var db;
            var request = window.indexedDB.open(CALENDAR_DATABASE, DB_VERSION);

            // DataBase 새로 생성 or 버전 높을 때
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                var objectStore = db.createObjectStore(DB_EVENT_STORE, { keyPath: 'dbid', autoIncrement: true });
            };
            // DataBase 생성 성공
            request.onsuccess = function (event) {
                db = this.result;
            };
            // DataBase 생성 오류
            request.onerror = function (event) {
                alert("indexedDB : ", event.target.errorCode);
            };
        }
    }
    function useDB(command, value = null) { // DataBase 추가, 삭제, 불러오기
        var request = window.indexedDB.open(CALENDAR_DATABASE);
    
        request.onerror = function(event) {
            alert('Database error');
        }
        request.onsuccess = function(event) {
            var db = this.result;
            var transaction = db.transaction([DB_EVENT_STORE], 'readwrite');
            var objectStore = transaction.objectStore(DB_EVENT_STORE);
    
            if (command == ADD) {           // DataBase에 추가
                objectStore.add(value);
            } else {
                objectStore.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    switch(command) {
                    case DELETE:            // DataBase에 삭제
                        if (cursor) {
                            var request = objectStore.get(cursor.key);
                            request.onsuccess = function(event) {
                                if (value == event.target.result.id) {
                                    objectStore.delete(cursor.key);
                                }
                            }
                            cursor.continue();
                        }
                        break;
                    case LOAD:              // DataBase 불러오기
                        if (cursor) {
                            var request = objectStore.get(cursor.key);
                            request.onsuccess = function(event) {
                                var calEvent = {
                                    id: event.target.result.id,
                                    title: event.target.result.title,
                                    start: event.target.result.start,
                                    allDay: event.target.result.allDay
                                };
        
                                calendar.addEvent(calEvent);
                            }
                            cursor.continue();
                        }
                        break;
                    default:
                        break;
                    }
                }
            }
        }
    }
    function canAddEvent(date, title) {     // 캘린더에 추가 가능한지 확인
        if (isNaN(date.valueOf())) {
            alert('invalid date');              // 입력 오류
            return false;
        }

        var arrEvents = calendar.getEvents();

        for (var i = 0; i < arrEvents.length; i++) {
            if (date.getTime() == arrEvents[i].start.getTime()) {
                alert('Same date exists.');     // 날짜 중복
                return false;
            } else if (title == arrEvents[i].title) {
                alert('Same title exists.');    // 이름 중복
                return  false;
            }
        }

        return true;                            // 추가 가능
    }
});