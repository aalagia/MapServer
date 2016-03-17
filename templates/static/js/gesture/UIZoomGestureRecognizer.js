/* 

== FOR PINCH EVENT (TWO-POINT-TOUCH OR MOUSE SCROLL) ==

var zoomGestureRecognizer = new UIZoomGestureRecognizer(TargetViewController, ZoomEventHandler);

-- and in the TargetViewController:

data
{
    type: "zoom_started" .. etc
    zoom: curZoom
    zoomDelta: diff of curZoom and Last Frame Zoom
    zoomCenter:
}

function ZoomEventHandler(event)
{
    
    console.log(event.data.zoom);
    console.log(event.data.zoomDelta);
}
 */
var ZOOM_EVENT = {
    STARTED: "ZOOM_STARTED",
    ENDED: "ZOOM_ENDED",
    CHANGED: "ZOOM_CHANGED"
};

function ZOOM_EVENT_DATA (type){
    this.type = type;
    this.zoom;
    this.zoomDelta;
    this.distance;
    this.distanceDelta;
    this.zoomCenter;
    this.zoomCenterDelta;
    this.zoomCenterStart;
};


function UIZoomGestureRecognizer (viewcontroller,eventhandler)
{
    var self = this;
    UIGestureRecognizer.call(this,viewcontroller,eventhandler);
    self.startDistance = 0;
    self.lastDistance = 0;
    self.startZoom = 1;
    self.lastZoom = 1;
    self.lastZoomCenter = new POINT(0,0);
    self.isZooming = false;
    self.timeout;
    self.touches = new Array();

    self.curZoom = 1;
    
    
    self.addEvent = function()
    {
        //console.log("addEvent");
        if(self.isTouchDevice)
        {
            self.target.view.get(0).addEventListener("touchstart", self.touchStart, false);
            self.target.view.get(0).addEventListener("touchend", self.touchEnd, false);
            self.target.view.get(0).addEventListener("touchcancel", self.touchEnd, false);
            self.target.view.get(0).addEventListener("touchleave", self.touchEnd, false);
            self.target.view.get(0).addEventListener("touchmove", self.touchMove, false);
        }
        else 
        {
            self.target.view.on('mousewheel', self.handleMouse);
        }
    };
    
    self.handleMouse = function(e)
    {
        clearTimeout(self.timeout);
        
        var data = new ZOOM_EVENT_DATA(ZOOM_EVENT.CHANGED);
        self.curZoom += (e.originalEvent.wheelDelta/120)/100;
        data.zoom = self.curZoom;
        data.zoomDelta = data.zoom - self.lastZoom;
        data.zoomCenter = new POINT(e.originalEvent.pageX, e.originalEvent.pageY);
        
        if(!self.isZooming)
        {
            data.zoomCenterDelta  = new POINT(0,0);
            data.zoomCenterStart = data.zoomCenter;
        }
        else 
        {
            data.zoomCenterDelta = new POINT(e.originalEvent.pageX - self.lastZoomCenter.x, e.originalEvent.pageY - self.lastZoomCenter.y);
        }
        self.lastZoom = data.zoom;
        self.lastZoomCenter = data.zoomCenter;
        
        self.eventhandler(data);
        
        self.isZooming = true;
        self.timeout = setTimeout(self.handleMouseEnd, 50);
    };
    self.handleMouseEnd = function(e)
    {
        var data = new ZOOM_EVENT_DATA(ZOOM_EVENT.ENDED);
        data.zoom = self.lastZoom;
        data.zoomDelta = 0;
        data.zoomCenter = self.lastZoomCenter;
        data.zoomCenterDelta = new POINT(0,0);

        self.isZooming = false;
        
        self.eventhandler(data);
    };
    
    
    self.touchStart = function(e)
    {
        var data = new ZOOM_EVENT_DATA(ZOOM_EVENT.STARTED);
        var touches = e.changedTouches;

        for(var i = 0; i < touches.length; i++) {
            self.touches.push(copyTouch(touches[i]));
        }

        if(self.touches.length >= 2) {
            data.distance = getDistance(self.touches[0].pageX, self.touches[0].pageY, self.touches[1].pageX, self.touches[1].pageY);
            data.distanceDelta = 0;
            data.zoom = self.lastZoom;
            data.zoomDelta = 0;
            data.zoomCenter = new POINT((self.touches[1].pageX + self.touches[0].pageX)/2, (self.touches[1].pageY + self.touches[0].pageY)/2);
            data.zoomCenterDelta = new POINT(0,0);

            self.startDistance = data.distance;
            self.lastDistance = data.distance;
            self.startZoom = self.target.ScrollElement.scale.x;
            self.lastZoom = data.zoom;
            self.lastZoomCenter = data.zoomCenter;

            self.eventhandler(data);
        }
    };

    self.touchEnd = function(e)
    {
        var data = new ZOOM_EVENT_DATA(ZOOM_EVENT.ENDED);
        //console.log('touchEnd: ' + self.touches.length);
        var touches = e.changedTouches;

        if(self.touches.length >= 2) {
            //data.distance = getDistance(self.touches[0].pageX, self.touches[0].pageY, self.touches[1].pageX, self.touches[1].pageY);
            data.distanceDelta = self.lastDistance - self.startDistance;
            data.zoom = self.startZoom + data.distanceDelta*0.004;
            self.startZoom = data.zoom;
            self.lastZoom = data.zoom;
        }

        for(var i = 0; i < touches.length; i++) {
            var idx = ongoingTouchIndexById(touches[i].identifier);
            if(idx >= 0) {
                self.touches.splice(idx, 1);
            }
        }

        self.isZooming = false;

        self.eventhandler(data);
    };

    self.touchMove = function(e)
    {
        var data = new ZOOM_EVENT_DATA(ZOOM_EVENT.CHANGED);
        var touches = e.changedTouches;

        for(var i = 0; i < touches.length; i++) {
            var index = ongoingTouchIndexById(touches[i].identifier);

            if(index >= 0) {
                self.touches.splice(index, 1, copyTouch(touches[i]));
            }
        }

        if(self.touches.length >= 2) {
            var distance = getDistance(self.touches[0].pageX, self.touches[0].pageY, self.touches[1].pageX, self.touches[1].pageY);
            var dDelta = distance - self.startDistance;
            var newZoom = self.startZoom + dDelta*0.004;

            data.zoom = newZoom;
            data.zoomDelta = data.zoom - self.lastZoom;
            data.distanceDelta = dDelta;
            data.distance = distance;

            data.zoomCenter = new POINT((self.touches[1].pageX + self.touches[0].pageX)/2, (self.touches[1].pageY + self.touches[0].pageY)/2);

            if(!self.isZooming) {
                data.zoomCenterDelta = new POINT(0,0);
                self.isZooming = true;
            }
            else {
                data.zoomCenterDelta = new POINT(data.zoomCenter.x - self.lastZoomCenter.x, data.zoomCenter.y - self.lastZoomCenter.y);
            }

            self.lastDistance = data.distance;
            self.lastZoom = data.zoom;
            self.lastZoomCenter = data.zoomCenter;
            self.eventhandler(data);
        }
    };
    
    self.addEvent();

    function copyTouch(touch) {
      return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
    }

    function ongoingTouchIndexById(idToFind) {
      for (var i=0; i < self.touches.length; i++) {
        var id = self.touches[i].identifier;
        
        if (id == idToFind) {
          return i;
        }
      }
      return -1;    // not found
    }

    function getDistance(x1, y1, x2, y2) {
        var dx = x1-x2;
        var dy = y1-y2;
        return Math.sqrt((dx*dx)+(dy*dy));
    }
}



UIZoomGestureRecognizer.prototype = new UIGestureRecognizer();