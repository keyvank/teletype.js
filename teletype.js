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


  this.printHTML = function(html, delay, tmp = '') {
    if(html.length > 0) {
      var i = 0;
      var prnt = '';
      if(tmp.length > 0)
        element.innerHTML = element.innerHTML.slice(0, -tmp.length);
      if(html[0] == '<') {
        prnt += '<';
        while(i < html.length && html[i] != '>') {
          i++;
          prnt += html[i];
        }
        tmp += prnt;
        element.innerHTML += tmp;
      }
      else if(html[0] == '&') {
        prnt += '&';
        while(i < html.length && html[i] != ';') {
          i++;
          prnt += html[i];
        }
        tmp += prnt;
        element.innerHTML += tmp;
      }
      else {
        tmp += html[i];
        element.innerHTML += tmp;
      }
      scrollBottom();
      setTimeout(that.printHTML, delay, html.substr(i+1), delay, tmp);
    }
    else
      element.innerHTML += html;
  }
  this.printText = function(text, style, delay) {
    var html = encodeHTML(text);
    if(style)
      that.printHTML("<span style='" + style + "'>" + html + "</span>", delay);
    else
      that.printHTML(html, delay);
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
