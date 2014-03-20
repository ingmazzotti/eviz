//data is a dataset ordered by fromdate asc and todate asc
var dataorig = [];
/*
        [20140301,20140301,"Mostra",25],
        [20140301,20140304,"Partita",10],
        [20140302,20140305,"Flashmob",0],
        [20140303,20140328,"Esposizione",8],
        [20140304,20140305,"Degustazioni",14],
        [20140315,20140316,"Cinema",20],
        [20140316,20140317,"Festival",3],
        [20140329,20140329,"Festa in piazza",3],
        [20140329,20140410,"Summit",3],
        [20140401,20140402,"Workshop",3],
        [20140405,20140408,"Hackaton",3],
        [20140408,20140408,"Premiazione",3],
        [20140415,20140415,"Mangiatona",3],
        [20140416,20140425,"Cenone",3]
];
*/

var weekday=new Array(7);
weekday[0]="Domenica";
weekday[1]="Lunedì";
weekday[2]="Martedì";
weekday[3]="Mercoledì";
weekday[4]="Giovedì";
weekday[5]="Venerdì";
weekday[6]="Sabato";

var weekdayIni=new Array(7);
weekdayIni[0]="D";
weekdayIni[1]="L";
weekdayIni[2]="M";
weekdayIni[3]="M";
weekdayIni[4]="G";
weekdayIni[5]="V";
weekdayIni[6]="S";

var nomemese = new Array(12);
nomemese[0] = "Gennaio";
nomemese[1] = "Febbraio";
nomemese[2] = "Marzo";
nomemese[3] = "Aprile";
nomemese[4] = "Maggio";
nomemese[5] = "Giugno";
nomemese[6] = "Luglio";
nomemese[7] = "Agosto";
nomemese[8] = "Settembre";
nomemese[9] = "Ottobre";
nomemese[10] = "Novembre";
nomemese[11] = "Dicembre";

var currentmonth = new Date().getMonth()+1;
var currentyear = new Date().getFullYear()+1;
var selectedId = -1;
var selectedFlow = -1;
var selectedSummary = "";
var scrollPosition = -1;
var selectedImage = "";

function myAlert(message) {
    $("#errormessage").html(message);
    $('#myModal').modal('show');
}

function checkImage (src, good, bad) {
    var img = new Image();
    img.onload = good; 
    img.onerror = bad;
    img.src = src;
}

// Here we run a very simple test of the Graph API after login is successful. 
            // This testAPI() function is only called in those cases. 
            function testAPI() {
              console.log('Welcome!  Fetching your information.... ');
              
            }

function next() {
    $("#thechart").empty();
    if(currentmonth == 12) {
        currentmonth = 1;
        currentyear = currentyear +1;
    }
    else {
        currentmonth = currentmonth+1;
    }

        
        selectedId = -1;

        getData(currentmonth,currentyear,null,selectedFlow);
}

function previous() {
    $("#thechart").empty();
    if(currentmonth == 1) {
        currentmonth = 12;
        currentyear = currentyear - 1;
    }
    else {
        currentmonth = currentmonth - 1;
    }

    
        selectedId = -1;

        getData(currentmonth,currentyear,null, selectedFlow);
}

function updateEvent() {
    $("#thechart").empty();

    FB.api('/me', function(response) {
            console.log('Stai per esprimere la tua preferenza: ' + response.name + '.' +response.id+ " per l'evento "+selectedId+ " del flusso "+selectedFlow);

            if(response.id == null) {

                FB.login(function(){}, {scope: 'publish_actions'});

                //alert("Devi loggarti con l'utente Facebook per esprimere il tuo interesse");

                getData(currentmonth,currentyear,null, selectedFlow);

            } else {

                appRoutes.controllers.Application.updateEvent(selectedId, selectedFlow, "FB_"+response.id).ajax( {
                    success: function(data) {
                        

                        FB.api('/me/feed', 'post', 
                            {   
                                message: "Ho appena manifestato il mio interesse per l'evento \""+selectedSummary+"\" usando Eviz",
                                picture: selectedImage,
                                name: selectedSummary,
                                caption: selectedSummary,
                                link: 'http://www.ingmazzotti.it:9000/event/'+selectedFlow+'/'+selectedId+'/',
                                
                            });
                        
                        dataorig = [];

                        $(data).each( function(index,event) {
                            dataorig[index] = [event.fromdate, event.todate, event.summary, event.clicks, event.id, event.id_flow, event.longitude, event.latitude,
                                               event.licenza, event.link, event.image, event.description, event.category];
                        })
                        
                        //selectedId = -1;
                        render(currentmonth, currentyear, -1);
                        $("#detailcontainer").fadeIn(500);
                    },

                    error: function(data) {
                        myAlert("Hai già espresso la preferenza per questo evento.")
                        //alert("Hai già espresso la preferenza per questo evento!");
                        
                        getData(currentmonth,currentyear, null, selectedFlow);
                    }

                });
            }
    });
} 

function getData(month, year, id, id_flow) {

    appRoutes.controllers.Application.getAll(id_flow).ajax( {
        success: function(data) {
            dataorig = [];
            day = -1;
            $(data).each( function(index,event) {
                if(id != null) {
                    if(event.id_flow == id_flow && event.id == id) {
                        month = parseInt((""+event.fromdate).substring(4,6));
                        year = parseInt((""+event.fromdate).substring(0,4));
                        day = parseInt((""+event.fromdate).substring(6,8));
                        selectedId = id;
                        selectedFlow = id_flow;
                        selectedSummary = event.summary;
                        selectedImage = event.image
                    }
                }
                //console.log("Fetching "+index+": "+event.fromdate+", "+event.todate+", "+event.summary+", "+event.clicks+", "+event.id);
                dataorig[index] = [event.fromdate, event.todate, event.summary, event.clicks, event.id, event.id_flow, event.longitude, event.latitude,
                                   event.licenza, event.link, event.image, event.description, event.category];
            })
            
            render(month, year, day);
        }

    });

}


function render(month, year, dayevent) {
    
    if(dataorig == null || dataorig.length == 0) {
        myAlert("Nessun Evento");
    } 

    else {

        currentmonth = month;
        currentyear = year;


        //Update view
        $("#periodlabel").html(nomemese[month-1]+" "+year);

        day = new Date(currentyear,currentmonth-1,1);
        lastday = new Date(currentmonth==12?currentyear+1:currentyear, currentmonth==12?0:currentmonth,0);

        console.log("Lastday "+lastday);

        minimumdate = currentyear*10000+currentmonth*100+1;
        maximumdate = currentyear*10000+currentmonth*100+lastday.getDate();

        console.log("Minimumdate = "+minimumdate+", Maximumdate = "+maximumdate);

        var yy=0;
        var numslot = 0;
        var data = [];
        var ii=0;
        for(var jj = 0; jj < dataorig.length;jj++) {
            console.log("Confronto: "+dataorig[jj][0]);
            if((dataorig[jj][0]>=minimumdate && dataorig[jj][0]<=maximumdate)  || 
               (dataorig[jj][0]<minimumdate && dataorig[jj][1]>=minimumdate)) {
                data[ii] = dataorig[jj];
                ii++;
            }
        }


        var stopj=false;
        for(var j = 0; j < data.length;j++) {
            console.log("Confronto: "+data[j][0]);
            if((data[j][0]>=minimumdate && data[j][0]<=maximumdate) || 
               (data[j][0]<minimumdate && data[j][1]>=minimumdate)) {

                console.log("Devo posizionare "+j);
                if(j==0) {
                    data[j].push(0);
                    numslot++;
                    console.log("Posizione "+0);
                } else {
                    freeslot=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                    var stopk=false;
                    for(var k=0; k<data.length && !stopk;k++) {
                        if(data[k].length == 14) { //9
                            console.log("ispeziono: "+k);
                             curslot = data[k][13]; //8   
                            if(data[j][0] >= data[k][0] && data[j][0] <= data[k][1]) {
                                console.log("Intersezione "+curslot);
                                    freeslot[curslot] = 1;
                            }
                        }
                        else {
                             stopk=true;   
                        }
                    }
                    
                    var stopw = false;
                    
                    console.log("Freeslot "+freeslot.join());
                    
                    for(var w = 0; w<freeslot.length && !stopw; w++) {
                        if(freeslot[w]==0) {
                            console.log("Posizione "+w);
                            numslot = numslot>w+1?numslot:w+1;
                            data[j].push(w);
                            stopw = true;
                        }
                    }
                }
            }
        }


        barwidth = 45; //70
        height = barwidth*numslot;
        //height=200;
        baseline = 2;
        labels = 40;
        upperbase = 16;

        console.log("Numslot "+numslot);

        //barwidth = height/numslot;

        var min =20991231, max = 0, maxfeel =0;

        for(var i=0; i< data.length; i++) {
            min =  min<data[i][0]?min:data[i][0];
            max = max >data[i][1]?max:data[i][1];
            maxfeel = maxfeel >data[i][3]?maxfeel:data[i][3];
        }

        //width=((max+1)-min)*100;
        width=((maximumdate+1)-minimumdate)*200; //*100

        var x = d3.scale.linear()
                  //.domain([min, max+1])
                  .domain([minimumdate, maximumdate+1])
                  .range([0, width]);


        var chart = d3.select(".chart")
                  .attr("width", width)
                  .attr("height", upperbase+height+baseline+labels);

        var bar = chart.selectAll("g")
                  .data(data)
                  .enter().append("g")
                  .attr("transform", function(d, i) {
                          
                          var xx=x(d[0]);
                          var yy=upperbase+d[13]*barwidth; //8
                          //console.log("Slot: "+d[4]+", Width: "+barwidth);
                          console.log(i+"translate("+xx+","+yy+")");
                          return "translate("+xx+","+yy+")"; 
                  });

        bar.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx",20)
                    .attr("ry",20)
            .attr("width",function(d) {
                return (x(d[1]+1)-x(d[0]));
            })
            .attr("height",function(d) {
                return barwidth;
            })
            .style("fill",function(d) {
                if(selectedId == d[4] && selectedFlow == d[5]) {
                    d3.select(this).attr("class", "checked");
                    $("#theevent").html(d[11]);
                    //$("#themap").html("Long: "+d[6]+", Lat: "+d[7]);
                
                    $("#themap").html(
                        "<iframe id=\"iframemap\" width=\""+($("#mapcontainer").width()-40)+"\" height=\""+($("#mapcontainer").width()-40)+"\" frameborder=\"0\" scrolling=\"no\""+
                        " marginheight=\"0\" marginwidth=\"0\" src=\"http://www.openstreetmap.org/export/embed.html?bbox="+
                        (d[7]-0.005)+"%2C"+(d[6]-0.005)+"%2C"+(d[7]+0.005)+"%2C"+(d[6]+0.005)+"&amp;layer=mapnik&amp;marker="+d[6]+"%2C"+d[7]+
                        " style=\"border: 1px solid black\"></iframe><br/><small><a href=\"http://www.openstreetmap.org/?mlat="
                        +d[6]+"0&amp;mlon="+d[7]+"#map=13/"+d[6]+"/"+d[7]+"\">Visualizza mappa ingrandita</a></small>");
                    
                    checkImage(
                        d[10],
                        function() { 
                        // Do something now you know the image exists.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\"><img src=\""+d[10]+"\" alt=\""+d[2]+"\"></a>");
                        },
                        function() { 
                        // Image doesn't exist - do something else.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\">"+d[2]+"</a>");
                        }
                    );

                    


                    $("#detailcontainer").fadeIn(1000);
                    return "green";
                }
                else {
                    return "steelblue";
                }
            })
            .style("fill-opacity",function(d) {return 0.2+d[3]*0.8/(maxfeel==0?100000:maxfeel);})
            .style("stroke","white")
            .style("stroke-width",2)
            .on("click",function(d) {


                $(".checked").each(function(index, element) {
                    //d3.select(element).transition().attr("fill","steelblue").duration(500);
                    d3.select(element).transition().style("fill", "steelblue").duration(500);
                    d3.select(element).attr("class", "");
                });

                d3.select(this).attr("class", "checked");

                d3.select(this).transition().style("fill","green").duration(500);

                console.log("Incremento evento con id "+d[4]);
                
                selectedId = d[4];
                selectedFlow = d[5];
                selectedSummary = d[2];
                selectedImage = d[10];

                $("#theevent").html(d[11]);
                //$("#themap").html("Long: "+d[6]+", Lat: "+d[7]);
                console.log("Mapcontainer width: "+$("#mapcontainer").width());
                
                $("#themap").html(
                    "<iframe  id=\"iframemap\" width=\""+($("#mapcontainer").width()-40)+"\" height=\""+($("#mapcontainer").width()-40)+"\" frameborder=\"0\" scrolling=\"no\""+
                    " marginheight=\"0\" marginwidth=\"0\" src=\"http://www.openstreetmap.org/export/embed.html?bbox="+
                    (d[7]-0.005)+"%2C"+(d[6]-0.005)+"%2C"+(d[7]+0.005)+"%2C"+(d[6]+0.005)+"&amp;layer=mapnik&amp;marker="+d[6]+"%2C"+d[7]+
                    " style=\"border: 1px solid black\"></iframe><br/><small><a href=\"http://www.openstreetmap.org/?mlat="
                    +d[6]+"0&amp;mlon="+d[7]+"#map=13/"+d[6]+"/"+d[7]+"\">Visualizza mappa ingrandita</a></small>");
                
                    checkImage(
                        d[10],
                        function() { 
                        // Do something now you know the image exists.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\"><img src=\""+d[10]+"\" alt=\""+d[2]+"\"></a>");
                        },
                        function() { 
                        // Image doesn't exist - do something else.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\">"+d[2]+"</a>");
                        }
                    );

                $("#detailcontainer").fadeIn(1000);
                /*
                d3.select(".bubble").remove();
                chart.append("rect")    .attr("x",d3.transform(d3.select(this.parentNode).attr("transform")).translate[0]+d3.mouse(this)[0])
                    .attr("y",d3.transform(d3.select(this.parentNode).attr("transform")).translate[1]+d3.mouse(this)[1])
                    .attr("rx",20)
                    .attr("ry",20)
                    .attr("width",100)
                    .attr("height",50)
                    .attr("fill","pink")
                        .style("fill-opacity",0)
                    .attr("class","bubble")
                    .on("click",function() {                          d3.select(".bubble").transition()
                            .duration(1000)
                            .style("fill-opacity",0)
                          .each("end", function() {
                                d3.select(".bubble").remove();
                            });
                    })
                .transition()
                    .duration(1000)
                    .style("fill-opacity",0.8);
                */
            })
            .on("mouseover", function(d) {
                d3.select("body").style("cursor", "pointer");
            })
            .on("mouseout", function(d) {
                d3.select("body").style("cursor", "default");
            });

        bar.append("text")
            .attr("x",function(d) {
                if(x(d[0])<0) {
                    return -x(d[0])+10
                }
                else {
                    return 10;
                }
            })
            .style("pointer-events","none")
            .attr("y",barwidth/2)
            .attr("fill","black")
            .attr("dominant-baseline","central")
            .attr("font-family","impact, sans-serif")
            .attr("font-size", function(d) {
                larghezza = (x(d[1]+1)-x(d[0]));
                mul = 12;
                caratteri = d[2].length*mul;
                grandezzabase = 16;
                while(caratteri>larghezza && grandezzabase > 0) {
                    grandezzabase--;
                    mul--;
                    caratteri = d[2].length*mul;
                }
                console.log("Larghezza: "+larghezza+" Caratteri: "+caratteri+" Grandezza base: "+grandezzabase);
                return grandezzabase+"px";
            })
            .text(function(d) { return d[2]; })
            .on("mouseover", function(d) {
                d3.select("body").style("cursor", "pointer");
            })
            .on("mouseout", function(d) {
                d3.select("body").style("cursor", "default");
            });
            /*
            .on("click",function(d) {


                $(".checked").each(function(index, element) {
                    //d3.select(element).transition().attr("fill","steelblue").duration(500);
                    d3.select(element).transition().style("fill", "steelblue").duration(500);
                    d3.select(element).attr("class", "");
                });

                d3.select(this).attr("class", "checked");

                d3.select(this).transition().style("fill","green").duration(500);

                console.log("Incremento evento con id "+d[4]);
                
                selectedId = d[4];
                selectedFlow = d[5];
                selectedSummary = d[2];
                selectedImage = d[10];

                $("#theevent").html(d[11]);
                //$("#themap").html("Long: "+d[6]+", Lat: "+d[7]);
                
                $("#themap").html(
                    "<iframe width=\"350\" height=\"350\" frameborder=\"0\" scrolling=\"no\""+
                    " marginheight=\"0\" marginwidth=\"0\" src=\"http://www.openstreetmap.org/export/embed.html?bbox="+
                    (d[7]-0.005)+"%2C"+(d[6]-0.005)+"%2C"+(d[7]+0.005)+"%2C"+(d[6]+0.005)+"&amp;layer=mapnik&amp;marker="+d[6]+"%2C"+d[7]+
                    " style=\"border: 1px solid black\"></iframe><br/><small><a href=\"http://www.openstreetmap.org/?mlat="
                    +d[6]+"0&amp;mlon="+d[7]+"#map=13/"+d[6]+"/"+d[7]+"\">Visualizza mappa ingrandita</a></small>");
                
                    checkImage(
                        d[10],
                        function() { 
                        // Do something now you know the image exists.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\"><img src=\""+d[10]+"\" alt=\""+d[2]+"\"></a>");
                        },
                        function() { 
                        // Image doesn't exist - do something else.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\">"+d[2]+"</a>");
                        }
                    );

                    $("#detailcontainer").fadeIn(1000);
            
            });*/


        bar.append("text")
            .attr("x",function(d) {
                if ( x(d[1]) > width ) {
                    return (width-x(d[0]))-15;
                } else
                if(x(d[0]) < 0) {
                    return -x(d[0])+x(d[1]+1)-15;
                } 
                else {
                    return (x(d[1]+1)-x(d[0]))-15;
                }
            })
            .attr("y",barwidth/4+4) //barwidth/2
            .attr("dy","0.35em")
            .attr("fill","#C00808")
            //.attr("dominant-baseline","central")
            .attr("font-family","impact, sans-serif")
            .attr("font-size","16px")
            .attr("text-anchor","end")
            .text(function(d) { return ""+d[3]; });

        console.log("Image url: "+$("link[rel='thumbsup']").attr("href"));

        bar.append("svg:image")
            .attr("x",function(d) {
                if ( x(d[1]) > width ) {
                    return (width-x(d[0]))-30;
                }
                else if(x(d[0]) < 0) {
                    return -x(d[0])+x(d[1]+1)-30;
                } 
                else {
                    return (x(d[1]+1)-x(d[0]))-30;
                }
            })
            .attr("y",barwidth/2-4)
            .attr("height",25)
            .attr("width",25)
            .attr("xlink:href", $("link[rel='thumbsup']").attr("href"))
            .on("mouseover", function(d) {
                d3.select("body").style("cursor", "pointer");
            })
            .on("mouseout", function(d) {
                d3.select("body").style("cursor", "default");
            })
            .on("click", function(d) {
                

                selectedId = d[4];
                selectedFlow = d[5];
                selectedSummary = d[2];
                selectedImage = d[10];

                $("#theevent").html(d[11]);
                //$("#themap").html("Long: "+d[6]+", Lat: "+d[7]);
                
                $("#themap").html(
                    "<iframe id=\"iframemap\" width=\""+($("#mapcontainer").width()-40)+"\" height=\""+($("#mapcontainer").width()-40)+"\" frameborder=\"0\" scrolling=\"no\""+
                    " marginheight=\"0\" marginwidth=\"0\" src=\"http://www.openstreetmap.org/export/embed.html?bbox="+
                    (d[7]-0.005)+"%2C"+(d[6]-0.005)+"%2C"+(d[7]+0.005)+"%2C"+(d[6]+0.005)+"&amp;layer=mapnik&amp;marker="+d[6]+"%2C"+d[7]+
                    " style=\"border: 1px solid black\"></iframe><br/><small><a href=\"http://www.openstreetmap.org/?mlat="
                    +d[6]+"0&amp;mlon="+d[7]+"#map=13/"+d[6]+"/"+d[7]+"\">Visualizza mappa ingrandita</a></small>");
                
                    checkImage(
                        d[10],
                        function() { 
                        // Do something now you know the image exists.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\"><img src=\""+d[10]+"\" alt=\""+d[2]+"\"></a>");
                        },
                        function() { 
                        // Image doesn't exist - do something else.
                            $("#theimage").html("<a href=\""+d[9]+"\" target=\"_blank\">"+d[2]+"</a>");
                        }
                    );

                scrollPosition = $("#thechartcontainer").scrollLeft();
                console.log("Scrollposition is "+scrollPosition);
                $("#detailcontainer").fadeIn(1000);


                $("#thechart").fadeOut(500, function() {
                    updateEvent();
                    $("#thechart").fadeIn(500);
                });
            });

        chart.append("line")
            .attr("y1",upperbase+height+2)
            .attr("y2",upperbase+height+2)
            .attr("x1",0)
            .attr("x2",width)
            .attr("stroke","black")
            .attr("stroke-width",0.5);

        chart.append("line")
            .attr("y1",16)
            .attr("y2",16)
            .attr("x1",0)
            .attr("x2",width)
            .attr("stroke","black")
            .attr("stroke-width",0.5);

        today = new Date();

        if(today.getFullYear() == currentyear && today.getMonth()+1 == currentmonth && dayevent == -1) {
            chart.append("line")
            .attr("y1",14)
            .attr("y2",upperbase+height+2)
            .attr("x1",x(currentyear*10000+currentmonth*100+today.getDate())+100)
            .attr("x2",x(currentyear*10000+currentmonth*100+today.getDate())+100)
            .attr("stroke","#C00808")
            //.attr("stroke-dasharray","1,1")
            .attr("stroke-width",1);
            if(scrollPosition == -1 ) {
                $("#thechartcontainer").scrollLeft(x(currentyear*10000+currentmonth*100+today.getDate()));
            }
            else {
                $("#thechartcontainer").scrollLeft(scrollPosition);
            }
            scrollPosition = -1;
        }
        else if (dayevent == -1) {
            if(scrollPosition == -1 ) {
                $("#thechartcontainer").scrollLeft(0);
            }
            else {
                $("#thechartcontainer").scrollLeft(scrollPosition);
            }
            scrollPosition = -1;
        }
        else {
            $("#thechartcontainer").scrollLeft(x(currentyear*10000+currentmonth*100+dayevent));
        }

        for(z=200; z<=width; z+=200) {
            daytick = new Date(currentyear, currentmonth-1, z/200);
            fillcolor = "black";
            if(daytick.getDay() == 0) {
                fillcolor = "#C00808";
            }
            if(daytick.getDay() == 6) {
                fillcolor = "green";
            }


            chart.append("line")
            .attr("y1",upperbase+height)
            .attr("y2",upperbase+height+4)
            .attr("x1",z-100)
            .attr("x2",z-100)
            .attr("stroke","black")
            //.attr("stroke-dasharray","1,1")
            .attr("stroke-width",0.5);
            
            chart.append("text")
            .attr("y",upperbase+height+16)
            .attr("x",z-100)
            .attr("fill",fillcolor)
            .attr("font-family","impact, sans-serif")
            .attr("font-size","12px")
            .attr("text-anchor","middle")
            .text(weekdayIni[daytick.getDay()]+""+(z/200));

            chart.append("line")
            .attr("y1",12)
            .attr("y2",16)
            .attr("x1",z-100)
            .attr("x2",z-100)
            .attr("stroke","black")
            //.attr("stroke-dasharray","1,1")
            .attr("stroke-width",0.5);
            
            chart.append("text")
            .attr("y",14)
            .attr("x",z-100)
            .attr("fill",fillcolor)
            .attr("font-family","impact, sans-serif")
            .attr("font-size","12px")
            .attr("text-anchor","middle")
            .text(weekdayIni[daytick.getDay()]+""+(z/200));

        }  
            
    }
}
