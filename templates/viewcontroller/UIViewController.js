/*
 We will take a classical MVC approach for this framework.
 
 Model(Optional)
 |
 ViewController
 |
 View (DOM Object)
 
 Each viewcontroller contains view ( which is represented a DOM object ), and controls every aspect of the view.
 
 Different Viewcontrollers give its views different properties and functionality. 
 
 Although not every View is required to have a ViewController, each ViewController is expected to be mapped to its own View (which will be created automatically upon creation).
 
 Small Subviews (such as just a decoration component or small part of a whole section which doesn't need functionality) does not need to be handled by ViewController.
 
 2015-01-07 Seyong Cho
 */



function UIViewController(rect)
{
    var self = this;
    self.name;
    self.rect = rect;
    self.parent;
    self.children = [];
    self.view = $("<div/>");
    self.scale = new POINT(1, 1);

    self.label = "";
    self.hidden = false;


    self.selectedHandler;
    self.moveHandler;
    self.resizeHandler;


    self.setRect = function()
    {
        self.view.css('transform', 'translate(' + self.rect.x + 'px,' + self.rect.y + 'px) scale(' + self.scale.x + ',' + self.scale.y + ') translate3d(0, 0, 0)');
        self.view.css("width", self.rect.w);
        self.view.css("height", self.rect.h);
    };
    self.setBackgroundImage = function(url) {
        self.view.css("background-image", "url('" + url + "')");
    };
    
    self.setLabel = function(str)
    {
        self.label = str;
        self.view.html(str);
    };

    self.addChild = function(child) {
        self.children.push(child);
        self.view.append(child.view);
    };
    self.addChildAtFront = function(child) {
        self.children.unshift(child);
        self.view.prepend(child.view);
    };
    self.removeChild = function(child) {
        if (self.children.indexOf(child) != -1)
        {
            self.children.splice(self.children.indexOf(child), 1);
            child.view.remove();
        }
    };
    self.detachChild = function(child)
    {
        if (self.children.indexOf(child) != -1)
        {
            self.children.splice(self.children.indexOf(child), 1);
            child.view.detach();
        }
    };
    self.detachAllChildren = function() {
        while (self.children.length > 0)
        {
            self.detachChild(self.children[0]);
        }
    };

    self.removeAllChildren = function() {
        while (self.children.length > 0)
        {
            self.removeChild(self.children[0]);
        }
    };

}

