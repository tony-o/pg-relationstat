
//navigation

(function(){
  var transition = function(){
    var page  = $(this).attr("href").substr(1);
    var match = $("div[data-page='"+page+"']");
    if(match.length){
      $("div[data-page]:not([data-page='"+page+"'])").fadeOut(300);
      $(match).fadeIn(400);
    }
  };
  $("a[href^=#]").click(transition);
  $("a[href^=#]").each(function(e){ this.addEventListener('touchstart', transition, false); });
  try{
  navigator.notification.alert(
    'Message',
    function(){},
    'Title',
    'Got it'
  );
  }catch(e){ }
})();

//setup date
var refDate = new Date(2014,0,1,0,0,0);
var lastref = localStorage.getItem("refdate");
try{
  var ndate = new Date(lastref);
  if(new Date() - ndate < 0){
    throw "eerrroorr";
  }
  ndate = new Date(ndate.getTime() + ndate.getTimezoneOffset()*60000);
  refDate = ndate;
}catch(e){};
localStorage.setItem("refdate", refDate);
$("#meetdate").val(refDate.getFullYear()+"-"+("0"+(refDate.getMonth()+1)).slice(-2)+"-"+("0"+refDate.getDate()).slice(-2));

//meetingdate

(function(){
  var update = function(){
    var d = $(this).val();
    try{
      var dt = new Date(d);
      if(new Date() - dt < 0){
        throw "Date must be in the past";
      }
      //save the date;
      refDate = dt;
      localStorage.setItem("refdate", d);
    }catch(e){
      $(this).val(new Date());
    }

  };
  $("#meetdate").change(update);
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
      if(!value || value == total){
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
