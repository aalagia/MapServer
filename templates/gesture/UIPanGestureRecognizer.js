/* 
 
 == FOR PAN EVENT(ONE POINT TOUCH OR ONE POINT MOUSE DRAG) ==
 
 var panRecognizer = new UIPanGestureRecognizer(TargetViewController, PanEventHandler);
 
 -- And in the TargetViewController:
 
 function PanEventHandler(event)
 {
 console.log(event.data.position.x, event.data.position.y);
 }
 
 event will contain following data
 {
 type: PAN_EVENT_TYPES - "pan_started", "pan_moved" ..etc
 position:Point - current frame position
 delta_position:Point - difference between current frame position and last frame position
 }
 */

var PAN_EVENT = {
    STARTED: "PAN_START",
    ENDED: "PAN_END",
    CANCELED: "PAN_CANCEL",
    MOVED: "PAN_MOVE",
    SWIPE_LEFT: "SWIPE_LEFT",
    SWIPE_RIGHT: "SWIPE_RIGHT",
    SWIPE_UP: "SWIPE_UP",
    SWIPE_DOWN: "SWIPE_DOWN"
};

function PAN_EVENT_DATA(type) {
    this.type = type;
    this.position;
    this.delta_position;
}
;


function UIPanGestureRecognizer(viewcontroller, eventhandler)
{
    var self = this;
    UIGestureRecognizer.call(this, viewcontroller, eventhandler);

    self.isPanning = false;
    self.isSelected = false;
    self.lastPosition = new POINT(0, 0);
    self.lastGoodDelta = new POINT(0, 0);
    self.touch = null;
    
    self.startPosition = new POINT(0,0);

    self.addEvent = function()
    {
        if (self.isTouchDevice)
        {
            self.target.view.get(0).addEventListener("touchstart", self.handleTouch, false);
            self.target.view.get(0).addEventListener("touchend", self.handleTouch, false);
            self.target.view.get(0).addEventListener("touchcancel", self.handleTouch, false);
            self.target.view.get(0).addEventListener("touchleave", self.handleTouch, false);
            self.target.view.get(0).addEventListener("touchmove", self.handleTouch, false);
        }
        else
        {
            /* Create Handlers for Mouse */
            self.target.view.mousedown(self.handleMouse);
            self.target.view.mousemove(self.handleMouse);
            self.target.view.mouseleave(self.handleMouse);
            self.target.view.mouseup(self.handleMouse);
        }
    };
    self.handleMouse = function(e)
    {
        if (e.type == "mousedown")
            self.handleStart(e.pageX, e.pageY);
        else if (e.type == "mousemove")
            self.handleMove(e.pageX, e.pageY);
        else if (e.type == "mouseup")
            self.handleEnd(e.pageX, e.pageY);
        else if (e.type == "mouseleave")
            self.handleEnd(e.pageX, e.pageY);
    };



    self.handleTouch = function(e)
    {
        var touches = e.changedTouches;

        if (e.type == "touchstart" && self.touch == null) {
            self.touch = copyTouch(touches[0]);
        }
        else if (e.type == "touchmove" && self.touch != null) {
            for (var i = 0; i < touches.length; i++) {
                if (touches[i].identifier == self.touch.identifier) {
                    self.touch = copyTouch(touches[i]);
                    break;
                }
            }
        }

        if (self.touch != null) {
            if (e.type == "touchstart")
                self.handleStart(self.touch.pageX, self.touch.pageY);
            else if (e.type == "touchmove")
                self.handleMove(self.touch.pageX, self.touch.pageY);
            if (e.type == "touchend")
                self.handleEnd(self.touch.pageX, self.touch.pageY);
            else if (e.type == "touchleave")
                self.handleEnd(self.touch.pageX, self.touch.pageY);
            else if (e.type == "touchcancel")
                self.handleEnd(self.touch.pageX, self.touch.pageY);

            if (e.type == "touchend" || e.type == "touchleave" || e.type == "touchcancel") {
                self.touch = null;
            }
        }
    };


    self.handleStart = function(x, y)
    {
        var data = new PAN_EVENT_DATA(PAN_EVENT.STARTED);
        data.position = new POINT(x, y);
        data.delta_position = new POINT(0, 0);
        self.lastPosition = data.position;

        self.eventhandler(data);

        self.isSelected = true;
        self.isPanning = true;
        
        self.startPosition = data.position;
    };
    self.handleEnd = function(x, y)
    {
        if (self.isPanning)
        {
            var data = new PAN_EVENT_DATA(PAN_EVENT.ENDED);
            data.position = new POINT(x, y);
            data.delta_position = new POINT(data.position.x - self.lastPosition.x, data.position.y - self.lastPosition.y);
            if (data.delta_position.x == 0 && data.delta_position.y == 0)
                data.delta_position = self.lastGoodDelta;

            self.lastPosition = new POINT(0, 0);

            self.eventhandler(data);

            self.isSelected = false;
            self.isPanning = false;
            
            self.lastGoodDelta = new POINT(0, 0);
            
            
            if(Math.abs(Math.abs(self.startPosition.x) - Math.abs(data.position.x)) > 50)
            {
                var swipeData;
               
                if(self.startPosition.x < data.position.x)
                {
                    //swipe left
                    swipeData = new PAN_EVENT_DATA(PAN_EVENT.SWIPE_LEFT);
                }
                else if (self.startPosition.x > data.position.y)
                {
                    //swipe right
                    swipeData = new PAN_EVENT_DATA(PAN_EVENT.SWIPE_RIGHT);
                }
                self.eventhandler(swipeData);
            }
            else if(Math.abs(Math.abs(self.startPosition.y) - Math.abs(data.position.y)) > 50)
            {
                var swipeData;
                if(self.startPosition.y < data.position.y)
                {
                    //swipe down
                    swipeData = new PAN_EVENT_DATA(PAN_EVENT.SWIPE_DOWN);
                }
                else if (self.startPosition.y > data.position.y)
                {
                    //swipe top
                    swipeData = new PAN_EVENT_DATA(PAN_EVENT.SWIPE_UP);
                }
                self.eventhandler(swipeData);
            }
        }
    };
    self.handleCancel = function(x, y)
    {
        if (self.isPanning)
        {
        var data = new PAN_EVENT_DATA(PAN_EVENT.CANCELED);
        data.position = new POINT(x, y);
        data.delta_position = new POINT(data.position.x - self.lastPosition.x, data.position.y - self.lastPosition.y);


        self.lastPosition = new POINT(0, 0);

        self.eventhandler(data);
        self.isSelected = false;
        self.isPanning = false;
    }
    };
    self.handleMove = function(x, y)
    {
        if (self.isSelected)
        {
            var data = new PAN_EVENT_DATA(PAN_EVENT.MOVED);
            data.position = new POINT(x, y);
            //if(self.isPanning) data.delta_position = new POINT(0,0);
            data.delta_position = new POINT(data.position.x - self.lastPosition.x, data.position.y - self.lastPosition.y);
            if (data.delta_position.x != 0 && data.delta_position.y != 0)
                self.lastGoodDelta = data.delta_position;
            self.lastPosition = data.position;

            self.eventhandler(data);
            self.isPanning = true;
        }
    };

    self.addEvent();

    function copyTouch(touch) {
        return {identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY};
    }
}
UIPanGestureRecognizer.prototype = new UIGestureRecognizer();