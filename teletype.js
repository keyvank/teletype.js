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

  this.printHTML = function(html) { element.innerHTML += html; scrollBottom(); }
  this.printText = function(text) { element.innerText += text; scrollBottom(); }
  this.printStyled = function(text, style) { that.printHTML("<span style='" + style + "'>" + encodeHTML(text) + "</span>"); }
  
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
          element.innerText = element.innerText.slice(0, -1);
          current = encodeHTML(decodeHTML(current).slice(0, -1));
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
