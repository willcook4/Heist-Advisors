var HeistApp = HeistApp || {}

HeistApp.API_URL = "http://localhost:3000/api";

HeistApp.getTemplate = function(template, data) {
  return $.get('/templates/' + template + '.html').done(function(templateHtml) {
    var html = _.template(templateHtml)(data);
    HeistApp.$main.html(html);
  });
}

HeistApp.getHome = function() {
  event.preventDefault();
  HeistApp.getTemplate("game");
}

HeistApp.handleForm = function() {
  event.preventDefault();

  $(this).find('button').prop('disabled', true);

  var data = $(this).serialize();
  var method = $(this).attr("method");
  var url = HeistApp.API_URL + $(this).attr("action");

  return $.ajax({
    url: url,
    method: method,
    data: data
  })
  .done(HeistApp.getHome)
  .fail(HeistApp.handleFormErrors);
}

HeistApp.handleFormErrors = function(jqXHR) {
  console.log(jqXHR);
  var $form = $("form");
  for(field in jqXHR.responseJSON) {
    $form.find("input[name=" + field + "]").parents('.form-group').addClass('has-error');
  }
  $form.find('button').removeAttr('disabled');
}

HeistApp.loadPage = function() {
  event.preventDefault();
  HeistApp.getTemplate($(this).data('template'));
}

HeistApp.initEventHandlers = function() {
  this.$main = $("main");
  this.$main.on("submit", "form", this.handleForm);
  $(".navbar a").on('click', this.loadPage);
  this.$main.on("focus", "form input", function() {
    $(this).parents('.form-group').removeClass('has-error');
  });
}

HeistApp.init = function() {
  this.initEventHandlers();
}.bind(HeistApp);

$(HeistApp.init);