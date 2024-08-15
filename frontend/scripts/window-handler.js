function handleWindowReload()
{
    document.getElementById('reload').addEventListener('click', function(){ window.electronAPI.sendMessage('window-reload'); })
}

function handleWindowClose()
{
    document.getElementById('close').addEventListener('click', function(){window.close();})
}

let ismoving = false;
function handleWindowMove()
{
    document.querySelector('header').addEventListener('mousedown', function(e){
        if(!ismoving) window.electronAPI.sendMessage('window-move');
        ismoving = true;
    });

    window.addEventListener('mouseup', function(){
        if(ismoving) window.electronAPI.sendMessage('window-nomove');
        ismoving=false;
    })
    window.addEventListener('focusout', function(){
        if(ismoving) window.electronAPI.sendMessage('window-nomove');
        ismoving=false;
    })
    window.addEventListener('focus', function(){
        if(ismoving) window.electronAPI.sendMessage('window-nomove');
        ismoving=false;
    })
}

function handleWindowMinimize()
{
    document.getElementById('minimize').addEventListener('click', function(){window.electronAPI.sendMessage('window-minimize');})
}

function handleWindowMaximizeAndWindowed()
{
    document.getElementById('windowed').addEventListener('click', function(){
        window.electronAPI.sendMessage('window-handle-maximize');
        window.electronAPI.postMessage('window-is-maximized').then(function(isMaximized){
            document.getElementById('windowed').setAttribute('data-maximized', isMaximized?"true":"false")
        })
    })

    window.addEventListener('resize', function(e){
        window.electronAPI.postMessage('window-is-maximized').then(function(isMaximized){
            document.getElementById('windowed').setAttribute('data-maximized', isMaximized?"true":"false")
        });
    })

    document.querySelector('header').addEventListener('dblclick', function(e){
        window.electronAPI.sendMessage('window-handle-maximize');
    });
}

document.addEventListener('DOMContentLoaded', function(){
    handleWindowReload();
    handleWindowClose();
    handleWindowMove();
    handleWindowMaximizeAndWindowed();
    handleWindowMinimize();
})