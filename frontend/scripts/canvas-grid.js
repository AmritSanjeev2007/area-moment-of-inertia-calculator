import { currentViewBox, currentCanvasZoom, addViewBoxObserver } from "./canvas.js";

const canvas = document.querySelector('svg');
const namespace_uri = 'http://www.w3.org/2000/svg';

const initialViewBoxSize = [canvas.getClientRects().item(0).width, canvas.getClientRects().item(0).height];

const Point2D = function(/**@type {number|0}*/x=0,/**@type {number|0}*/y=0) { this.x=x; this.y=y; }
let center = new Point2D(initialViewBoxSize[0]/2, initialViewBoxSize[1]/2);

function drawOrigin()
{
    /**@type {SVGCircleElement|undefined}*/let origin;
    canvas.append(origin=document.createElementNS(namespace_uri, 'circle'));
    origin.setAttribute('cx', center.x.toString()); origin.setAttribute('cy', center.y.toString());
    addViewBoxObserver(function(){origin.setAttribute('r', (2/currentCanvasZoom()).toString())});
    origin.setAttribute('fill', 'black');
}

function drawLine(x0,y0,x1,y1)
{
    /**@type {SVGLineElement|undefined}*/let line;
    canvas.append(line=document.createElementNS(namespace_uri, 'line'));
    if(x0&&y0&&x1&&x2){
        line.setAttribute('y1', y0); line.setAttribute('x1', x0);
        line.setAttribute('y2', y1); line.setAttribute('x2', x1);
    }
    line.setAttribute('stroke-width', (1.25/currentCanvasZoom()).toString());
    line.setAttribute('stroke', '#999999');
    return line;
}
function setLineEndPoints(/**@type {SVGLineElement}*/line,x0,y0,x1,y1)
{
    line.setAttribute('y1', y0); line.setAttribute('x1', x0);
    line.setAttribute('y2', y1); line.setAttribute('x2', x1);
    line.setAttribute('stroke-width', (1/currentCanvasZoom()).toString());
}


function drawText(txt, x, y, styles={})
{
    /**@type {SVGTextElement|undefined}*/let text;
    canvas.append(text=document.createElementNS(namespace_uri, 'text'));
    if(txt&&x&&y)
    {
        text.setAttribute('x', x.toString()); text.setAttribute('y', y.toString());
        text.append(txt);
    }
    text.setAttribute('style', 'user-select:none;');
    return text;
}
/**
 * @param {SVGTextElement} textEl 
 * @param {string} txt 
 * @param {number} x 
 * @param {number} y 
 */
function updateText(textEl, txt, x, y)
{
    textEl.setAttribute('x', x.toString()); textEl.setAttribute('y', y.toString());
    textEl.replaceChildren(txt);
}
function updateTextFont(textEl, newSize)
{
    textEl.setAttribute('font-size', `${newSize}`)
}

const verticalLines=new Array(50).fill().map(drawLine), horizontalLines=new Array(30).fill().map(drawLine);
const verticalLinesMinor=new Array(200).fill().map(drawLine), horizontalLinesMinor=new Array(120).fill().map(drawLine);

const verticalAxisText = new Array(50).fill().map(v=>drawText('',0,0)), 
    horizontalAxisText = new Array(30).fill().map(v=>drawText('',0,0));

const unitSize = 70;

let __currentUnitMultiplier=1, __counter=0;
/** @param {{minor?:boolean,text?:boolean}} options */
function drawGridLines(options={})
{
    if(!options.minor) 
    {
        verticalLinesMinor.forEach(l=>l.setAttribute('stroke', 'none'));
        horizontalLinesMinor.forEach(l=>l.setAttribute('stroke', 'none'));
    } else {
        verticalLinesMinor.forEach(l=>l.setAttribute('stroke', '#cccccc'));
        horizontalLinesMinor.forEach(l=>l.setAttribute('stroke', '#cccccc'));
    }

    let m = Math.floor(Math.abs(__counter/3))+1;
    if(1/currentCanvasZoom() > 0.5*__currentUnitMultiplier)
    {
        __currentUnitMultiplier = [2,5,10].at(__counter%3)*Math.pow(10, Math.floor(__counter/3));
        __counter++;
    }
    else if(1/currentCanvasZoom() < 0.25*__currentUnitMultiplier)
    {
        __currentUnitMultiplier = [2,5,10].at(__counter%3)*Math.pow(10, Math.floor(__counter/3));
        __counter--;
    }

    const multipliedUnitSize = (__currentUnitMultiplier*unitSize);

    let icny = (Math.floor((currentViewBox[1]-center.y)/multipliedUnitSize)-2);
    let icnx = (Math.floor((currentViewBox[0]-center.x)/multipliedUnitSize)-2);

    let yStart = icny*multipliedUnitSize;
    let xStart = icnx*multipliedUnitSize;

    let yacc=yStart;
    let y=0, ytxt=0;
    for(const horizontalLine of horizontalLines)
    {
        setLineEndPoints(horizontalLine, currentViewBox[0], yacc+center.y, currentViewBox[0]+currentViewBox[2], yacc+center.y);
        if(options.minor)
        {
            setLineEndPoints(horizontalLinesMinor[y++], currentViewBox[0], yacc+center.y+(0.2*multipliedUnitSize), currentViewBox[0]+currentViewBox[2], yacc+center.y+(0.2*multipliedUnitSize));
            setLineEndPoints(horizontalLinesMinor[y++], currentViewBox[0], yacc+center.y+(0.4*multipliedUnitSize), currentViewBox[0]+currentViewBox[2], yacc+center.y+(0.4*multipliedUnitSize));
            setLineEndPoints(horizontalLinesMinor[y++], currentViewBox[0], yacc+center.y+(0.6*multipliedUnitSize), currentViewBox[0]+currentViewBox[2], yacc+center.y+(0.6*multipliedUnitSize));
            setLineEndPoints(horizontalLinesMinor[y++], currentViewBox[0], yacc+center.y+(0.8*multipliedUnitSize), currentViewBox[0]+currentViewBox[2], yacc+center.y+(0.8*multipliedUnitSize));
        }
        if(options.text) {
            updateText(verticalAxisText[ytxt], ((icny+ytxt)*-__currentUnitMultiplier).toPrecision(m), center.x+(8/currentCanvasZoom()), yacc+center.y-(2/currentCanvasZoom()));
            updateTextFont(verticalAxisText[ytxt++], 13/currentCanvasZoom())
        }
        yacc+=multipliedUnitSize;
    }

    let xacc=xStart;
    let x=0, xtxt=0;
    for(const verticalLine of verticalLines)
    {
        setLineEndPoints(verticalLine, xacc+center.x, currentViewBox[1], xacc+center.x, currentViewBox[1]+currentViewBox[3]);
        if(options.minor)
        {
            setLineEndPoints(verticalLinesMinor[x++], xacc+center.x+(0.2*multipliedUnitSize), currentViewBox[1], xacc+center.x+(0.2*multipliedUnitSize), currentViewBox[1]+currentViewBox[3]);
            setLineEndPoints(verticalLinesMinor[x++], xacc+center.x+(0.4*multipliedUnitSize), currentViewBox[1], xacc+center.x+(0.4*multipliedUnitSize), currentViewBox[1]+currentViewBox[3]);
            setLineEndPoints(verticalLinesMinor[x++], xacc+center.x+(0.6*multipliedUnitSize), currentViewBox[1], xacc+center.x+(0.6*multipliedUnitSize), currentViewBox[1]+currentViewBox[3]);
            setLineEndPoints(verticalLinesMinor[x++], xacc+center.x+(0.8*multipliedUnitSize), currentViewBox[1], xacc+center.x+(0.8*multipliedUnitSize), currentViewBox[1]+currentViewBox[3]);
        }
        if(options.text) {
            updateText(horizontalAxisText[xtxt], ((icnx+xtxt)*__currentUnitMultiplier).toPrecision(m), xacc+center.x+(2/currentCanvasZoom()), center.y+(15/currentCanvasZoom()));
            updateTextFont(horizontalAxisText[xtxt++], 13/currentCanvasZoom())
        }
        xacc+=multipliedUnitSize;
    }
}

const xAxis=document.createElementNS(namespace_uri, 'line'), yAxis=document.createElementNS(namespace_uri, 'line');
function drawAxes()
{
    canvas.append(xAxis);
    xAxis.setAttribute('x1', currentViewBox[0].toString()); xAxis.setAttribute('y1', center.y.toString());
    xAxis.setAttribute('x2', (currentViewBox[0]+currentViewBox[2]).toString()); xAxis.setAttribute('y2', center.y.toString());
    xAxis.setAttribute('stroke-width', (1.5/currentCanvasZoom()).toString());
    xAxis.setAttribute('stroke', 'black');

    canvas.append(yAxis);
    yAxis.setAttribute('y1', currentViewBox[1].toString()); yAxis.setAttribute('x1', center.x.toString());
    yAxis.setAttribute('y2', (currentViewBox[1]+currentViewBox[3]).toString()); yAxis.setAttribute('x2', center.x.toString());
    yAxis.setAttribute('stroke-width', (1.5/currentCanvasZoom()).toString());
    yAxis.setAttribute('stroke', 'black');
}


document.addEventListener('DOMContentLoaded', function(){
    drawOrigin();
    addViewBoxObserver(drawGridLines, {minor: true, text: true});
    addViewBoxObserver(drawAxes);
})