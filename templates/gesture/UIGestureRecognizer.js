/* 
In order to separate the concerns with the UIViewControllers and its gesture handling algorithms, 

the UIGestureRecognizers will serve as the handlers for gestures(touch and mouse inputs, depending on whichever one is appropriate) which will 

delegate the events to the target ViewControllers.
*/

function POINT(x,y)
{
    this.x = x;
    this.y = y;
};

function Rect(x,y,w,h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function UIGestureRecognizer (viewcontroller,eventhandler)
{
    var self = this;
    self.target = viewcontroller;
    self.eventhandler = eventhandler;
    self.isTouchDevice = 'ontouchstart' in document.documentElement;
}