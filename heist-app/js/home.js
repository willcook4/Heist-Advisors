$circle = $(".circle")
$line1 = $(".line1")
$line2 = $(".line2")

$circle.hide();
$line1.hide();
$line2.hide();
$line1.animate({width:'toggle'},1500);
$line2.animate({width:'toggle'},1500);
$circle.fadeIn(1500);