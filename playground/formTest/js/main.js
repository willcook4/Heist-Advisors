$('form').on('submit', function(event){
  event.preventDefault();
  var data = {'a': 'AA', 'b': 'BB'};
  console.log($.param(data));
});

