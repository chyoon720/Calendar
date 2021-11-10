document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'addEventButton, dayGridMonth, listMonth'
        },
        customButtons: {
            addEventButton: {
                text: 'add event',
                click: function() {
                    var titleStr = prompt('Enter a title');
                    var dateStr = prompt('Enter a date in YYYY-MM-DD format');
                    var title = new String(titleStr);
                    var date = new Date(dateStr + 'T00:00:00');

                    if (!isNaN(date.valueOf())) {
                        calendar.addEvent({
                            title: title,
                            start: date,
                            allDay: true
                        });
                    } else {
                        alert('invalid date.');
                    }
                }
            }
            
        }
    });
    calendar.render();
});