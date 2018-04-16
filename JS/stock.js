$(document).ready(function(){
    var valid=true;
    var ticker="";   
    var interval="60";
    console.log("LOADED");
    $.get('/ticker',function(data){
        ticker=data;
        $(".ticker").html( ticker+$(".ticker").html());
    });
    var correct=function(date,minim,maxim,incr){
        if(parseInt(moment(date).hours()) > maxim){
                date=moment(date).set({'hours': maxim ,'seconds': 0});
            }else if(parseInt(moment(date).hours()) < minim){
                date=moment(date).set({'hours': 9,'seconds': 0});
            }
            var num=parseInt((moment(date).minutes())/incr);
            date=moment(date).set('minutes',incr*num);
            return date;
    }
    var wrapper =function(interval,caller){
         return function(data) {
            $.getJSON("../daily/"+ticker+".json",function(daily){
                if(data == undefined){
                    counter+=1;
                }else{
                    console.log(data);
                    var intCheck=data["Meta Data"]["6. Interval"];  
                    var symbol=data["Meta Data"]["2. Digital Currency Code"]; 
                    var sym2=daily["Meta Data"]["2. Digital Currency Code"]; 
                    var inter="5min";                    
                    var date=data["Meta Data"]["7. Last Refreshed"];
                    if(!date){
                        date = data["Meta Data"]["6. Last Refreshed"].split(' ')[0];
                    }
                    counter=0;
                    var stock=data["Time Series (Digital Currency Intraday)"]
                    if(!stock){
                        stock = data["Time Series (Digital Currency Daily)"][date.toString()];
                    }
                    console.log(stock,'....');
                    
                    var comp=moment(date);
                    comp=form(comp,'YYYY-MM-DD');
                    comp=moment(comp).subtract(1,'days');  
                    while(true){
                        comp=form(comp,'YYYY-MM-DD');
                        if(daily["Time Series (Digital Currency Daily)"][comp.toString()] == undefined){
                            comp=moment(comp).subtract(1,'days');  
                        }else{
                            break;
                        }
                    }          
                    comp=form(comp,'YYYY-MM-DD');
                    $('.data').removeClass('green');
                    $('.data').removeClass('red');            
                    var stock2=daily["Time Series (Digital Currency Daily)"][comp.toString()];
                    for(var property in stock2){
                        var curr=setUpOrDown(stock,stock2,property);
                        var cls=property.split(' ')[1];
                        var val=(100.0*curr).toFixed(2);
                        console.log(property.split(' '));
                        
                        if(cls=="close"){
                            cls="cl";
                        }
                        $('.'+cls).html("("+val+"%)");
                        if(val > 0.0){
                            $('.'+cls).addClass('green');
                            if(cls=="cl"){
                                $('#cval').html("<span class='green'><span class='glyphicon glyphicon-chevron-up'></span>"+"("+val+"%)"+"</span>");       
                            }
                        }else{
                            $('.'+cls).addClass('red');
                            if(cls=="cl"){
                                $('#cval').html("<span class='red'><span class='glyphicon glyphicon-chevron-down'></span>"+"("+val+"%)"+"</span>");    
                            }                       
                        }
                    }
                    date=moment(date).add(570, 'minutes');
                    date=form(date,'YYYY-MM-DD HH:mm:ss');
                    $('.date').html(date.toString() + " IST");
                    $('.open').html(parseFloat(stock["1a. open (INR)"]).toFixed(2)+$('.open').html());
                    $('.high').html(parseFloat(stock["2a. high (INR)"]).toFixed(2)+$('.high').html());
                    $('.low').html(parseFloat(stock["3a. low (INR)"]).toFixed(2)+$('.low').html());
                    $('.cl').html(parseFloat(stock["4a. close (INR)"]).toFixed(2)+$('.cl').html());
                    $('.volume').html(parseFloat(stock["5. volume"]).toFixed(2)+$('.volume').html());
                }
            });
        }
    }
    var counter=0;
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    $(".ib,.sixty").click(function(){   
        $(".ib").removeClass("acti");
        $(this).addClass("acti");
        var interval= $(this).html();
        if(interval != "Daily" && interval != "Weekly" && interval != "Monthly"){
            $(".data").html("");
            $(".ticker").html(ticker+ $(".ticker").html());
            if(counter == 0){
                $.post('/time', {number:interval},function(){
                    valid = true;
                }).fail(function(response){
                    console.log(response.responseText);
                    valid = false;
                });
            }
            $.getJSON("../interval.json", wrapper(interval,this));
        }
    });
    $(".watch").click(function(){
        if(valid == true){
            $.post("/watch",{ticker:ticker}, function(data){
                $(".watch").toggleClass("hide");
                $(".unwatch").toggleClass("hide");
                console.log( "Stock added to watchlist" );
            }).fail(function(response) {
                console.log(response.responseText);
              });
        }else{
            console.log("This stock is not available to watch, sorry.");
        }
    });  
    $(".unwatch").click(function(){
        $.post("/unwatch",{ticker:ticker}, function(data){
            $(".watch").toggleClass("hide");
            $(".unwatch").toggleClass("hide");
            console.log("Stock removed from watchlist");
        }).fail(function(response) {
            console.log(response.responseText);
          });
    });        
    var form=function(date,dformat){
        var formDate=moment(date).format(dformat);
        return formDate;
    }
    $('.sixty').click();
    var setUpOrDown=function(one,two,arg){
        var curr=parseFloat(one[arg]);
        var prev=parseFloat(two[arg]);
        console.log(one,prev);
        
        return (curr-prev)/prev;
    }
    $('[data-toggle="tooltip"]').tooltip(); 
    $('#popover1').popover({ 
        html : true,
        title: function() {
          return $("#popover-head").html();
        },
        content: function() {
          return $("#popover-content").html();
        }
    });
    $(document).on('show.bs.popover', function() {
        $('.popover').not(this).popover('hide');
    });
    $('#popover2').popover({ 
        html : true,
        title: function() {
          return $("#popover-head2").html();
        },
        content: function() {
          return $("#popover-content2").html();
        }
    });
    $(document).on('click', '#buys', function(){
        var qty=$("#qty").val();
        var price=$(".cl").html();
        if(valid == true){
            if(price == ""){
                console.log("Price has not loaded yet, please try again after price loads");
            }else{
                $.post("/buy",{qty:qty,ticker:ticker}, function(data){
                    console.log(data);
                }).fail(function(response) {
                    console.log(response.responseText);
                  });
              }
        }else{
            console.log("This stock is not available to buy, sorry.");
        }
    }); 

    var lastmin;
    var chart = function(data,today,checker){
        
                var width1 = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                if(width1<768){
                    width1=900;
                }else{
                    width1=width1-100;
                }   
                var col1=[];
                for(var i=0;i<5;i++){
                    col1[i]=[];
                }
                var format="";
                var yform="";
                if(checker == false){
                    format='%Y-%m-%d %H:%M:%S';
                    yform='%H:%M';
                }else{
                    format='%Y-%m-%d';
                    yform='%Y-%m-%d';
                }
                for(var val in data){
                    var hold=val;
                    if(checker == true){
                        var comp=val[8]+val[9];
                    }else{
                        hold=moment(val).format("YYYY-MM-DD");
                    }
                    col1[0].push(hold);
                    col1[1].push(data[val]["1a. open (INR)"]);
                    col1[2].push(data[val]["2a. high (INR)"]);
                    col1[3].push(data[val]["3a. low (INR)"]);
                    col1[4].push(data[val]["4a. close (INR)"]);
                }
                console.log(col1);
                
                var chart = c3.generate({
                size:{
                    width:width1
                },
                bindto: '#chart',
                padding: {
                    right: 20,
                    left:120,
                    top:5
                },
                data: {
                      x: 'date',
                      xFormat: format,
                      json: {
                            date: col1[0],
                            Open: col1[1],
                            Close: col1[4],
                            High: col1[2],
                            Low: col1[3]
                     }
                },
                axis : {
                        x : {
                            type : 'timeseries',
                            label: "Time",
                            tick : {
                                format : yform
                        }
                    },
                        y: {
                            label: "Value",
                            tick: {
                                format: d3.format('.2f')
                            }
                        }
                    }
                });
            }
    var graphGen=function(val,checker){
            $.getJSON("./daily/"+val+".json",function(data){
                var interval=$('.acti').html();
                var today=data["Meta Data"]["6. Last Refreshed"].split(' ')[0];
                let dat=data["Time Series (Digital Currency Daily)"];
                chart(dat,today,true);
            }); 
        }
    $(".graph").click(function(){
        graphGen(ticker,true);
        $('.graph').css("border-left","3px solid black");
        $('.bod').toggleClass("hidden");
        $('.sh').toggleClass("hidden");
        $('.watch').toggleClass("hidden");
        $('.buy').toggleClass("hidden");  
        $('.sell').toggleClass("hidden");  
        $('.unwatch').toggleClass("hidden"); 
        $('.char').toggleClass("hidden");
        if($('.ibcl').hasClass("checker") && !(lastmin.hasClass("acti"))){
            $('.ib').removeClass("acti");
            lastmin.addClass("acti");
        }
        $('.ibcl').toggleClass("checker");
    });
    $(".ibcl").click(function(){
        lastmin=$(this);
        if($(this).hasClass("checker")){
            graphGen(ticker,true);
        }
    });
    $(".sh").click(function(){
        var str=$(this).html();
        if( str == "Daily"){
            str = "../daily/"+ticker;
        }else{
            str=str.toLowerCase();
        }
        graphGen(str,false);
    });
});
