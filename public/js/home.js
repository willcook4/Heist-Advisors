$(".disclaimer-info").hide();

$(".disclaimer").on("click", function(){
  $(".text").hide();
  $(".disclaimer-info").show();
  $( ".text" ).slideToggle("slow");
  $(".text-top").animate({top: "44px"}, 600);
  $(".text-bottom").animate({bottom: "44px"}, 600);
  $(".close").animate({bottom: "58px"}, 600);
});

$(".close").on("click", function(){
  $( ".text" ).slideToggle("slow", function(){
    $(".disclaimer-info").hide();
  });
  $(".text-top").animate({top: "287px"}, 550);
  $(".text-bottom").animate({bottom: "287px"}, 550);
  $(".close").animate({bottom: "291px"}, 550);
});