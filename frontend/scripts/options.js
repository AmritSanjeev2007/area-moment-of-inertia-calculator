document.getElementById('options-nav-opener').addEventListener('click', function(){ 
    document.getElementById('options-list').ariaExpanded = (!(document.getElementById('options-list').ariaExpanded=='true')).toString();
});