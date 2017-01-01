(function(){
  "use strict";

  // setup the form with default values
  var configInput = $('#config'),
    actionInput = $('#action'),
    formOutput = $('#form-output');

  function splitInto(input, separator, tokenCount){
    var tokens = input.split(separator), outTokens = [];

    outTokens = tokens.splice(0, tokenCount - 1);
    if (tokens.length > 0){
      outTokens.push(tokens.join(separator));
    }

    return outTokens;
  }

  // source: http://stackoverflow.com/a/901144/24105
  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  actionInput.val(getParameterByName('action'))

  // takes a line and returns an input
  //    input:name
  function parseInput(line){
    if (line == "") {
      return null;
    }

    var name, type,
      firstIndex = line.indexOf(":"),
      secondIndex = line.indexOf(":"),

    [name, type] = line.split(":");

    type = type ||  "text";

    return {
      id: name, name: name,
      type: type,
    }
  }

  // takes a config in the form of and returns a list of html elements
  //    input:name
  //    text:age
  //    textarea:message:Default message here
  //    file:resume
  //    save:submit:Send Message
  function parseForm(config) {
    return config.replace(/\r\n/, "\n")
      .replace(/\r/, "\n")
      .replace(/\n+/, "\n")
      .split("\n")
      .map(line => parseInput(line.trim()))
  }

  var renderers = {
    text: function({id, name, type}){
      return `  <input id="${id}" name="${name}" type="${type}" />`;
    },
    textarea: function({id, name}){
      return `  <textarea id="${id}" name="${name}"></textarea>`;
    },
    submit: function({id, name}){
      id = id.toLowerCase().replace(/[^a-z_0-9-]/, '-').replace(/-+/, '-');
      return `  <button id="${id}" type='submit'>${name}</button>`;
    },

  }

  // takes a config in the form of
  //    input:name
  //    text:age
  //    textarea:message
  //    file:resume
  //    submit:Save
  function renderForm(config, action){
    var elements = parseForm(config).filter(el => el),
      innerForm = elements
      .map(el => (renderers[el.type] || renderers["text"])(el))
      .join("\n");

    var formAttributes = [['method', '"post"'], ['action', `"${action || 'change-me'}"`]];

    if (elements.find(x => x.type == "file")) {
      formAttributes.push(['enctype', '"multipart/form-data"'])
    }

    var formAttributesHTML = formAttributes.map(x => x.join("=")).join(" ")
    return `<form ${formAttributesHTML}>
${ innerForm }
</form>`
  }

  $('#config,#action').on('keyup', function(){
    var config = configInput.val(),
      action = actionInput.val(),
      html = renderForm(config, action);
    formOutput.text(html);
  }).trigger('keyup');
})()
