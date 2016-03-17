var SCROLL_TYPE = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    BOTH: 2,
    SCALABLE: 3
};

/*Parameters for Panning Scrollview*/
function SCROLLVIEW_PAN_PARAMS()
{
    var self = this;
    self.Dragging = false;
    self.DeltaPosition = new POINT(0, 0);
    self.Velocity = new POINT(0, 0);
    self.isDecelerating = false;

    self.Acceleration = 0.08;
    self.Deceleration = 0.03;

    self.Friction = 0.95;
    self.MinimumVelocity = 0.05;
}
;

/*Parameters for Zooming Scrollview*/
function SCROLLVIEW_ZOOM_PARAMS()
{
    var self = this;
    self.MinimumScale = 0.5;
    self.MaximumScale = 2.5;
    self.Velocity = 0;
    self.OffsetDelta = new POINT(0, 0);
    self.isDecelerating = false;
    self.ZoomPosition = new POINT(0, 0);

    self.MinimumVelocity = 0.005;
    self.Friction = 0.92;
}
;


function UIScrollViewController(rect, scrollElement)
{
    var self = this;
    UIViewController.call(this, rect);

    self.ScrollElement = scrollElement;
    self.addChild(self.ScrollElement);

    self.isEnabled = true;
    self.zooming = false;
    self.zoomWidth = self.ScrollElement.rect.w;
    self.zoomHeight = self.ScrollElement.rect.h;

    self.Acceleration = 1.2;
    self.SCROLL_TYPE = SCROLL_TYPE.SCALABLE;

    self.PAN_PARAMS = new SCROLLVIEW_PAN_PARAMS();
    self.ZOOM_PARAMS = new SCROLLVIEW_ZOOM_PARAMS();

    self.minPoint = new POINT((self.rect.w - self.zoomWidth) / 2, (self.rect.h - self.zoomHeight) / 2);
    self.maxPoint = new POINT(0, 0);

    self.prevPos = new POINT(0, 0);
    
    self.PanEventListener = null;

    self.reinit = function()
    {
        if (self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
        {
            self.zoomWidth = self.ScrollElement.rect.w;
            self.zoomHeight = self.ScrollElement.rect.h;
            self.minPoint = new POINT((self.rect.w - self.zoomWidth) / 2, (self.rect.h - self.zoomHeight) / 2);
            self.maxPoint = new POINT(-(self.rect.w - self.zoomWidth) / 2, -(self.rect.h - self.zoomHeight) / 2);
        }
        else
        {
            self.minPoint = new POINT(self.rect.w - self.ScrollElement.rect.w, self.rect.h - self.ScrollElement.rect.h);
            self.maxPoint = new POINT(0, 0);
        }
    };


    self.PanEventHandler = function(e)
    {
        if (self.isEnabled && !self.zooming)
        {
            if (e.type == PAN_EVENT.MOVED)
            {
                self.decel = false;
                self.PAN_PARAMS.Dragging = true;
                self.PAN_PARAMS.DeltaPosition = e.delta_position;
                self.PAN_PARAMS.isDecelerating = false;

                if (self.SCROLL_TYPE == SCROLL_TYPE.HORIZONTAL || self.SCROLL_TYPE == SCROLL_TYPE.BOTH || self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
                    self.ScrollElement.rect.x += self.PAN_PARAMS.DeltaPosition.x;
                if (self.SCROLL_TYPE == SCROLL_TYPE.VERTICAL || self.SCROLL_TYPE == SCROLL_TYPE.BOTH || self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
                    self.ScrollElement.rect.y += self.PAN_PARAMS.DeltaPosition.y;
            }
            else if (e.type = PAN_EVENT.ENDED || e.type == PAN_EVENT.CANCELLED)
            {
                self.PAN_PARAMS.Dragging = false;
                self.PAN_PARAMS.Velocity = new POINT(e.delta_position.x / self.Acceleration, e.delta_position.y / self.Acceleration);
                self.PAN_PARAMS.DeltaPosition = new POINT(0, 0);
                self.PAN_PARAMS.isDecelerating = true;
            }
        }
    };

    self.ZoomEventHandler = function(e)
    {
        if (self.isEnabled && self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
        {
            if (e.type == ZOOM_EVENT.CHANGED)
            {
                self.decel = false;
                self.zooming = true;
                self.ZOOM_PARAMS.isDecelerating = false;
                self.PAN_PARAMS.isDecelerating = false;

                var prevZoomWidth = self.zoomWidth;
                var prevZoomHeight = self.zoomHeight;

                self.ZOOM_PARAMS.ZoomPosition.x = e.zoomCenter.x - self.rect.x - self.ScrollElement.rect.x - self.zoomWidth / 2 + (self.zoomWidth - self.rect.w) / 2;
                self.ZOOM_PARAMS.ZoomPosition.y = e.zoomCenter.y - self.rect.y - self.ScrollElement.rect.y - self.zoomHeight / 2 + (self.zoomHeight - self.rect.h) / 2;

                var minMaxDiff = (e.zoom < self.ZOOM_PARAMS.MinimumScale) ? (e.zoom - self.ZOOM_PARAMS.MinimumScale) * 0.9
                        : ((e.zoom > self.ZOOM_PARAMS.MaximumScale) ? (e.zoom - self.ZOOM_PARAMS.MaximumScale) : 0) * 0.7;

                self.setScale(e.zoom - minMaxDiff);

                var zoomOffset = self.calcZoomOffset(new POINT(prevZoomWidth, prevZoomHeight), new POINT(self.zoomWidth, self.zoomHeight));

                self.ScrollElement.rect.x += e.zoomCenterDelta.x - zoomOffset.x;
                self.ScrollElement.rect.y += e.zoomCenterDelta.y - zoomOffset.y;
            }
            else if (e.type == ZOOM_EVENT.ENDED)
            {
                self.ZOOM_PARAMS.Velocity = 0;
                self.ZOOM_PARAMS.isDecelerating = true;
                self.PAN_PARAMS.isDecelerating = true;
                self.zooming = false;
            }
        }
    };

    self.Update = function() {
        requestAnimFrame(self.Update);
        if (self.ZOOM_PARAMS.isDecelerating == true)
            self.handleZoomDeceleration();
        if (self.PAN_PARAMS.isDecelerating == true)
            self.handlePanDeceleration();
        self.ScrollElement.setRect();
    }


    /*PAN ANIMATION*/
    self.handlePanDeceleration = function()
    {
        var NewPosition = new POINT(self.ScrollElement.rect.x + self.PAN_PARAMS.Velocity.x, self.ScrollElement.rect.y + self.PAN_PARAMS.Velocity.y);

        if (self.SCROLL_TYPE == SCROLL_TYPE.HORIZONTAL || self.SCROLL_TYPE == SCROLL_TYPE.BOTH || self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
            self.ScrollElement.rect.x = NewPosition.x;
        if (self.SCROLL_TYPE == SCROLL_TYPE.VERTICAL || self.SCROLL_TYPE == SCROLL_TYPE.BOTH || self.SCROLL_TYPE == SCROLL_TYPE.SCALABLE)
            self.ScrollElement.rect.y = NewPosition.y;

        var Bounce = self.getBounce(NewPosition);
        if (Bounce.x != 0) {
            if (Bounce.x * self.PAN_PARAMS.Velocity.x <= 0)
                self.PAN_PARAMS.Velocity.x += Bounce.x * self.PAN_PARAMS.Deceleration;
            else
                self.PAN_PARAMS.Velocity.x = Bounce.x * self.PAN_PARAMS.Acceleration;
        }
        if (Bounce.y != 0) {
            if (Bounce.y * self.PAN_PARAMS.Velocity.y <= 0)
                self.PAN_PARAMS.Velocity.y += Bounce.y * self.PAN_PARAMS.Deceleration;
            else
                self.PAN_PARAMS.Velocity.y = Bounce.y * self.PAN_PARAMS.Acceleration;
        }


        self.PAN_PARAMS.Velocity.x *= self.PAN_PARAMS.Friction;
        self.PAN_PARAMS.Velocity.y *= self.PAN_PARAMS.Friction;

        if (Math.abs(self.PAN_PARAMS.Velocity.x) <= self.PAN_PARAMS.MinimumVelocity &&
                Math.abs(self.PAN_PARAMS.Velocity.y) <= self.PAN_PARAMS.MinimumVelocity)
            self.PAN_PARAMS.isDecelerating = false;
        
        if(self.PanEventListener != null)
        {
            self.PanEventListener(NewPosition);
        }
    };

    self.getBounce = function(NewPosition)
    {
        var Bounce = new POINT(0, 0);
        if (self.zoomWidth < self.rect.w)
            Bounce.x = 0 - NewPosition.x;
        else if (NewPosition.x < self.minPoint.x)
            Bounce.x = self.minPoint.x - NewPosition.x;
        else if (NewPosition.x > self.maxPoint.x)
            Bounce.x = self.maxPoint.x - NewPosition.x;

        if (self.zoomHeight < self.rect.h)
            Bounce.y = 0 - NewPosition.y;
        else if (NewPosition.y < self.minPoint.y)
            Bounce.y = self.minPoint.y - NewPosition.y;
        else if (NewPosition.y > self.maxPoint.y)
            Bounce.y = self.maxPoint.y - NewPosition.y;

        return Bounce;
    };

    self.scrollTo = function(NewPosition,animate)
    {
        if(animate)
        {
            TweenLite.to(self.ScrollElement.view, 0.5, {x:NewPosition.x, y:NewPosition.y, overwrite:false,onComplete: self.ScrollComplete, onCompleteParams: [NewPosition]});
        }
        else 
        {
            self.ScrollElement.rect.x = NewPosition.x;
            self.ScrollElement.rect.y = NewPosition.y;
            self.ScrollElement.setRect();
        }
    };
    self.ScrollComplete = function(NewPosition)
    {
        self.ScrollElement.rect.x = NewPosition.x;
        self.ScrollElement.rect.y = NewPosition.y;
    };

    /*ZOOM ANIMATION*/
    self.handleZoomDeceleration = function()
    {
        var NewZoom = self.ScrollElement.scale.x + self.ZOOM_PARAMS.Velocity;

        var ZoomDifferenceToMinMax = 0;
        if (NewZoom < self.ZOOM_PARAMS.MinimumScale)
            ZoomDifferenceToMinMax = self.ZOOM_PARAMS.MinimumScale - NewZoom;
        else if (NewZoom > self.ZOOM_PARAMS.MaximumScale)
            ZoomDifferenceToMinMax = self.ZOOM_PARAMS.MaximumScale - NewZoom;

        if (ZoomDifferenceToMinMax != 0) {
            self.ZOOM_PARAMS.Velocity = ZoomDifferenceToMinMax * 0.1;
        }

        self.ZOOM_PARAMS.OffsetDelta = self.calcZoomOffset(new POINT(self.zoomWidth, self.zoomHeight), new POINT(self.ScrollElement.rect.w * NewZoom, self.ScrollElement.rect.h * NewZoom));

        self.ScrollElement.rect.x -= self.ZOOM_PARAMS.OffsetDelta.x;
        self.ScrollElement.rect.y -= self.ZOOM_PARAMS.OffsetDelta.y;

        self.setScale(NewZoom);

        if (Math.abs(self.ZOOM_PARAMS.Velocity) < 0.0001) {
            self.ZOOM_PARAMS.isDecelerating = false;
            self.ZOOM_PARAMS.OffsetDelta = new POINT(0, 0);
            if (self.ZOOM_PARAMS.Velocity < 0) {
                self.setScale(self.ZOOM_PARAMS.MaximumScale);
            }
            else if (self.ZOOM_PARAMS.Velocity > 0) {
                self.setScale(self.ZOOM_PARAMS.MinimumScale);
            }
            self.ZOOM_PARAMS.Velocity = 0;
        }
    };

    self.calcZoomOffset = function(prevZoom, newZoom) {
        var dx = (self.ZOOM_PARAMS.ZoomPosition.x + prevZoom.x / 2) / prevZoom.x;
        var dy = (self.ZOOM_PARAMS.ZoomPosition.y + prevZoom.y / 2) / prevZoom.y;

        var difx = (newZoom.x - prevZoom.x);
        var ddx = (dx * difx) - difx / 2;

        var dify = (newZoom.y - prevZoom.y);
        var ddy = (dy * dify) - dify / 2;

        return new POINT(ddx, ddy);
    };

    self.setScale = function(newScale) {
        self.ScrollElement.scale.x = newScale;
        self.ScrollElement.scale.y = newScale;
        self.zoomRecognizer.curZoom = newScale;
        self.zoomWidth = self.ScrollElement.rect.w * self.ScrollElement.scale.x;
        self.zoomHeight = self.ScrollElement.rect.h * self.ScrollElement.scale.y;

        self.minPoint = new POINT(Math.min((self.rect.w - self.zoomWidth) / 2, 0), Math.min((self.rect.h - self.zoomHeight) / 2, 0));
        self.maxPoint = new POINT(Math.max(-(self.rect.w - self.zoomWidth) / 2, 0), Math.max(-(self.rect.h - self.zoomHeight) / 2, 0));
    };
    
    self.Update();
    /*Add Event Listeners to Self*/

    self.panRecognizer = new UIPanGestureRecognizer(self, self.PanEventHandler);
    self.zoomRecognizer = new UIZoomGestureRecognizer(self, self.ZoomEventHandler);
}
UIScrollViewController.prototype = new UIViewController();
