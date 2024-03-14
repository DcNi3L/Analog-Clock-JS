const h = document.getElementById('hour');
const min = document.getElementById('minute');
const sec = document.getElementById('second');

function clockEngine() {
    const date = new Date();
    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();

    h.style.transform = `rotate(${30*hh+mm/2}deg)`;
    min.style.transform = `rotate(${mm*6}deg)`;
    sec.style.transform = `rotate(${6*ss}deg)`;
}

setInterval(clockEngine, 1000);