function teletype(element, callback) {
  this.enabled = false;
  this.current = '';
  this.element = element;
  this.element.setAttribute('tabindex','0');
  this.element.style.lineHeight = element.style.fontSize;
  this.element.style.wordBreak = 'break-all';
  this.element.style.overflowWrap = 'break';
  this.element.style.fontFamily = 'monospace';
  var command_list = [];
  var command_list_position = null;

  var that = this;
  this.element.addEventListener('keydown', function(e) {
    if (e.keyCode == 13) {
        command_list.push(that.current);
        command_list_position = command_list.length;
        that.element.innerHTML += '<br>';
        callback(that.current);
        that.current = '';
        that.element.scrollTop = that.element.scrollHeight;
        return false;
    }
    else if (e.keyCode == 8) {
        if (that.current.length > 0) {
          that.element.innerHTML = that.element.innerHTML.slice(0, -1);;
          that.current = that.current.slice(0, -1);
          return false;
        }
    }
    else if(e.keyCode == 38) {
      if(command_list_position > 0) {
        command_list_position--;
        if(that.current.length > 0)
          that.element.innerHTML = that.element.innerHTML.slice(0, -that.current.length);
        that.current = command_list[command_list_position];
        that.element.innerHTML += that.current;
      }
      return false;
    }
    else if(e.keyCode == 40) {
      if(command_list_position < command_list.length - 1) {
        command_list_position++;
        if(that.current.length > 0)
          that.element.innerHTML = that.element.innerHTML.slice(0, -that.current.length);
        that.current = command_list[command_list_position];
        that.element.innerHTML += that.current;
      }
      return false;
    }
    else
        return true;
  });
  this.element.addEventListener('keypress', function(e) {
    if(that.enabled && e.keyCode != 13) {
      var tmp = document.createElement("div");
      tmp.innerText = String.fromCharCode(e.keyCode);
      that.current += tmp.innerHTML;
      that.element.innerHTML += tmp.innerHTML;
      that.element.scrollTop = that.element.scrollHeight;
    }
    return false;
  });
}

teletype.prototype.print = function(str) {
  this.element.innerHTML += str;
  this.element.scrollTop = this.element.scrollHeight;
}

teletype.prototype.clear = function() {
  this.all_text = '';
  this.current = '';
  this.element.innerHTML = '';
  this.element.scrollTop = this.element.scrollHeight;
}

teletype.prototype.disable = function() {
  this.enabled = false;
  this.element.scrollTop = this.element.scrollHeight;
}
teletype.prototype.enable = function() {
  this.enabled = true;
  this.element.scrollTop = this.element.scrollHeight;
}
