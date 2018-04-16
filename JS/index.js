$(document).ready(function(){
    $('#result').load('../HTML/navbar.html');
    $('.red').click(function(){
        $('.login').toggle(500);
        $('.register').toggle(500);
    });
    $('.boldem li').hover(function(){
        $(this).addClass('o3');
    }, function(){
        $(this).removeClass('o3');
    });
    $(".bcl").click(function(){
        $(".btn-rmr").toggleClass("rmr-red");
        $(".btn-rmr").toggleClass("rmr-green");        
        $('.rmr').toggle(200);
        $('.rmrd').toggle(200);
      });
    $("#rgb").click(function(){
        var check1= /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/.test($("#email").val());
        var check2= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/.test($("#password").val());
        if(check1 === true && check2 === true){
            $.post("/register",$("#rg").serialize(), function(data){
                console.log( "User successfully created" );
            }).fail(function(response) {
                console.log(response.responseText);
              });
        }else{
            if(check1 === false){
                console.log("Enter a valid email address, please.");
            }else{
                console.log("Enter a strong enough password");
            }
        }
    }); 
    $('[data-toggle="tooltip"]').tooltip(); 
});
