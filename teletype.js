function teletype(element, callback) {
  var enabled = false;
  this.disable = function() { enabled = false; }
  this.enable = function() { enabled = true; }

  element.setAttribute('tabindex','0');
  element.style.lineHeight = element.style.fontSize;
  element.style.wordBreak = 'break-all';
  element.style.overflowWrap = 'break';
  element.style.fontFamily = 'monospace'
  element.style.boxSizing = 'border-box';
  element.style.paddingBottom = element.style.fontSize;

  var that = this;
  var current = '';

  function scrollBottom() { element.scrollTop = element.scrollHeight; }

  var queue = [];
  var printing = false;

  this.printHTML = function(html, options = {}, _go = false, _html = '', _printed = '') {
    if(!_go && _printed == '') {
      if(printing) {
        queue.push([html, options]);
        return;
      }
      else if(options.wait) {
        printing = true;
        setTimeout(that.printHTML, options.wait, html, options, true, _printed);
        return;
      }
    }
    if(options.delay && html.length > 0) {
      printing = true;
      var i = 0;
      var prnt = '';
      if(!_html)
        _html = element.innerHTML;
      if(html[0] == '<') {
        prnt += '<';
        while(i < html.length && html[i] != '>') {
          i++;
          prnt += html[i];
        }
        _printed += prnt;
        element.innerHTML = _html + _printed;
      }
      else if(html[0] == '&') {
        prnt += '&';
        while(i < html.length && html[i] != ';') {
          i++;
          prnt += html[i];
        }
        _printed += prnt;
        element.innerHTML = _html + _printed;
      }
      else {
        _printed += html[i];
        element.innerHTML = _html + _printed;
      }
      scrollBottom();
      setTimeout(that.printHTML, options.delay, html.substr(i+1), options, true, _html, _printed);
    }
    else {
      element.innerHTML += html;
      printing = false;
      if(options.enable) { enabled = true; }
      if(queue.length > 0) {
        var job = queue.shift();
        setTimeout(that.printHTML, job[1].wait, job[0], job[1], true);
      }
    }
  }
  this.printText = function(text, style, options = {}) {
    var html = encodeHTML(text);
    if(style)
      that.printHTML("<span style='" + style + "'>" + html + "</span>", options);
    else
      that.printHTML(html, options);
  }

  this.clear = function() { current = ''; element.innerHTML = ''; scrollBottom(); }


  function encodeHTML(text) { var tmp = document.createElement("div"); tmp.innerText = text; return tmp.innerHTML; }
  function decodeHTML(html) { var tmp = document.createElement("div"); tmp.innerHTML = html; return tmp.innerText; }

  var command_cache = [];
  var command_cache_position = null;
  element.addEventListener('keydown', function(e) {
    if(!enabled)
      return true;

    if (e.keyCode == 13) {
        command_cache.push(current);
        command_cache_position = command_cache.length;
        element.innerHTML += '<br>';
        callback(decodeHTML(current));
        current = '';
        scrollBottom();
        return false;
    }
    else if (e.keyCode == 8) {
        if (current.length > 0) {
          var decode = decodeHTML(current);
          element.innerHTML = element.innerHTML.slice(0, -encodeHTML(decode[decode.length - 1]).length);
          current = encodeHTML(decode.slice(0, -1));
          return false;
        }
    }
    else if(e.keyCode == 38) {
      if(command_cache_position > 0) {
        command_cache_position--;
        if(current.length > 0)
          element.innerHTML = element.innerHTML.slice(0, -current.length);
        current = command_cache[command_cache_position];
        element.innerHTML += current;
      }
      return false;
    }
    else if(e.keyCode == 40) {
      if(command_cache_position < command_cache.length - 1) {
        command_cache_position++;
        if(current.length > 0)
          element.innerHTML = element.innerHTML.slice(0, -current.length);
        current = command_cache[command_cache_position];
        element.innerHTML += current;
      }
      return false;
    }
    else
        return true;
  });

  element.addEventListener('keypress', function(e) {
    if(!enabled)
      return true;
    if(e.keyCode != 13) {
      var html = encodeHTML(String.fromCharCode(e.keyCode));
      current += html;
      element.innerHTML += html;
      scrollBottom();
    }
    return false;
  });

}
