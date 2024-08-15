/** @type {NodeListOf<HTMLDivElement>} */
const buttons = document.querySelectorAll('div#tool-btn-list > *');
/** @type {NodeListOf<HTMLDivElement>} */
const panels = document.querySelectorAll('div#tools > div[id$=panel]');

const resizer = document.getElementById('panel-resizer');

document.addEventListener('DOMContentLoaded', function(){
    panels.forEach(function(el){
        el.style.maxHeight = `${document.querySelector('main').computedStyleMap().get('height').value}px`;
    })

    window.addEventListener('resize', function(){
        panels.forEach(function(el){
            el.style.maxHeight = `${document.querySelector('main').computedStyleMap().get('height').value}px`;
        })
    })
})


function handlePanelResizing()
{
    let initialX = 0;
    let panelWidth = panels[0].computedStyleMap().get('width').value ?? 250;

    function updatePanelWidthVariable()
    {
        panelWidth = panels[0].computedStyleMap().get('width').value;

        if(panelWidth < 150)
        {
            for(let i=0; i<panels.length; i++)
            {
                panels[i].style.width = '250px';
                panels[i].setAttribute('aria-expanded', 'false');

                buttons[i].setAttribute('aria-selected', 'false');
            }

            resizer.style.display = 'none';
        }
    }

    /**     
     * @param {MouseEvent} e 
    */
    function resizeAmountHandler(e)
    {
        for(let i=0; i<panels.length; i++)
        {
            panels[i].style.width = `${Math.min(panelWidth + e.x - initialX, 400)}px`;
        }
    }
    
    resizer.addEventListener('mousedown', function(e){
        initialX = e.x;
        document.addEventListener('mousemove', resizeAmountHandler);
    }); 

    document.addEventListener('mouseup', function(){
        document.removeEventListener('mousemove', resizeAmountHandler);
        updatePanelWidthVariable();
    })
    window.addEventListener('focusout', function(){
        document.removeEventListener('mousemove', resizeAmountHandler);
        updatePanelWidthVariable();
    })
}

function handlePanelSwitching()
{
    for(let i=0; i<panels.length; i++)
    {
        buttons[i].addEventListener('click', function(){
            panels[i].setAttribute('aria-expanded', 'true');
            buttons[i].setAttribute('aria-selected', 'true');

            for(let j=0; j<panels.length; j++)
            {
                if(i==j) continue;
                
                panels[j].setAttribute('aria-expanded', 'false');
                buttons[j].setAttribute('aria-selected', 'false');
            }

            resizer.style.display = 'inline-block';
        })
    }
}

document.addEventListener('DOMContentLoaded', function(){
    handlePanelResizing();
    handlePanelSwitching();
})