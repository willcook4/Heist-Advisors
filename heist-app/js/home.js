$circle = $(".circle")
$line1 = $(".line1")
$line2 = $(".line2")
var promoNum = 1


$circle.hide();
$line1.hide();
$line2.hide();
$line1.animate({width:'toggle'},1500);
$line2.animate({width:'toggle'},1500);
$circle.fadeIn(1500);

setInterval(function() {
  if(promoNum < 4){
    promoNum++;
  }else{
    promoNum = 1;
  }
  $(".background").fadeOut("slow")
  setTimeout(function(){
    $(".background").css("background-image", "url('../images/promo"+promoNum+".jpg')");
    $(".background").fadeIn("slow");
  }, 500);
}, 3000);