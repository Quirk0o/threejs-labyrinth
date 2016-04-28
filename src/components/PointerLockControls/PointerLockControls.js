import './lib/three.PointerLockControls'

export default function lockPointer(blocker) {
    
    return new Promise(function (resolve, reject) {
        let havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;

        if (havePointerLock) {
            var element = document.body;

            var pointerLockChange = function () {
                if (document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element) {

                    resolve();
                    blocker.hide();

                } else {
                    reject();
                    blocker.display();
                }
            };

            // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', pointerLockChange, false);
            document.addEventListener('mozpointerlockchange', pointerLockChange, false);
            document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

            document.addEventListener('pointerlockerror', blocker.display, false);
            document.addEventListener('mozpointerlockerror', blocker.display, false);
            document.addEventListener('webkitpointerlockerror', blocker.display, false);

            blocker.click(function () {
                blocker.hide();

                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

                if (/Firefox/i.test(navigator.userAgent)) {

                    let fullScreenChange = function () {
                        if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                            document.removeEventListener('fullscreenchange', fullScreenChange);
                            document.removeEventListener('mozfullscreenchange', fullScreenChange);

                            element.requestPointerLock();
                        }
                    };

                    document.addEventListener('fullscreenchange', fullScreenChange, false);
                    document.addEventListener('mozfullscreenchange', fullScreenChange, false);

                    element.requestFullscreen = element.requestFullscreen ||
                        element.mozRequestFullscreen ||
                        element.mozRequestFullScreen ||
                        element.webkitRequestFullscreen;
                    element.requestFullscreen();

                } else {
                    element.requestPointerLock();
                }

            }, false);

        } else {
            blocker.instructions = 'Your browser doesn\'t seem to support Pointer Lock API';
            blocker.render();
        }
    });
}