(function() {
  // variables
  var lang = ['html', 'css'], 
      n_states, interacting, count_i, nt, arr, n_el,  
      head = document.querySelector('head'), 
      style;
  var slideshow = {
    'name': 'slides',
    'wrap': null, 
    'cls': 'slide', 
    'list': null, 
    'prev': 0, 
    'curr': {
      'el': null, 
      'idx': 0, 
      'inner': {
        'listgrad': {
          'name': 'list--gradual', 
          'wrap': null, 
          'cls': 'list__item', 
          'list': null, 
          'prev': 1, 
          'curr': {
            'el': null, 
            'idx': -1
          }
        },
        'gallery': {
          'name': 'gallery--sbs', 
          'wrap': null, 
          'cls': 'gallery__item', 
          'list': null, 
          'prev': 0, 
          'curr': {
            'el': null, 
            'idx': 0
          } 
        }
      }
    }
  };
  
  var code = {
    refreshHTML: function(new_code) {
      var result = slideshow.curr.el.querySelector('.result');
      
      if(result) { result.innerHTML = new_code; }
    } /* end refreshHTML function */, 
    
    refreshCSS: function(new_code) {
      var style = document.querySelector('style.editing'), 
          test_style = getComputedStyle(slideshow.curr.el), 
          to_prefix = ['transform', 'perspective', 
                       'backface-visibility',
                       'animation', 'keyframes'];
      
      if(test_style.hasOwnProperty('-webkit-transform')) {
        for(var i = 0; i < to_prefix.length; i++) {
          new_code = 
            new_code.replace(new RegExp(to_prefix[i],"gi"), 
                             '-webkit-' + to_prefix[i]);
        }
      } /* end if(test_style.hasOwnProperty('-webkit-...')) */
      
      new_code = new_code.replace(/<\/?\w+>/gi, '');
      new_code = new_code.replace(/(\s)/gi, ' ');
      
      if(style) { style.textContent = new_code; }
    } /* end refreshCSS function */
  };
  
  // red
  var max = Math.max, min = Math.min, 
      round = Math.round, floor = Math.floor,
      int = function(n) { return Integer.parseInt(n, 10); };
  
  // utility functions
  var rand = function(max, min) {
    var max = max || 1, min = min || 0;
    
    return min + (max - min)*Math.random();
  }; /* end rand between function */
  
  var insertTextAtCursor = function(text) {
    var sel, range, new_node;
      
    if (window.getSelection) {
      sel = window.getSelection();
      
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        new_node = document.createTextNode(text)
        range.insertNode(new_node);
      }
      
      range.setStartAfter(new_node);
      range.setEndAfter(new_node); 
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }; /* end insertTextAtCursor function */
  
  var newElem = function(tag, attr) {
    var elem = document.createElement(tag);
    
    if(attr) {
      for(var a in attr) {
        elem.setAttribute(a, attr[a]);
      }
    } /* end if(attr) */
    
    return elem;
  }; /* end newElem function */
  
  // slideshow functions
  var refreshCode = function(new_code, l) {
    code['refresh' + l.toUpperCase()](new_code);
  }; /* end refreshCode function */
  
  var updateCSSBox = function(el_css, o) {
    var frag = document.createDocumentFragment(), 
        line = null, token = null, s = '';
    
    for(var i = 0; i < o.length; i++) {      
      line = document.createElement('div');
      line.textContent = o[i].selector + ' {'
      frag.appendChild(line);
      
      for(var p in o[i].rules) {
        line = document.createElement('div');
        line.textContent = '  ' + p + ':' + o[i].rules[p] + ';'
        line.textContent = line.textContent.replace(' ;', ';')
        frag.appendChild(line);
      }
      
      line = document.createElement('div');
      line.textContent = '}'
      frag.appendChild(line);
    }
    
    el_css.innerHTML = '';
    el_css.appendChild(frag);
  };
  
  var initItemsIn = function(set, parent) {
    var tmp;
    
    set.wrap = (parent || document).querySelector('.' + set.name);
    
    if(set.wrap) {
      set.list 
        = [].slice.call(set.wrap.querySelectorAll('.' + set.cls));
      tmp = set.wrap.querySelectorAll('.' + set.cls + '--current');
      set.curr.el = tmp[tmp.length - 1]
      
      if(!set.curr.el) {
        set.curr.el = null;
        set.curr.idx = -1;
      }
      else {
        set.curr.idx = set.list.indexOf(set.curr.el);
        if(set.curr.inner) {
          for(var subset in set.curr.inner) {
            initItemsIn(set.curr.inner[subset], set.curr.el);
          }
        } /*end if(set.curr.inner) */
      } /* end else branch */
    } /* end if(set.wrap) */
    
    /** console.log(slideshow); /**/
  }; /* end initItemsIn function */
  
  var move = function(set, incr) {
    var curr_cls = set.cls + '--current', 
        len = set.list.length, 
        dest_idx = set.curr.idx + incr, 
        dest, tmp;
    
    dest_idx = (set.prev) ? max(-1, min(dest_idx, len -1)) 
                          : (dest_idx + len)%len;
    
    if(set.curr.idx === dest_idx) { return; }
    
    dest = (dest_idx >= 0) ? set.list[dest_idx] : null;
    
    if(dest) {
      dest.classList.add(curr_cls);
    }
    
    if(!(set.prev === 1 && incr > 0)) {
      set.curr.el.classList.remove(curr_cls);
    }
    
    set.curr.el = dest;
    set.curr.idx = dest_idx;
    
    if(set.curr.inner) {
      for(var subset in set.curr.inner) {
        initItemsIn(set.curr.inner[subset], set.curr.el);
      }
    }
    
    if(dest) {
      if(dest.classList.contains(set.cls + '--interact')) {
          
          dest.classList.remove(set.cls + '--interact');
          dest.classList.add(set.cls + '--inited');
          
          n_states = null;
          interacting = null;
          nt = null;
          count_i = null;
          
          demos[dest.dataset.demo]();
        }
      
      tmp = dest.querySelectorAll('.box__code');
      if(tmp) {
        for(var k = 0; k < tmp.length; k++) {
          refreshCode(tmp[k].textContent, tmp[k].dataset.code);
        }
      }
    }   
  }; /* end move function */
  
  var step = function() {
    var i = floor(count_i/n_states), 
        j = count_i%n_states, 
        current = arr[i], 
        adj = arr[i - 1], 
        transf_val = '', kmax = j, 
        idx = i + 1, sel = '',
        css = slideshow.curr.el.querySelector('.box__code--css');
    
    current.classList.toggle('state--' + (j + 1));
    current.classList.add(interacting + '--current');
    
    if(css && nt) {
      if(!current.classList.contains('state--' + (j + 1))) {
        kmax = (j - 1 + n_states)%n_states;
        if(j === 0) { idx = i; }
      }
      
      for(var k = 0; k <= kmax; k ++) {
        transf_val += ' ' + nt[k];
      }
      
      sel = '.' + interacting + ':nth-child(' + idx + ')';

      if(interacting === 'circle') {
        av = idx*90/arr.length;
      }
      if(interacting === 'dot') {
        av = idx*360/arr.length;
      }

      transf_val = transf_val.replace('none ', '');
      transf_val = transf_val.replace(/360|90/, av);
      
      updateCSSBox(css, [{ 'selector': sel, 
                    'rules': { 'transform': transf_val }}]);
    }
    
    if(adj && j === n_states - 1) {
      adj.classList.toggle(interacting + '--current');
    }
  };
  
  // helper demos
  var demos = {
    polytorus: function() {
      var d 
        = slideshow.curr.el.querySelector('.torus--poly'), 
          frag = document.createDocumentFragment(), 
          tmp_c, tmp_p, n = 10, m = 10;
      
      for(var i = 0; i < n; i++) {
        tmp_c = newElem('div', 
                        {'class': 'circle--poly-approx'});
        
        for(var j = 0; j < m; j++) {
          tmp_p = newElem('div', {'class': 'torus__side'});
          tmp_c.appendChild(tmp_p);
        }
        
        frag.appendChild(tmp_c);
      }
      
      d.appendChild(frag);
    } /* end polytorus function */, 
        
    boo: function() {
      var b = slideshow.curr.el.querySelector('.boo'), 
          axes = b.querySelector('.guides');
      
      b.addEventListener('dblclick', function(e) {
        axes.classList.toggle('hidden');
      }, false); /* end double click listener */
    } /* end boo */, 
    
    spotty: function() {
      var s = slideshow.curr.el.querySelector('.circle--spotty'), 
          frag = document.createDocumentFragment(), 
          tmp, n = 12;
      
      for(var i = 0; i < n; i++) {
        tmp = newElem('div', {'class': 'dot dot--spotty'});
        
        if(i === 0) {
          tmp.classList.add('state--1');
        }
        
        frag.appendChild(tmp);
      }
      
      s.appendChild(frag);
      
      n_states = 4; /* visible, rotateZ, translateX, rotateY */
      interacting = 'dot';
      arr 
        = slideshow.curr.el.querySelectorAll('.' + interacting);
      n_el = arr.length;
      count_i = 1;
      nt = ['none', 
            'rotate(360deg)', 'translate(6.5em)', 'rotateY(90deg)'];
    } /* end spotty */, 
        
    doughnut: function() {
      var d 
        = slideshow.curr.el.querySelector('.torus--doughnut'), 
          frag = document.createDocumentFragment(), 
          tmp_c, tmp_p, n = 5, m = 12;
      
      for(var i = 0; i < n; i++) {
        tmp_c = newElem('div', 
                        {'class': 'circle circle--doughnut'});
        
        if(i === 0) {
          tmp_c.classList.add('state--1');
        }
        
        for(var j = 0; j < m; j++) {
          tmp_p = newElem('div', {'class': 'dot dot--doughnut'});
          tmp_c.appendChild(tmp_p);
        }
        
        frag.appendChild(tmp_c)
      }
      
      d.appendChild(frag);
      
      n_states = 3; /* visible, rotateY, translateX */
      interacting = 'circle';
      count_i = 1;
      arr 
        = slideshow.curr.el.querySelectorAll('.' + interacting);
      n_el = arr.length;
      nt = ['none', 
            'rotateY(-90deg)', 'translate(10.5em)'];
    } /* end doughnut */, 
    
    pretty: function() {
      var s = slideshow.curr.el.querySelector('.circle--pretty'), 
          frag = document.createDocumentFragment(), 
          tmp, n = 12;
      
      for(var i = 0; i < n; i++) {
        tmp = newElem('div', {'class': 'dot dot--pretty'});
        frag.appendChild(tmp);
      }
      
      s.appendChild(frag);
    } /* end pretty */,
    
    ani: function() {
      var d 
        = slideshow.curr.el.querySelector('.torus--ani'), 
          frag = document.createDocumentFragment(), 
          tmp_c, tmp_r, tmp_p, n = 6, m = 12;
      
      for(var i = 0; i < n; i++) {
        tmp_c = newElem('div', 
                 {'class': 'circle circle--ani'});
        tmp_r = newElem('div', {'class': 'rotor'});
        
        for(var j = 0; j < m; j++) {
          tmp_p = newElem('div', 
                          {'class': 'dot dot--pretty dot ani'});
          tmp_r.appendChild(tmp_p);
        }
        tmp_c.appendChild(tmp_r);
        
        frag.appendChild(tmp_c)
      }
      
      d.appendChild(frag);
    } /* end ani */
  }
  
  // init the whole thing
  initItemsIn(slideshow);
  style = newElem('style', {'class': 'editing'});
  head.appendChild(style);
  
  // event listeners
  addEventListener('keydown', function(e) {
    var key = e.keyCode, 
        focused = document.activeElement, 
        keys = [35 /* end */,
                36 /* home */,
                37 /* arrow left */,
                38 /* arrow up */,
                39 /* arrow right */,
                40 /* arrow down */], 
        tmp;
    
    // special behaviour for code box
    if(focused.classList.contains('box__code')) {
      if(key === 9) { /* tab */
        e.preventDefault();
      }
      return;
    } /* end if(focused.classList.contains('box__code')) */
    
    // if navigation keys
    if(keys.indexOf(key) > -1) {
      e.preventDefault();
    } /* end if(key in keys) */
    
    switch(key) {
      case 39: /* arrow right: to next slide */
        move(slideshow, 1);
        break;
      case 37: /* arrow left: to previous slide */
        move(slideshow, -1);
        break;
      case 36: /* home: to first slide */
        move(slideshow, -slideshow.curr.idx);
        break;
      case 35: /* end: to last slide */
        move(slideshow, 
             slideshow.list.length - 1 - slideshow.curr.idx);
        break;
      case 40: /* arrow down: next slide view */
        for(var subset in slideshow.curr.inner) {
          if(slideshow.curr.inner[subset].wrap) {
            move(slideshow.curr.inner[subset], 1);
          }
        }
        break;
      case 38: /* arrow up: previous slide view */
        for(var subset in slideshow.curr.inner) {
          if(slideshow.curr.inner[subset].wrap) {
            move(slideshow.curr.inner[subset], -1);
          }
        }
        break;
      case 78: /* N: go to next state of interactive demo */
        if(slideshow.curr.el.classList.contains('slide--inited') 
           && count_i < n_el*n_states) {
          step();
          count_i++;
        }
        break;
      case 80: /* P: go to previous state of interactive demo */
        if(slideshow.curr.el.classList.contains('slide--inited') 
           && count_i > 1) {
          count_i--;
          step();
        }
        break;
    } /* end switch */
    
    // if navigation keys
    if(keys.indexOf(key) > -1) {
      tmp = 'hsl(' + round(rand(360)) + ', 100%, ' 
          + ((slideshow.curr.el.classList.contains('dark'))?0:90 
          + round(rand(10))) + '%)';
      
      slideshow.curr.el.style['background-color'] = tmp;
    } /* end if(key in keys) */
        
  }, false); /* end keydown listener */
  
  addEventListener('keyup', function(e) {
    var key = e.keyCode, 
            focused = document.activeElement, 
            delay = 1000, 
            timer;
        
        if(!focused.classList.contains('box__code')) return;
        
        if(key == 9) {
          insertTextAtCursor('  ');
          e.preventDefault();
        }
        
        if (typeof timer !== undefined) {
          clearTimeout(timer);
          timer = 0;
        }
        
        for(var i = 0; i < lang.length; i++) {
          if(focused.classList.contains('box__code--' + lang[i])) {
            timer = setTimeout(refreshCode(focused.textContent, 
                                          lang[i]), 
                               delay);
          }
        }
  }, false); /* end keyup listener */

  slideshow.wrap.addEventListener('dblclick', function(e) {
    var t = e.target, 
        toon = slideshow.curr.el.querySelector('.cartoon');

    if(toon) {
      toon.classList.toggle('cartoon--current');
    }

  }, false);
  
} ());