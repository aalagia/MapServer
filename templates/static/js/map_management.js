/**
 * Created by spin on 3/23/16.
 */


/*Funzione che mostra l'elenco delle mappe disponibili*/
   function requestMap(){



       var xhr = new XMLHttpRequest();

       // Open the connection.
        xhr.open('GET', "/maplist/", true);

        xhr.onload = function () {
            if (xhr.status === 201) {
                var risp = JSON.parse(xhr.responseText);
                 var elementlist = document.getElementById("listMap")
                    if (elementlist != null)
                        elementlist.remove();
                    var list = document.createElement('ul');
                    list.id = "listMap";
                for (var i=0; i<risp.length; i++){
                    var item = document.createElement('li');
                     item.innerHTML = "<strong><em>Map: </em></strong>" +  "<span>" + risp[i].idMappa + "</span>" + "<p></p>";
                     item.onclick = function () {

                        loadSVG($(this).children("span").text())

                    };

                     list.appendChild(item);



                }
                document.getElementById('lightboxmap').appendChild(list);
                $('#openMap')[0].click();
            }
        }

       xhr.send();

   }

    /* Funzione che mostra la posizione dell'operatore sulla mappa*/
    function androidtoJS(e){

        var indicator = document.getElementById("Mihai");
        var posx_px = e["CoordinateStimate"]["pos_X"]*metro;
        var posx_py = e["CoordinateStimate"]["pos_Y"]*metro;

        if (indicator == null){
            var image = paper.image("static/res/images/indicator.png", (posx_px-((50/0.008)/2)), (posx_py-((50/0.008)/2)), 50/0.008, 50/0.008).attr({
                    id : "Mihai",
                    visibility: "visible"

                });

            var zpdGroup = paper.select("g");

            zpdGroup.append(image);
        }else{
             indicator.remove();
             var image = paper.image("static/res/images/indicator.png", (posx_px-((50/0.008)/2)), (posx_py-((50/0.008)/2)), 50/0.008, 50/0.008).attr({
                    id : "Mihai",
                    visibility: "visible"

                });
            var zpdGroup = paper.select("g");

            zpdGroup.append(image);

        }

        console.log("in indicator " + indicator)
    }

    /*Funzione che gestisce l'evento submit del form per upload di documenti*/
   function submitForm(e) {
      console.log($("#inputComment").val());

       var formData = new FormData();
        $('.se-pre-con').css('visibility', 'visible');

       e.preventDefault();

      var TrsfMatrix = document.getElementById('GroupIcons').getCTM();
       var tmp ={
           "idMappa" : "spin1",
           "Title" : $("#inputTitle").val(),
           "Type" : $("#documents").val(),
           "Comment" : $("#inputComment").val(),
           "pos_X" : (parseInt($("#posX").text())*0.008)/TrsfMatrix.a,
           "pos_Y" : (parseInt($("#posY").text())*0.008)/TrsfMatrix.a,
           "pos_Z" : 0
       }

       var filelist = document.getElementById('inputFile');
       var file = filelist.files[0];

       console.log("Nome file " + file.name);
       formData.append('file', file, file.name);
       formData.append('media',  JSON.stringify(tmp));
       this.reset();
       // Set up the request.
        var xhr = new XMLHttpRequest();

       // Open the connection.
        xhr.open('POST', "/document/spin1", true);

        xhr.onload = function () {
            if (xhr.status === 201) {
                 // File(s) uploaded.

                $('.se-pre-con').css('visibility', 'hidden');
                $('.close').click();

                var url = JSON.parse(xhr.responseText);
                tmp["url"] = url
                media.push(tmp);

                console.log("File salvato in " + url)

                var pos_X=((tmp.pos_X*TrsfMatrix.a)/0.008);
                var pos_Y= ((tmp.pos_Y*TrsfMatrix.a)/0.008);
                var position = docPosToMapPos(pos_X, pos_Y);
                var image = paper.image("static/res/icons/"+media[media.length -1 ].Type + "_file.svg#lightboxfile", position.xMapPosition, position.yMapPosition, 30/TrsfMatrix.a, 30/TrsfMatrix.a).attr({
                    id : media.length -1,
                    maxWidth: 30/TrsfMatrix.a,
                    visibility: "visible"

                });
                image.attr({"data-toggle": "modal"});
                image.click(function(evt) {



                    var elementlist = document.getElementById("listFile")
                    if (elementlist != null)
                        elementlist.remove();
                    var list = document.createElement('ul');
                    list.id = "listFile";
                                     //for (var i=0; i<mapGroup[this.attr('id')].length; i++) {
                    var file = media[this.attr('id')].Title
                    var item = document.createElement('li');



                    var path = media[this.attr('id')].url;
                    var filename = path.replace(/^.*[\\\/]/, '');
                    item.innerHTML = "<strong><em>Filename: </em></strong>" +  media[this.attr('id')].Title
                                        + "<strong><em> Type: </em></strong>" +  media[this.attr('id')].Type + "<strong><em> Url: </em></strong>" + "<span>" + filename+ "</span>"
                                        + " <strong><em>Comment: </em></strong>" +  media[this.attr('id')].Comment + "<p></p>";

                    item.onclick = function () {

                        requestfile($(this).children("span").text())

                    };
                    list.appendChild(item);


                    document.getElementById('lightboxfile').appendChild(list);

                });
                var zpdGroup = paper.select("g");

                zpdGroup.append(image);
                console.log("New JSON" + JSON.stringify(media));
                } else {
                         alert('An error occurred!');
            }
        };
       // Send the Data.
       xhr.send(formData);

   };

    /*Funzione che carica il file SVG della mappa nell'html*/
    function loadSVG(e) {
        $('.close').click();
        /*Funzione per il caricamento della mappa svg*/
        Snap.load("/map/" + e + ".svg", function (f) {

            paper.append(f);

            paper.attr({id: 'graphic_1'});

            var eventsHandler;
            eventsHandler = {
                haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
                , init: function (options) {
                    var instance = options.instance
                            , initialScale = 1
                            , pannedX = 0
                            , pannedY = 0
                    // Init Hammer
                    // Listen only for pointer and touch events
                    this.hammer = Hammer(options.svgElement, {
                        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
                    })
                    // Enable pinch
                    this.hammer.get('pinch').set({enable: true})
                    // Handle double tap
                    this.hammer.on('doubletap', function (ev) {
                        instance.zoomIn()
                    })
                    // Handle pan
                    this.hammer.on('panstart panmove', function (ev) {
                        clusterIcons();
                        $('#loadDocument').attr('disabled', 'disabled');
                        $('#addDocument').attr('disabled', 'disabled');
                        // On pan start reset panned variables
                        if (ev.type === 'panstart') {
                            pannedX = 0
                            pannedY = 0
                        }
                        // Pan only the difference
                        instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
                        pannedX = ev.deltaX
                        pannedY = ev.deltaY
                    })
                    // Handle pinch
                    this.hammer.on('pinchstart pinchmove', function (ev) {
                        $('#loadDocument').attr('disabled', 'disabled');
                        $('#addDocument').attr('disabled', 'disabled');
                        // On pinch start remember initial zoom
                        if (ev.type === 'pinchstart') {
                            initialScale = instance.getZoom()
                            instance.zoom(initialScale * ev.scale)
                        }
                        instance.zoom(initialScale * ev.scale)
                    })
                    // Prevent moving the page on some devices when panning over SVG
                    options.svgElement.addEventListener('touchmove', function (e) {
                        e.preventDefault();
                    });
                }
                , destroy: function () {
                    this.hammer.destroy()
                }
            }
            panZoom = svgPanZoom('#graphic_1', {
                minZoom: 0.80,
                maxZoom: 100,
                zoomEnabled: true,
                panEnabled: true,
                controlIconsEnabled: false,
                fit: 1,
                center: 1,
                customEventsHandler: eventsHandler,

            });

            panZoom.zoom(0.8);

            panZoom.pan({x: 48, y: 21})


            // get the zpd element inside the svg
	        var zpdGroup = paper.select("g");
            zpdGroup.attr({"id" : "GroupIcons"})


            if( (/Firefox/i.test(navigator.userAgent))) {
                paper.node.addEventListener("DOMMouseScroll", clusterIcons, false);
            } else {
                document.getElementById("GroupIcons").addEventListener("mousewheel", clusterIcons);
                document.getElementById("GroupIcons").addEventListener("touchmove", clusterIcons);


            }


            // create a new circle object
            var circle = paper.circle(0, 0, 15).attr({
                fill: "#bada55"
            });

            // add the circle to the zpd group
            zpdGroup.add(circle);



            var box = paper.select("g").getBBox();

            console.log(box);

            requestDocument();


        });




    }


    //Funzione che chiede i documenti al server
    function requestDocument(){

     var xhr = new XMLHttpRequest();
        xhr.open("GET", "/document/spin1", true);
        xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
                // JSON.parse does not evaluate the attacker's scripts.
            var resp = JSON.parse(xhr.responseText);
             media = resp.media;

            console.log("Il server mi ha restituito" + JSON.stringify(media));
            }
        }
        xhr.send();


    }



    /*Funzione che comunica alla parte Android il documento richiesto dall'utente*/
    function requestfile(e){


        console.log("Carico File " + e)
        NativeInterface.loadFile(e)


    }

    /*Funzione che gestiche le icone sulla mappa*/
	function  clusterIcons(){

        var matrix = document.getElementById("GroupIcons").getCTM()



        var g = paper.select("g");

        var image = g.selectAll("image")


        for(var i =0; i<image.length; i++) {

                var sum = image[i].attr("width") / 2 + image[i].attr("width") / 2;
                var diff = image[i].attr("width") / 2 - image[i].attr("width") / 2;
                for (var j = i + 1; j < image.length; j++) {

                        var dist = Math.sqrt(Math.pow(image[j].attr("x") - image[i].attr("x"), 2) + Math.pow(image[j].attr("y") - image[i].attr("y"), 2))

                        if (dist <= sum && dist >= diff) {
                            //console.log("Toccano image" + i + " e image " + j);

                            //console.log(parseFloat(image[j].attr("x")));
                            var x = (parseFloat(image[j].attr("x")) + parseFloat(image[i].attr("x"))) / 2;
                            var y = (parseFloat(image[j].attr("y")) + parseFloat(image[i].attr("y"))) / 2;

                             if (mapGroup[i]== null && mapGroup[j]== null) {


                                mapGroup[j] = numGroup;
                                mapGroup[i] = numGroup;
                                anchor["group" + numGroup] = i;
                                var group = paper.circle(x,y,15/matrix.a).attr({
                                    fill: "#bada55",
			                        id : "group" + numGroup
                                });

                                g.append(group)

                                 mapGroup["group" + numGroup]=[];
                                 mapGroup["group" + numGroup].splice(i, 0 , media[i]);
                                 mapGroup["group" + numGroup].splice(j, 0, media[j]);

                                 numGroup++;
                                 group.attr({"data-toggle": "modal"});
                                 group.attr({href: "#lightboxfile"});
                                 group.click(function(evt) {
                                     var elementlist = document.getElementById("listFile")
                                        if (elementlist != null)
                                                elementlist.remove();
                                     var list = document.createElement('ul');
                                     list.id = "listFile";
                                     for (var i=0; i<mapGroup[this.attr('id')].length; i++) {
                                         var file = mapGroup[this.attr('id')][i].Title
                                         var item = document.createElement('li');

                                         var path =mapGroup[this.attr('id')][i].url;
                                         var filename = path.replace(/^.*[\\\/]/, '');
                                         item.innerHTML = "<strong><em>Filename: </em></strong>" + mapGroup[this.attr('id')][i].Title
                                                 + "<strong><em> Type: </em></strong>" + mapGroup[this.attr('id')][i].Type + "<strong><em> Url: </em></strong>" + "<span>" + filename+ "</span>"
                                                 + " <strong><em>Comment: </em></strong>" + mapGroup[this.attr('id')][i].Comment + "<p></p>";

                                          item.onclick = function () {

                                                requestfile($(this).children("span").text())


                                            };
                                         list.appendChild(item);

                                     }

                                    document.getElementById('lightboxfile').appendChild(list);
                                    });

                                image[j].attr({visibility: "hidden"});
                                image[i].attr({visibility: "hidden"});
                            }else if (mapGroup[i]== null) {

                                 mapGroup[i] = mapGroup[j];
                                  if (i <anchor["group" + mapGroup[i]]){
                                    anchor["group" + mapGroup[i]]=i;
                                }
                                 mapGroup["group" + mapGroup[j]].splice(i, 0 , media[i]);
                                 console.log("valori sono: " + JSON.stringify(mapGroup));
                                image[i].attr({visibility: "hidden"});
                            }else if (mapGroup[j]== null) {

                                 mapGroup[j] = mapGroup[i];
                                  if (j <anchor["group" + mapGroup[j]]){
                                    anchor["group" + mapGroup[j]]=j;
                                }
                                 mapGroup["group" + mapGroup[i]].splice(j, 0, media[j]);
                                 //console.log("valori sono: " + JSON.stringify(mapGroup));
                                image[j].attr({visibility: "hidden"});
                            }
                        } else {
                            //console.log("Non Toccano image " + i + " e image " + j);

                            if ((mapGroup[i] == mapGroup[j]) && mapGroup[i]!=null && mapGroup[j]!=null) {

                               //console.log("i vale: " + i);
                                 //console.log("anchor vale: " +anchor["group" + mapGroup[i]]);
                               //console.log("In anchor c'è " +JSON.stringify(anchor));
                                mapGroup["group" + mapGroup[i]].splice((i - anchor["group" + mapGroup[i]]), 1);

                                if( i == anchor["group" + mapGroup[i]]){
                                    anchor["group" + mapGroup[i]] = i+1;
                                }

                                //console.log("Il mapGroup contiene n: " + mapGroup["group" + mapGroup[i]].length);
                                if(mapGroup["group" + mapGroup[i]].length == 1) {
                                    //console.log("C'è un solo elemento nel gruppo situazione mapgroup " + JSON.stringify(mapGroup) );
                                     mapGroup["group" + mapGroup[i]].splice(0, 1);
                                    $("#group" + mapGroup[j]).remove();
                                    numGroup=mapGroup[j];
                                     mapGroup[j]=null;
                                    image[j].attr({visibility: "visible"});
                                    image[i].attr({visibility: "visible"});

                                }
                                mapGroup[i]=null;

                                //console.log("sono qui per colpa di image" + i + " e image " + j);
                                //console.log("valori sono: " + JSON.stringify(mapGroup));

                                image[i].attr({visibility: "visible"});

                            }


                        }

                }

        }

        for (var j =0; j<image.length; j++) {
            image[j].attr({
                'height': (30 / matrix.a),
                'width': (30 / matrix.a)
            });
        }
        var cir =g.selectAll("circle") ;
        for (var j =1; j<cir.length; j++) {
            cir[j].attr({

                'r' : (15/matrix.a)
            });
        }

	}

    /*Funzione che riporta la mappa al pan e allo zoom iniziale*/
	function reset() {

        panZoom.zoom(0.8);
        panZoom.pan({x: x_pan, y: y_pan});
        if (loaded == false)
            $('#loadDocument').removeAttr("disabled");
        $('#addDocument').removeAttr("disabled");



    };


    /*Funzione che mostra sulla mappa la posizione dei beacons*/
    function loadSensor() {
        var zpdGroup=paper.select("g");

        var circle1 = paper.circle(39107.77958, 50288.0582, 15/0.008).attr({
            id: "sensor1",
            fill: "#00d2ff"
        });

        var circle2 = paper.circle(38179.95562, 88653.57861, 15/0.008).attr({
            id: "sensor2",
            fill: "#00d2ff"
        });
        var circle3 = paper.circle(68427.01646, 50288.0582, 15/0.008).attr({
            id: "sensor3",
            fill: "#00d2ff"
        });
        var circle4 = paper.circle(69122.88442, 93292.69837, 15/0.008).attr({
            id: "sensor4",
            fill: "#00d2ff"
        });

        var circle6 = paper.circle(38875.82359, 70236.27317, 15/0.008).attr({
            id: "sensor5",
            fill: "#00d2ff"
        });
         var circle7 = paper.circle(69818.75239, 66061.06538, 15/0.008).attr({
             id: "sensor6",
            fill: "#00d2ff"
        });

        // add the circle to the zpd group
        zpdGroup.add(circle1);
        zpdGroup.add(circle2);
        zpdGroup.add(circle3);
        zpdGroup.add(circle4);
        zpdGroup.add(circle6);
        zpdGroup.add(circle7);
    };

    //Funzione che permette l'aggiunta di un documento alla mappa
    function addDocument(){
        var zpdGroup = paper.select("g");
        zpdGroup.attr({"data-toggle": "modal"});
        zpdGroup.attr({href: "#lightboxform"});
        zpdGroup.click(function(evt) {
            console.log("Var x" + evt.pageX + "Var y" + evt.pageY);
            var pos = docPosToMapPos(evt.pageX, evt.pageY);
            console.log("In pixel " + pos.xMapPosition + " " + pos.yMapPosition);
            $('#posX').text(evt.pageX);
            $('#posY').text(evt.pageY);


       });
        var image = zpdGroup.selectAll("image")
        console.log("In image ci sono " + image.length);
        for (var i =0; i< image.length; i++){
            image[i].attr({visibility: "hidden"});
        }
        var group = zpdGroup.selectAll("circle")
        for (var i =0; i< group.length; i++){
            group[i].attr({visibility: "hidden"});
        }
        $('.button').css('visibility', 'hidden');
        var finish = document.createElement("button");
        finish.id = "FinishAdd";
        var t = document.createTextNode("Finito");
        finish.appendChild(t);

        finish.className = "button";

        finish.onclick = function() { // Note this is a function
            if (group.length != 0) {
                for (var i = 0; i < group.length; i++) {
                    group[i].attr({visibility: "visible"});
                }
            }
            if  (image.length != 0) {
                for (var i = 0; i < image.length; i++) {
                    if (mapGroup[i] == null)
                        image[i].attr({visibility: "visible"});
                }

            }
                clusterIcons();

                        document.body.removeChild(finish);
                        $('.button').css('visibility', 'visible');
                        zpdGroup.attr({"data-toggle": ""});
                        zpdGroup.attr({href: ""});
                        zpdGroup.unclick();
                    };
        document.body.appendChild(finish);



    };


    //Funzione che carica i documenti sulla mappa
	function loadDocument(){


            media.sort(function(a,b){
               return a.pos_X - b.pos_X;
            });



            var TrsfMatrix = document.getElementById('GroupIcons').getCTM();


            for (var i = 0; i < media.length; i++) {


                var x= (media[i].pos_X*TrsfMatrix.a)/0.008;
                var y = (media[i].pos_Y*TrsfMatrix.a)/0.008;
                //console.log("x originale" + media[i].pos_X + "y originale " + media[i].pos_Y + "x varia " + x + "y varia" + y + "Zoom" + TrsfMatrix.a);


                //console.log(m2px(media[i].pos_X), m2px(media[i].pos_Y));
                //console.log("La posizione sulla mappa in x,y è " + media[i].pos_X + " " + media[i].pos_Y);

                var pos_X=((media[i].pos_X*TrsfMatrix.a)/0.008);
                var pos_Y= ((media[i].pos_Y*TrsfMatrix.a)/0.008);
                var position = docPosToMapPos(pos_X, pos_Y);
                //console.log("La posizione sulla mappa in pixel è " + position.xMapPosition + " " + position.yMapPosition + "l'offset è " + TrsfMatrix.e + " " +TrsfMatrix.f);
                var image = paper.image("static/res/icons/"+media[i].Type + "_file.svg#lightboxfile", position.xMapPosition , position.yMapPosition , 30/TrsfMatrix.a, 30/TrsfMatrix.a).attr({
                    id : i,
                    maxWidth: 30/TrsfMatrix.a,
                    visibility: "visible",

                });
                //console.log(window.screen.availHeight + " " + window.screen.availWidth);
                image.attr({"data-toggle": "modal"});

                image.click(function(evt) {

                        var elementlist = document.getElementById("listFile")
                        if (elementlist != null)
                            elementlist.remove();
                        var list = document.createElement('ul');
                        list.id = "listFile";

                        var item = document.createElement('li');



                        var path = media[this.attr('id')].url;
                        var filename = path.replace(/^.*[\\\/]/, '');
                        item.innerHTML = "<strong><em>Filename: </em></strong>" +  media[this.attr('id')].Title
                                        + "<strong><em> Type: </em></strong>" +  media[this.attr('id')].Type + "<strong><em> Url: </em></strong>" + "<span>" + filename+ "</span>"
                                        + " <strong><em>Comment: </em></strong>" +  media[this.attr('id')].Comment + "<p></p>";

                    item.onclick = function () {

                        requestfile($(this).children("span").text())

                    };
                    list.appendChild(item);


                    document.getElementById('lightboxfile').appendChild(list);

                    });

                //console.log("Aggiunto cerchio " + i + "x " + position.xMapPosition + "y " + position.yMapPosition);

                var zpdGroup = paper.select("g");

                zpdGroup.append(image);
            }

            clusterIcons();
        $('#loadDocument').attr('disabled', 'disabled');
        loaded = true;


    }


    /*Funzione che dalle coordinate x,y del documento le trasforma in pixel*/
	function docPosToMapPos(xPix,yPix){
        var TrsfMatrix=document.getElementById("GroupIcons").getCTM();
        console.log("La matrice di trasformazione è " + TrsfMatrix.a, TrsfMatrix.e, TrsfMatrix.f);
		var xMapPosition = (xPix - TrsfMatrix.e)/TrsfMatrix.a;
		var yMapPosition = (yPix - TrsfMatrix.f)/TrsfMatrix.a;
		return {
				xMapPosition: xMapPosition,
				yMapPosition: yMapPosition
				};
	}

    /*Funzione che dalle coordinate in pixel del documento ritorna in coordinate x,y*/
	function mapPosToDocPos(xPix,yPix){
        var TrsfMatrix=document.getElementById("GroupIcons").getCTM();
		var xDocPosition = xPix * TrsfMatrix.a + TrsfMatrix.e
		var yDocPosition = yPix * TrsfMatrix.a + TrsfMatrix.f

		return {
				xDocPosition: xDocPosition,
				yDocPosition: yDocPosition
				};
	}
