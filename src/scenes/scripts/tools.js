

/**
 * Checks to see if browser is still online
 * @returns boolean of if browser is online
 */
function checkOnline(){
    return navigator.onLine
}


/**
 * Limits 2 decimal places and adds , on thousands mark
 * @param {number} x 
 * @returns formatted number
 */
 function editNumber(x) {
    x = Math.round(x * 100) / 100;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stopClicks(e) {
    e.stopPropagation();
}

function toggleHtmlClickable(value) {
    // const uiRoot = document.getElementById('uiRoot');
    if(!value) {
        console.log("stopping clicks")
        document.body.addEventListener("click", stopClicks);
        document.body.addEventListener("mousedown", stopClicks);

    }
    else {
        console.log("starting clicks")
        document.body.removeEventListener("click", stopClicks);
        document.body.removeEventListener("mousedown", stopClicks);

    }
    
    // if(value) {
        // for (const eventName of ['mouseup','mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']){
        //     uiRoot.addEventListener(eventName, e => 
        //         {
                    // if(value) {
                    //     console.log("stop propagation");
                    //     e.stopPropagation()
                    // } else {
                    //     console.log("start propagation");
                    //     e.cancelBubble = true;
                    // }
        //     });
        // }
    // }} else {
    //     for (const eventName of ['mouseup','mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']){
    //     // uiRoot.removeEventListener(eventName, e => e.stopPropagation());
    //     uiRoot.addEventListener(eventName, e => e.cancelBubble = true );
    //     const e = window.event;
    //     e.cancelBubble = true;
    // }
    // }
}

export { checkOnline, editNumber, toggleHtmlClickable };