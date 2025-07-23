let is24HourFormat = false;


function updateClock() {
    const now = new Date();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
  
    if (!is24HourFormat) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        document.querySelector('.timezone-info').innerHTML = `
            <div>Pakistan Standard Time (PKT) - ${ampm}</div>
            <div>UTC +5:00</div>
        `;
    } else {
        document.querySelector('.timezone-info').innerHTML = `
            <div>Pakistan Standard Time (PKT)</div>
            <div>UTC +5:00</div>
        `;
    }

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
 
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    updateDate();
}

function updateDate() {
    const now = new Date();
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
    ];
    
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    const day = days[now.getDay()];
    
    document.getElementById('date').textContent = `${month} ${date}, ${year}`;
    document.getElementById('day').textContent = day;
}

function toggleFormat(format24) {
    is24HourFormat = format24;
    

    document.getElementById('format12').classList.toggle('active', !format24);
    document.getElementById('format24').classList.toggle('active', format24);
  
    updateClock();
}

function addClickEffects() {
    document.querySelectorAll('.time-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}


function initializeClock() {
 
    updateClock();

    setInterval(updateClock, 1000);
   
    addClickEffects();
}


document.addEventListener('DOMContentLoaded', initializeClock);