var HeistApp = HeistApp || {}

HeistApp.API_URL = "http://localhost:3000/api";

HeistApp.setRequestHeader = function(jqXHR) {
  var token = window.localStorage.getItem("token");
  if(!!token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
}

HeistApp.getTemplate = function(template, data) {
  return $.get('/templates/' + template + '.html').done(function(templateHtml) {
    var html = _.template(templateHtml)(data);
    HeistApp.$main.html(html);
  });
}

HeistApp.getGame = function() {
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
    data: data,
    beforeSend: HeistApp.setRequestHeader
  })
  .done(function(data) {
    if(!!data.token) {
      window.localStorage.setItem("token", data.token);
    }

    HeistApp.getGame();
  })
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

HeistApp.logout = function() {
  event.preventDefault();
  window.localStorage.clear();
  ShoeApp.updateUI();
}

HeistApp.updateUI = function() {
  var loggedIn = !!window.localStorage.getItem("token");

  if(loggedIn) {
    $('.logged-in').removeClass("hidden");
    $('.logged-out').addClass("hidden");
  } else {
    $('.logged-in').addClass("hidden");
    $('.logged-out').removeClass("hidden");
  }
}

HeistApp.initEventHandlers = function() {
  this.$main = $("main");
  this.$main.on("submit", "form", this.handleForm);
  $(".navbar a").not(".logout").on('click', this.loadPage);
  $(".navbar-nav a.logout").on('click', this.logout);
  $(".navbar a").on('click', this.loadPage);
  this.$main.on("focus", "form input", function() {
    $(this).parents('.form-group').removeClass('has-error');
  });

}

HeistApp.init = function() {
  this.initEventHandlers();
  this.updateUI();
}.bind(HeistApp);

$(HeistApp.init);