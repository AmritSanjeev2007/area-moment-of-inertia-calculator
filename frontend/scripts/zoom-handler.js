/**
 * Clamps the provided number `x` within the range `[min,max]`. Returns `x` if `min<x<max` else returns `max` if `x>max` or `min` if 'x<min'.
 * @param {number} x The number to clamp.
 * @param {number} min The lower bound of the range.
 * @param {number} max The higher bound of the range.
 * @returns {number} The clamped number.
 */
function clamp(x, min, max)
{
    return Math.min(Math.max(x,min),max);
}

/**@type {HTMLInputElement}*/const zoomInput = document.getElementById('current-zoom');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

const mainContent = document.querySelector('main');

function changeContentZoom_Percent(newzoom=100)
{
    document.querySelectorAll('main *[data-zoomable=true]').forEach(function(el){
        el.style.zoom = `${newzoom}%`;
    })
    zoomInput.value = `${newzoom}%`;
}

let currentZoomPercent = 100;

zoomInBtn.addEventListener('click', function(){ changeContentZoom_Percent(currentZoomPercent=Math.min(currentZoomPercent+10, 150)); });
zoomOutBtn.addEventListener('click', function(){ changeContentZoom_Percent(currentZoomPercent=Math.max(currentZoomPercent-10,50)); });

zoomInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') {
        changeContentZoom_Percent(currentZoomPercent=clamp(parseInt(this.value),50,150));
        document.documentElement.focus();
    }
})
zoomInput.addEventListener('focusout', function(){
    changeContentZoom_Percent(currentZoomPercent=clamp(parseInt(this.value),50,150));
})