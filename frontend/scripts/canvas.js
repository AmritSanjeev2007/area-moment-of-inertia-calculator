const canvas = document.querySelector('svg');
/** @type {number[]} */
export let currentViewBox = [0, 0, canvas.getClientRects().item(0).width, canvas.getClientRects().item(0).height];
export class ViewBoxObserverEntry
{
    /** @type {(...args:any[])=>void} */
    listener=function(){};
    /** @type {any[]} */
    args=[];

    /**
     * @param {(...args:any[])=>void} listener 
     * @param  {...any} args 
     */
    constructor(listener, ...args)
    {
        this.listener=listener;
        this.args=[...args];
    }
}
/** @type {ViewBoxObserverEntry[]} */
const viewBoxObserverList = [];
/** @param {(...args:any[])=>void} listener */
export function addViewBoxObserver(listener, ...args){viewBoxObserverList.push(new ViewBoxObserverEntry(listener, ...args));}

/** @param {{x?:number,y?:number,w?:number,h?:number,dx?:number,dy?:number,dw?:number,dh?:number}|undefined} rect */
function updateCanvasViewBox(rect={})
{
    canvas.setAttribute('viewBox', `
        ${rect.dx ? (currentViewBox[0]+=rect.dx) : (currentViewBox[0] = rect.x??currentViewBox[0])} 
        ${rect.dy ? (currentViewBox[1]+=rect.dy) : (currentViewBox[1] = rect.y??currentViewBox[1])} 
        ${rect.dw ? (currentViewBox[2]+=rect.dw) : (currentViewBox[2] = rect.w??currentViewBox[2])} 
        ${rect.dh ? (currentViewBox[3]+=rect.dh) : (currentViewBox[3] = rect.h??currentViewBox[3])}`
    )

    viewBoxObserverList.forEach(v=>v.listener(...v.args));
}

function handleCanvasResize()
{
    updateCanvasViewBox();
    const resizeObserver = new ResizeObserver(function(entries){
        for(const entry of entries)
        {
            if(entry.target != canvas) continue;
            updateCanvasViewBox({w:entry.contentRect.width/currentCanvasZoom(),h:entry.contentRect.height/currentCanvasZoom()});
        }
    })
    
    resizeObserver.observe(canvas);
}


/** @type {null | ((this: SVGSVGElement, ev: MouseEvent) => any)} */
let movementHandler = null;
function handleCanvasMovement()
{
    canvas.addEventListener('mousedown', function(){
        canvas.addEventListener('mousemove', movementHandler=function(e){
            if(!e.shiftKey) return;

            let canvasRect = canvas.getClientRects().item(0);

            const horizontalPixelToViewBoxScalingFactor = currentViewBox[2]/canvasRect.width;
            const verticalPixelToViewBoxScalingFactor = currentViewBox[3]/canvasRect.height;
            updateCanvasViewBox({dx:-e.movementX*horizontalPixelToViewBoxScalingFactor,dy:-e.movementY*verticalPixelToViewBoxScalingFactor});
        })
    })
    
    window.addEventListener('mouseup', function(){
        canvas.removeEventListener('mousemove', movementHandler);
    })
    window.addEventListener('focus', function(){
        canvas.removeEventListener('mousemove', movementHandler);
    })
}

function handleCanvasCursorChange()
{
    window.addEventListener('keydown', function(e){
        if(e.key === 'Shift') canvas.style.cursor = 'all-scroll';
    })
    window.addEventListener('keyup', function(e){
        if(e.key === 'Shift') canvas.style.cursor = 'default';
    })
}


const ZOOM_COEFFICIENT_RATIO = 0.1;

let __zoomCounter=[0,0]; // [zoom out, zoom in]
const _ZOOM_OUT_CONST_=1/(1+ZOOM_COEFFICIENT_RATIO), _ZOOM_IN_CONST_=(1+ZOOM_COEFFICIENT_RATIO);
function handleCanvasZoom()
{
    canvas.addEventListener('wheel', function(e){
        if(!e.ctrlKey || (e.deltaY===0)) return;


        function calculateZoomRatio()
        {

            __zoomCounter[(Math.sign(e.deltaY)+1)>>1]++;
            return (Math.sign(e.deltaY)===-1) ? _ZOOM_OUT_CONST_ : _ZOOM_IN_CONST_;
                // expr ? zoom out : zoom in
        }

        let canvasRect = canvas.getClientRects().item(0);

        const horizontalPixelToViewBoxScalingFactor = currentViewBox[2]/canvasRect.width;
        const verticalPixelToViewBoxScalingFactor = currentViewBox[3]/canvasRect.height;
        
        let zoomRatio = calculateZoomRatio();
        updateCanvasViewBox({
            dx: (e.offsetX*horizontalPixelToViewBoxScalingFactor) * (1-zoomRatio),
            dy: (e.offsetY*verticalPixelToViewBoxScalingFactor) * (1-zoomRatio),
            w : currentViewBox[2] * zoomRatio,
            h : currentViewBox[3] * zoomRatio
        });
    })
}

export function currentCanvasZoom()
{
    return Math.pow(_ZOOM_OUT_CONST_, __zoomCounter[1]) * Math.pow(_ZOOM_IN_CONST_, __zoomCounter[0]);
}

document.addEventListener('DOMContentLoaded', function(){
    handleCanvasResize();
    handleCanvasCursorChange();
    handleCanvasMovement();
    handleCanvasZoom();
})