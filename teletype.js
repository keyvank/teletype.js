function teletype(element, callback) {
  var enabled = false;
  this.disable = function() {
    enabled = false;
  }
  this.enable = function() {
    enabled = true;
  }

  var fake_textarea = document.createElement("textarea");
  fake_textarea.style.position = 'absolute';
  fake_textarea.style.width = '100%';
  fake_textarea.style.height = '100%';
  fake_textarea.style.opacity = '0.01';
  fake_textarea.setAttribute('autocorrect','off');
  fake_textarea.setAttribute('autocapitalize','off');
  element.appendChild(fake_textarea);

  element.setAttribute('tabindex', '0');
  element.style.lineHeight = element.style.fontSize;
  element.style.wordBreak = 'break-all';
  element.style.overflowWrap = 'break';
  element.style.boxSizing = 'border-box';
  element.style.paddingBottom = element.style.fontSize;

  var that = this;
  var input = '';

  var queue = [];
  var printing = false;

  this.printHTML = function(html, options = {}, _go = false, _node = null, _printed = '') {
    if (!_go && _printed == '') {
      if (printing) {
        queue.push([html, options]);
        return;
      } else if (options.wait) {
        printing = true;
        setTimeout(that.printHTML, options.wait, html, options, true, _printed);
        return;
      }
    }
    if (options.delay && html.length > 0) {
      printing = true;
      var i = 0;
      var prnt = '';
      if (!_node) {
        _node = document.createElement("span");
        element.appendChild(_node);
      }
      if (html[0] == '<') {
        prnt += '<';
        while (i < html.length && html[i] != '>') {
          i++;
          prnt += html[i];
        }
        _printed += prnt;
        _node.innerHTML = _printed;
      } else if (html[0] == '&') {
        prnt += '&';
        while (i < html.length && html[i] != ';') {
          i++;
          prnt += html[i];
        }
        _printed += prnt;
        _node.innerHTML = _printed;
      } else {
        _printed += html[i];
        _node.innerHTML = _printed;
      }
      teletype.scrollBottom(element);
      setTimeout(that.printHTML, options.delay, html.substr(i + 1), options, true, _node, _printed);
    } else {
      if(!_node)
        element.insertAdjacentHTML('beforeend', html);
      printing = false;
      if (options.enable) {
        enabled = true;
      }
      if (queue.length > 0) {
        var job = queue.shift();
        setTimeout(that.printHTML, job[1].wait, job[0], job[1], true);
      }
    }
  }

  this.printText = function(text, style, options = {}) {
    var html = teletype.encodeHTML(text);
    if (style)
      that.printHTML("<span style='" + style + "'>" + html + "</span>", options);
    else
      that.printHTML(html, options);
  }

  this.clear = function() {
    input = '';
    element.innerHTML = '';
    teletype.scrollBottom(element);
  }

  var command_cache = [];
  var command_cache_position = null;

  function keydown(e) {
    if (!enabled)
      return false;

    if (e.keyCode == 13) { // Enter
      command_cache.push(input);
      command_cache_position = command_cache.length;
      element.innerHTML += '<br>';
      callback(teletype.decodeHTML(input));
      input = '';
      prompt_node = null;
      teletype.scrollBottom(element);
      return false;
    } else if (e.keyCode == 8) { // Backspace
      if (input.length > 0) {
        var decode = teletype.decodeHTML(input);
        input = teletype.encodeHTML(decode.slice(0, -1));
        prompt_node.innerHTML = input;
        return false;
      }
    } else if (e.keyCode == 38 || e.keyCode == 40) { // Arrow keys
      var changed = false;
      if (e.keyCode == 38 && command_cache_position > 0) {
        changed = true;
        command_cache_position--;
      } else if (e.keyCode == 40 && command_cache_position < command_cache.length - 1) {
        changed = true;
        command_cache_position++;
      }
      if (changed) {
        if(!prompt_node) {
          prompt_node = document.createElement('span');
          element.appendChild(prompt_node);
        }
        input = command_cache[command_cache_position]
        prompt_node.innerHTML = input;
      }
      return false;
    } else
      return true;
  }
  fake_textarea.addEventListener('keydown', keydown);

  var prompt_node = null;
  function keypress(e) {
    if (!enabled)
      return false;

    if (e.keyCode != 13) { // Enter
      if(!prompt_node) {
        prompt_node = document.createElement('span');
        element.appendChild(prompt_node);
      }
      var html = teletype.encodeHTML(String.fromCharCode(e.keyCode));
      input += html;
      prompt_node.innerHTML = input;
      teletype.scrollBottom(element);
    }
    return false;
  }
  fake_textarea.addEventListener('keypress', keypress);
}

teletype.scrollBottom = function(element) {
  element.scrollTop = element.scrollHeight;
}
teletype.encodeHTML = function(text) {
  var div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}
teletype.decodeHTML = function(html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
}
