
//navigation

(function(){
  var transition = function(){
    var page  = $(this).attr("href").substr(1);
    var match = $("div[data-page='"+page+"']");
    if(match.length){
      $("div.button_bar").text($("div[data-page='"+page+"']").attr("data-title"));
      $("div[data-menu]:not([data-menu='"+page+"'])").hide();
      $("div[data-menu='"+page+"']").fadeIn(300);
      $("div[data-page]:not([data-page='"+page+"'])").fadeOut(300);
      $("div.container").css("overflow-y", $("div[data-page='"+page+"']").attr("data-scroll") == "yes" ? "auto" : "hidden");
      $(match).fadeIn(400);
      $("div.container").scrollTop(0);
    }
  };
  $("a[href^=#]").click(transition);
  $("a[href^=#]").each(function(e){ this.addEventListener('touchstart', transition, false); });
})();

//setup
var refDate = new Date(2014,0,1,0,0,0);
var lastref = localStorage.getItem("statmeetdate");
var initializeFlag = 1;
try{
  var ndate = new Date(Date.parse(lastref));
  if(isNaN(ndate) || lastref == '' || lastref == null || ndate == 'Invalid Date'){
    throw "eerrroorr";
  }
  refDate = ndate;
  initializeFlag = 0;
  $("#meetdate").val((ndate.toISOString()+"").substr(0,10));
}catch(e){ };
lastref = localStorage.getItem("statbirthdate");
if(lastref){ try{ if(lastref == null){ throw "errororor"; } $("#birthdate").val((new Date(Date.parse(lastref)).toISOString()+"").substr(0,10)); }catch(e){} }

var updatestat = function(){
  var d  = $(this).val();
  var id = $(this).attr("id");
  if(id == "meetdate" || id == "birthdate"){
    try{
      var dt = new Date(d);
      if(new Date() - dt < 0){
        throw "Date must be in the past";
      }
      //save the date;
      if(id == "meetdate"){
        refDate = dt;
      }
      localStorage.setItem("stat"+id, dt.toISOString());
    }catch(e){
    }
  }else{
    try{
      localStorage.setItem("stat"+id, d);
    }catch(e){}
  }
};
var deleter = function(){
  var id = $(this).parent().parent().find("input").attr("id");
  var rf = localStorage.getItem("i_statkeys");
  rf = rf.replace(","+id+",", "");
  $(this).parent().parent().remove();
  localStorage.setItem("i_statkeys", rf);
  localStorage.setItem("stat"+id, "");
};
var fillstatscreen = function(key){
  if(key == ''){return;}
  var cp = $("div[data-page='settings'] > div[data-role='inputcontain']").first().clone(); 
  $(cp).find("h3 > .text").text(localStorage.getItem("text"+key));
  $(cp).find("h3 > a").click(deleter);
  $(cp).find("input").attr("type", "text");
  $(cp).find("input").val(localStorage.getItem("stat"+key));
  $(cp).find("a.hint").removeClass("hint").removeClass("hint--bottom");
  $(cp).insertBefore("div[data-page='settings'] > div[data-role='button']");
  $(cp).show();
  $(cp).find("input").change(updatestat);
  $(cp).find("input").attr("id", key);
};

try {
  lastref = localStorage.getItem("i_statkeys").split(",");
  lastref.shift();lastref.shift();lastref.shift();
  for(var j in lastref){
    fillstatscreen(lastref[j]);
  }
} catch(e) {
  localStorage.setItem("i_statkeys", ",meetdate,birthdate,");
}

//edit stats
(function(){
  var c = "edit";
  $("div[data-menu='settings'] > a").click(function(){ 
    var self = this;
    if(c == "edit"){
      $("div[data-page='settings'] > div:nth-child(1), div[data-page='settings'] > div:nth-child(2)").hide();
      $("div[data-page='settings'] > div > a:not(.deleter)").hide();
      $("div[data-page='settings'] > div  a.deleter").show();
      $(self).text("Done");
      c = "";
    }else{
      $("div[data-page='settings'] > div:nth-child(1), div[data-page='settings'] > div:nth-child(2)").show();
      $("div[data-page='settings'] > div > a:not(.deleter)").show();
      $("div[data-page='settings'] > div a.deleter").hide();
      $(self).text("Edit");
      c = "edit";
    }
  });

  $("a.deleter").click(deleter);
})();

//stat functions

(function(){
  $("#meetdate").change(updatestat);
  $("#birthdate").change(updatestat);


  //add a new stat
  $("#addstat").click(function(){
    $(this).removeClass("hint").removeClass("hint--bottom");
    var addstat = function(results){
      var button = results.buttonIndex-1;
      var result = results.input1.replace(/^\s|\s$/g, '');
      if(button == 1 && result.length){
        //user didn't cancel & result != ''
        var text = result;
        var key  = result.replace(/[^A-Za-z]/g,"");
        var keys = localStorage.getItem("i_statkeys");
        var tkey = key;
        var i    = 0;
        if(keys.indexOf(",meetdate,") == -1){
          //init keys
          keys = ",meetdate,birthdate,";
        }
        while(keys.indexOf("," + tkey + ",") > -1){
          tkey = key + (""+ (++i));
        }
        key = tkey;
        keys += tkey+",";
        localStorage.setItem("i_statkeys", keys);
        localStorage.setItem("text"+key, text);
        localStorage.setItem("stat"+key, "");
        fillstatscreen(key);
      }
    };
    try{
      navigator.notification.prompt('What info would you like to add?', addstat, 'Custom Stats', ['Cancel', 'Ok'], ''); 
    } catch (e) { }
  });
})();

//counter 

(function(){
  var r = Raphael("counter");
  var radius = 200;
  var init = 1;
  var hash = document.location.hash;
  var param = { 
    stroke: "#FFF", 
    "stroke-width": 30
  };
  var marksAttr = {
    fill: hash || "#444",
    stroke: "none"
  };
  var html = [
    document.getElementById("y"),
    document.getElementById("d"),
    document.getElementById("m")
  ];
  r.setViewBox(0,0,600,600,true);
  var callercount = 0;
  r.customAttributes.arc = function(value, total, radius){
    var alpha = 360 / total * value;
    var a = (90 - alpha) * Math.PI / 180;
    var x = 300 + radius * Math.cos(a);
    var y = 300 - radius * Math.sin(a);
    var color = colors[Math.floor((radius - 80)/40)];//"hsb(".concat(Math.round(radius)/200, ",", value / total, ", .75)");
    var path;
    if (total == value) {
      path = [["M", 300, 300 - radius], ["A", radius, radius, 0, 1, 1, 299.99, 300 - radius]];
    } else {
      path = [["M", 300, 300 - radius], ["A", radius, radius, 0, +(alpha > 180), 1, x, y]];
    }
    return {path: path, stroke: color};
  };

  var colors = [
    "444444",
    "FF6201",
    "14A5EC",
    "E3E3E3"
  ];

  var updateVal = function(value, total, R, hand, id){
    var color = colors[id];//"hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
    var val2 = value;
    if(id == 0){ value = value % 365; }
    if(init){
      hand.animate({arc:[value,total,R]}, 900, ">");
    }else{
      if((!value || value == total) && value !== 0){
        value = total;
        hand.animate({arc:[value,total,R]},750,"bounce",function(){
          hand.attr({arc:[0,total,R]});
        });
      }else{
        hand.animate({arc:[value,total,R]},750,"elastic");
      }
    }
    if(html[id]){
      if(id == 0 && val2 != value){
        $("#counteryear").show(); 
        html[id].innerHTML = value;
        $("#counteryear > span:nth-child(1)").html(Math.floor(val2 / 365));
        
      }else{
        if(id == 0){ $("#counteryear").hide(); } 
        html[id].innerHTML = (value < 10 ? "0" : "") + value;
      }
    }
  };

  var drawMarks = function(R,total){
    var color = "hsb(".concat(Math.round(R) / 200, ", 1, .75)");
    var out = r.set();
    for (var value = 0; value < total; value++) {
      var alpha = 360 / total * value;
      var a = (90 - alpha) * Math.PI / 180;
      var x = 300 + R * Math.cos(a);
      var y = 300 - R * Math.sin(a);
      out.push(r.circle(x, y, 2).attr(marksAttr));
    }
    return out;
  };

  drawMarks(radius, 12); //days
  var day = r.path().attr(param).attr({arc: [0,365,radius]});
  radius -= 40;
  drawMarks(radius, 24); //hours
  var hor = r.path().attr(param).attr({arc: [0,24,radius]});
  radius -= 40;
  drawMarks(radius, 60); //minutes
  var min = r.path().attr(param).attr({arc: [0,60,radius]});
  radius -= 40;
  drawMarks(radius, 60); //seconds
  var secs = r.path().attr(param).attr({arc: [0,60,radius]});

  (function(){
     Date.prototype.dayofYear= function(){
       var d= new Date(this.getFullYear(), 0, 0);
       return Math.floor((this-d)/8.64e+7);
     }
    var d1 = new Date();
    var mb = ((d1.getTime() - refDate.getTime())/60000);
    var tdy = Math.floor(mb / (24 * 60));
    mb -= 24*60*tdy;
    var thr = Math.floor(mb / 60);
    mb -= 60*thr;
    var tmr = Math.floor(mb);
    var tsc = Math.floor((mb - tmr) * 60);
    updateVal(tdy, 365, 200, day, 0);
    updateVal(thr, 24, 160, hor, 1);
    updateVal(tmr, 60, 120, min, 2);
    updateVal(tsc, 60, 80, secs, 3);
    setTimeout(arguments.callee, 1000);
    init = 0;

  })();
})();


//get the app going - 
(function(){
  if(initializeFlag){
    $("#meetdate").val("");
    $("a[href='#settings']").click();
    $("#meetdate").blur(function(){
      $("#meetdate").parent().removeClass("hint").removeClass("hint--bottom");
      $("#addstat").addClass("hint hint--bottom");
     // navigator.notification.prompt('What info would you like to add?', addstat, 'Custom Stats', ['Cancel', 'Ok'], ''); 
    });
  }else{
    $(".hint").each(function(){$(this).removeClass("hint").removeClass("hint--bottom");});
  }
})();

setTimeout(function(){
  navigator.splashscreen.hide();
}, 2000);

