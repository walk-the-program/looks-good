/* Instrument chassis runtime: capture dots, the corner
     readouts and the Animate / Export disclosures. The tool's own code is untouched. */
(function(){
  "use strict";
  var $=function(s){return document.querySelector(s);};

  /* ---- the reticle circumscribes whatever the canvas currently is ------ */
  (function reticle(){
    var stage=$(".z-stage"), ring=$(".ring"), c=$("#art");
    if(!stage||!ring||!c) return;
    function size(){
      var b=c.getBoundingClientRect(), s=stage.getBoundingClientRect();
      if(!b.width) return;
      var d=Math.hypot(b.width,b.height)+38;
      d=Math.min(d,Math.min(s.width,s.height));
      stage.style.setProperty("--ring",Math.round(d)+"px");
    }
    size();
    if(window.ResizeObserver){ new ResizeObserver(size).observe(c); new ResizeObserver(size).observe(stage); }
    addEventListener("resize",size);
  })();

  /* whole-number sliders get a notch per step, but only when they fit */
  function notches(){
    document.querySelectorAll(".pr input[type=range]").forEach(function(el){
      var tr=el.parentNode;
      if(tr.__notched) return;
      var w=tr.clientWidth;
      if(!w) return;                      /* inside a collapsed group — try again later */
      tr.__notched=1;
      var min=parseFloat(el.min),max=parseFloat(el.max),st=parseFloat(el.step);
      if(!isFinite(st)||st<=0) return;
      var n=Math.round((max-min)/st);
      if(n<2||n>8||w/n<16) return;
      for(var i=1;i<n;i++){
        var s=document.createElement("span");
        s.className="notch";
        s.style.left="calc(var(--tw)/2 + (100% - var(--tw)) * "+(i/n).toFixed(4)+")";
        tr.appendChild(s);
      }
    });
  }
  notches();

  /* ---- the columns fade out at the foot while there is more to scroll -- */
  var boxes=[$(".l-scroll"),$(".z-right")].filter(Boolean);
  function fade(el){
    var more=el.scrollHeight-el.clientHeight-el.scrollTop;
    el.style.setProperty("--fade", more>2 ? "56px" : "0px");
  }
  function fadeAll(){ boxes.forEach(fade); }
  boxes.forEach(function(el){
    el.addEventListener("scroll",function(){fade(el);},{passive:true});
    if(window.ResizeObserver) new ResizeObserver(function(){fade(el);}).observe(el);
  });
  addEventListener("resize",fadeAll);
  /* opening or closing a parameter group changes both the fade and the notches */
  document.addEventListener("toggle",function(){
    notches(); fadeAll(); syncDisabled();
  },true);
  fadeAll();

  /* ---- dragging a slider with a finger ---------------------------------
     A range input on a phone is the browser's to interpret, and the browser
     would rather scroll. A finger does not travel in a straight line, so a
     drag along a slider that wanders twenty pixels off horizontal gets taken
     for a swipe: the page does not move, the slider does not move, and the
     control reads as broken. Take the gesture over instead. Once a finger has
     travelled further sideways than up or down the slider claims it, and from
     then on the value is read straight off the x position — which is also
     truer to the finger than the browser's own handling. A drag that starts
     out vertical is handed straight back, so the panel still scrolls when you
     swipe it. The mouse is left alone: it was never the problem. */
  function slideTo(el,x){
    var r=el.getBoundingClientRect();
    /* the dot has width, and its centre can only reach half of that in from
       either end -- the same inset the drawn fill line is built on */
    var tw=parseFloat(getComputedStyle(el.parentNode).getPropertyValue("--tw"))||10;
    var lo=r.left+tw/2, hi=r.right-tw/2;
    if(hi<=lo) return;
    var p=(x-lo)/(hi-lo); p=p<0?0:p>1?1:p;
    var min=parseFloat(el.min)||0, max=parseFloat(el.max);
    var step=parseFloat(el.step)||1;
    if(!isFinite(max)) return;
    var v=min+Math.round((min+(max-min)*p-min)/step)*step;
    v=Math.max(min,Math.min(max,v));
    /* a step of 0.05 lands on 0.30000000000000004 without this */
    var dp=(String(step).split(".")[1]||"").length;
    var out=dp?v.toFixed(dp):String(v);
    if(out!==el.value){ el.value=out; el.dispatchEvent(new Event("input",{bubbles:true})); }
  }
  document.querySelectorAll(".pr input[type=range], #scrub").forEach(function(el){
    var id=null, held=false, sx=0, sy=0;
    el.addEventListener("pointerdown",function(e){
      if(e.pointerType==="mouse"||el.disabled) return;
      id=e.pointerId; held=false; sx=e.clientX; sy=e.clientY;
    });
    el.addEventListener("pointermove",function(e){
      if(e.pointerId!==id) return;
      if(!held){
        var dx=Math.abs(e.clientX-sx), dy=Math.abs(e.clientY-sy);
        if(dx<4&&dy<4) return;
        if(dy>dx){ id=null; return; }   /* a swipe -- let the page have it */
        held=true;
        try{ el.setPointerCapture(e.pointerId); }catch(_){}
      }
      e.preventDefault();
      slideTo(el,e.clientX);
    });
    function done(e){
      if(e.pointerId!==id) return;
      if(held){ try{ el.releasePointerCapture(e.pointerId); }catch(_){} }
      id=null; held=false;
    }
    el.addEventListener("pointerup",done);
    el.addEventListener("pointercancel",done);
  });

  /* ---- inert rows ------------------------------------------------------
     A tool may drive one control from another and disable the passenger --
     Specimen derives Rows from Columns while Square cells is on. Left on
     screen the passenger slides about under a cursor that can never grab
     it, which reads as a broken control. Hide the row while it is inert and
     bring it back the moment it can be used again. Rows the tool itself had
     already hidden are left alone: only rows this marks are unhidden. */
  function syncDisabled(){
    var changed=false;
    document.querySelectorAll(".pr input[type=range]").forEach(function(el){
      var pr=el.closest(".pr"); if(!pr) return;
      var mine=pr.hasAttribute("data-inert");
      if(el.disabled && !mine){
        if(pr.hidden) return;
        pr.setAttribute("data-inert","");pr.hidden=true;changed=true;
      }else if(!el.disabled && mine){
        pr.removeAttribute("data-inert");pr.hidden=false;changed=true;
      }
    });
    if(changed){ notches(); fadeAll(); }
  }
  syncDisabled();

  /* ---- single-choice groups -------------------------------------------
     A tool with one movement has nothing to choose between, and a chip row
     you cannot change is the same dead control as a slider you cannot drag.
     Hide the row; the name of the one movement is already on the pill. */
  (function(){
    var modes=document.getElementById("modes");
    if(!modes) return;
    var only=modes.querySelectorAll(".chip,[role=option]").length<2;   /* chips or a dropdown */
    var row=modes.closest(".misc")||modes.parentElement;
    if(row&&only&&!row.hidden){ row.setAttribute("data-inert",""); row.hidden=true; }
  })();

  /* ---- Rotate, for tools that never had one ----------------------------
     Ten tools could only ever deal a whole new palette; there was no way to
     keep the colours you liked and move them around. Rotating the swatch row
     is exactly what the tool-side Rotate buttons do, and each swatch input
     already carries that tool's own change handler, so driving them from
     here needs no per-tool code and cannot fall out of step with it. */
  var rotBtn=document.getElementById("rotInks");
  if(rotBtn){
    var swHost=document.getElementById("swatches");
    var inksIn=function(){
      return swHost?[].slice.call(swHost.querySelectorAll('input[type=color]')):[];
    };
    /* a single colour cannot be rotated; don't leave a dead control sitting there */
    var syncRot=function(){ rotBtn.hidden=inksIn().length<2; };
    syncRot();
    if(window.MutationObserver&&swHost)
      new MutationObserver(syncRot).observe(swHost,{childList:true,subtree:true});
    rotBtn.addEventListener("click",function(){
      var ins=inksIn();
      if(ins.length<2) return;
      var vals=ins.map(function(i){return i.value;});
      vals.push(vals.shift());
      ins.forEach(function(inp,i){
        if(inp.value===vals[i]) return;
        inp.value=vals[i];
        inp.dispatchEvent(new Event("input",{bubbles:true}));
      });
    });
  }

  /* ---- My colors -------------------------------------------------------
     One saved set, kept by the browser under a single key for the whole
     site, so a set saved in one tool is already there when any other tool
     opens. The switch turns the Color block into that set: the swatch row
     is the set, New colors becomes Shuffle, the swatches can be dragged
     into a new order, and a hand edit offers Save changes. It drives the
     swatch inputs themselves, as Rotate does, so every tool's own colour
     handling stays in charge. */
  (function(){
    var tog=document.getElementById("mycTog");
    if(!tog) return;
    var KEY="ptrn.mycolors";
    var saveB=document.getElementById("mycSave"),
        editB=document.getElementById("mycEdit"), panel=document.getElementById("mycPanel"),
        ta=document.getElementById("mycText"), okB=document.getElementById("mycApply"),
        copyB=document.getElementById("mycCopy"), rmB=document.getElementById("mycRemove"),
        hint=document.getElementById("mycHint"), myc=document.getElementById("myc"),
        home=document.getElementById("mycHome"), swHost=document.getElementById("swatches"),
        shufB=document.getElementById("shufColors"),
        rotB=document.getElementById("rotColors")||document.getElementById("rotInks");
    var MY={cols:[],on:false};
    var isHex=function(v){ return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v).trim()); };
    var norm=function(v){
      v=String(v).trim().replace("#","").toLowerCase();
      if(v.length===3) v=v.split("").map(function(c){return c+c;}).join("");
      return "#"+v;
    };
    var parseList=function(text){
      var out=[], seen={};
      String(text||"").split(/[\s,;]+/).forEach(function(w){
        if(!isHex(w)) return;
        var h=norm(w); if(seen[h]) return; seen[h]=1; out.push(h);
      });
      return out;
    };
    function load(){
      try{
        var j=JSON.parse(localStorage.getItem(KEY)||"null");
        if(j&&j.cols instanceof Array){ MY.cols=parseList(j.cols.join(" ")); MY.on=!!j.on&&MY.cols.length>0; }
      }catch(e){}
    }
    function store(){ try{ localStorage.setItem(KEY,JSON.stringify({v:1,cols:MY.cols,on:MY.on})); }catch(e){} }

    /* the inks this tool has: its swatch row, or, for a tool with no row,
       the loose colour fields in the rail */
    function slots(){
      var ins=swHost?[].slice.call(swHost.querySelectorAll('input[type=color]')):[];
      if(!ins.length){
        var col=document.querySelector(".z-left")||document.body;
        ins=[].slice.call(col.querySelectorAll('input[type=color]')).filter(function(i){
          return !i.closest(".cpick")&&!i.closest("#myc"); });
      }
      return ins;
    }
    function vals(){ return slots().map(function(i){return i.value.toLowerCase();}); }

    function hsl(hex){
      var n=parseInt(hex.slice(1),16)||0, r=((n>>16)&255)/255, g=((n>>8)&255)/255, b=(n&255)/255;
      var mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn, l=(mx+mn)/2, sa=0, hu=0;
      if(d){ sa=l>0.5?d/(2-mx-mn):d/(mx+mn);
        if(mx===r) hu=(g-b)/d+(g<b?6:0); else if(mx===g) hu=(b-r)/d+2; else hu=(r-g)/d+4; hu*=60; }
      return [hu,sa,l];
    }
    function hex(h,s,l){
      h=((h%360)+360)%360; s=Math.min(1,Math.max(0,s)); l=Math.min(1,Math.max(0,l));
      var a=s*Math.min(l,1-l);
      var f=function(n){ var k=(n+h/30)%12; var v=l-a*Math.max(-1,Math.min(k-3,9-k,1));
        return Math.round(v*255).toString(16).padStart(2,"0"); };
      return "#"+f(0)+f(8)+f(4);
    }
    /* n inks from the set. Enough of them: the first n, in the order given.
       Too few: the rest are tints and shades of the set's own colours, taken
       in turn, a step further each lap, so a two-colour brand still gives a
       seven-ink tool something that belongs to it. */
    function fit(cols,n){
      var out=[], derived=[];
      for(var k=0;k<n;k++){
        if(k<cols.length){ out.push(cols[k]); continue; }
        var base=cols[k%cols.length], c=hsl(base), lap=Math.floor(k/cols.length);
        var dir=(lap&1)?1:-1; if(c[2]>0.62) dir=-dir;
        var amt=(0.2+0.02*lap)*Math.ceil(lap/2)+0.04;
        var l=Math.min(0.94,Math.max(0.07,c[2]+dir*amt));
        var v=hex(c[0],c[1]*(dir>0?0.85:1),l), tries=0;
        while((out.indexOf(v)>=0||cols.indexOf(v)>=0)&&tries<6){ l=Math.min(0.94,Math.max(0.07,l+dir*0.07)); v=hex(c[0],c[1],l); tries++; }
        out.push(v); derived.push(v);
      }
      return {list:out,derived:derived};
    }
    function shuffled(a){
      var b=a.slice();
      for(var i=b.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0; var t=b[i]; b[i]=b[j]; b[j]=t; }
      return b;
    }

    var applying=false, applied=null, derivedSet={}, own=null;
    function apply(list,derived){
      applying=true;
      derivedSet={}; (derived||[]).forEach(function(c){ derivedSet[c]=1; });
      for(var i=0;i<list.length;i++){
        var inp=slots()[i]; if(!inp) break;
        if(inp.value.toLowerCase()===list[i]) continue;
        inp.value=list[i];
        inp.dispatchEvent(new Event("input",{bubbles:true}));
      }
      applied=list.slice(0,slots().length);
      applying=false;
      mark(); ui();
    }
    function mark(){
      if(swHost){ if(MY.on) swHost.setAttribute("data-mine",""); else swHost.removeAttribute("data-mine"); }
      slots().forEach(function(inp){
        var host=inp.closest(".sw")||inp.parentElement; if(!host) return;
        if(MY.on&&derivedSet[inp.value.toLowerCase()]) host.setAttribute("data-derived","");
        else host.removeAttribute("data-derived");
      });
    }
    /* drifted: the inks in front of you are no longer the ones the set gave,
       as a collection: Rotate and a drag move them round and are not a drift */
    function drifted(){
      if(!MY.on||!applied) return false;
      return vals().slice().sort().join(",")!==applied.slice().sort().join(",");
    }
    function ui(){
      var on=MY.on, n=slots().length, d=drifted();
      tog.setAttribute("aria-pressed",on?"true":"false");
      /* the switch appears once there is a set to switch to; until then the
         fold marker sits on the heading as it does on every other group */
      tog.hidden=!MY.cols.length;
      tog.closest(".grp").classList.toggle("mine",MY.cols.length>0);
      /* the buttons above say what they now do: off, New colors and Rotate
         with Save beside them; on, Shuffle, Save and Edit, Save dimmed until
         a swatch has been changed by hand */
      if(shufB){
        if(!shufB.__label) shufB.__label=shufB.textContent;
        shufB.textContent=on?"Shuffle":shufB.__label;
        shufB.hidden=on&&n<3&&MY.cols.length<=n;
      }
      if(rotB){
        if(rotB.__hid===undefined) rotB.__hid=rotB.hidden;
        rotB.hidden=on ? (n>=3||n<2) : rotB.__hid;
      }
      saveB.disabled=on&&!d;
      editB.hidden=!on;
      if(!on){ panel.hidden=true; editB.setAttribute("aria-pressed","false"); }
      var row=shufB?shufB.parentElement:home;
      if(row&&saveB.parentElement!==row){ row.appendChild(saveB); row.appendChild(editB); }
      hint.textContent="";
      myc.hidden=panel.hidden&&row!==home;
    }
    function putOn(){
      if(!MY.cols.length) MY.cols=vals().filter(Boolean);
      if(!MY.cols.length) return;
      if(!MY.on) own=vals();
      MY.on=true; store();
      var f=fit(MY.cols,slots().length);
      apply(f.list,f.derived);
    }
    function putOff(){
      MY.on=false; store();
      derivedSet={}; applied=null; mark();
      if(own){ var o=own; own=null; apply(o); }
      applied=null; ui();
    }
    function save(){
      var cur=vals().filter(function(v){ return !derivedSet[v]; });
      if(!cur.length) return;
      MY.cols=parseList(cur.join(" "));
      if(!MY.on) own=vals();
      MY.on=true; store();
      var f=fit(MY.cols,slots().length);
      apply(f.list,f.derived);
      if(!panel.hidden) ta.value=MY.cols.join("\n");
    }

    /* the switch lives on the heading; it must not fold the block */
    tog.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); if(MY.on) putOff(); else putOn(); });
    saveB.addEventListener("click",save);
    editB.addEventListener("click",function(){
      panel.hidden=!panel.hidden;
      editB.setAttribute("aria-pressed",panel.hidden?"false":"true");
      if(!panel.hidden){ ta.value=MY.cols.join("\n"); ta.focus(); }
      ui();
    });
    okB.addEventListener("click",function(){
      var list=parseList(ta.value);
      if(!list.length){ ui(); hint.textContent="No colours found. Paste hex codes like #FF5C39."; return; }
      MY.cols=list; store();
      if(MY.on){ var f=fit(MY.cols,slots().length); apply(f.list,f.derived); }
      else putOn();
      ta.value=MY.cols.join("\n"); ui();
    });
    copyB.addEventListener("click",function(){
      var text=MY.cols.join(", ");
      var done=function(){ copyB.textContent="Copied"; setTimeout(function(){ copyB.textContent="Copy"; },1200); };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done,done);
      else { ta.select(); try{ document.execCommand("copy"); }catch(e){} done(); }
    });
    var armed=0;
    rmB.addEventListener("click",function(){
      if(!armed){ armed=setTimeout(function(){ armed=0; rmB.textContent="Forget"; },2500); rmB.textContent="Sure?"; return; }
      clearTimeout(armed); armed=0; rmB.textContent="Forget";
      var wasOn=MY.on; MY.cols=[];
      if(wasOn) putOff(); else store();
      panel.hidden=true; editB.setAttribute("aria-pressed","false"); ui();
    });

    /* Shuffle: with the switch on, New colors deals the set again, a new
       order across the tool's roles, and a different pick when the set
       holds more than the tool needs */
    document.addEventListener("click",function(e){
      if(!MY.on) return;
      var b=e.target.closest&&e.target.closest("#shufColors");
      if(!b) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      var order=shuffled(MY.cols), tries=0;
      while(MY.cols.length>1&&order.join()===MY.cols.join()&&tries<8){ order=shuffled(MY.cols); tries++; }
      MY.cols=order; store();
      var f=fit(MY.cols,slots().length);
      apply(f.list,f.derived);
    },true);

    /* a tool whose variation number deals its own palette would deal the
       set away on every New variation; put it back once the deal has landed */
    function reassert(){
      if(!MY.on||!applied) return;
      setTimeout(function(){
        if(!MY.on||!applied||!drifted()) return;
        apply(applied,Object.keys(derivedSet));
      },40);
    }
    ["randomize","shuf"].forEach(function(id){
      var b=document.getElementById(id); if(b) b.addEventListener("click",reassert);
    });
    var seedIn=document.getElementById("seed");
    if(seedIn) seedIn.addEventListener("change",reassert);
    document.addEventListener("keydown",function(e){ if(e.code==="Space"||e.key===" ") reassert(); });

    /* ---- drag a swatch into a new place ----
       With the set on, the order is the thing you are choosing: which colour
       is the ground, which the accent. Dragging moves that swatch's colour
       to the new slot and shifts the others along, through the inputs, so
       the tool redraws as it would for any edit; the set keeps the order. */
    if(swHost){
      var drag=null, justDragged=false;
      /* registered before the colour picker's own click handler, so a drag
         that ends on a swatch does not open the picker */
      document.addEventListener("click",function(ev){
        if(!justDragged) return;
        ev.stopPropagation(); ev.stopImmediatePropagation(); ev.preventDefault(); justDragged=false;
      },true);
      var swAt=function(){ return [].slice.call(swHost.querySelectorAll(".sw")).filter(function(h){ return h.querySelector('input[type=color]'); }); };
      swHost.addEventListener("pointerdown",function(e){
        if(!MY.on||e.button!==0) return;
        var h=e.target.closest(".sw"); if(!h||!swHost.contains(h)||e.target.closest(".x")) return;
        var hosts=swAt(), i=hosts.indexOf(h); if(i<0) return;
        drag={h:h,i:i,x:e.clientX,y:e.clientY,moved:false,to:i,hosts:hosts,
              rects:hosts.map(function(x){ return x.getBoundingClientRect(); })};
      });
      var move=function(e){
        if(!drag) return;
        var dx=e.clientX-drag.x, dy=e.clientY-drag.y;
        if(!drag.moved){ if(Math.abs(dx)<4&&Math.abs(dy)<4) return; drag.moved=true; drag.h.classList.add("drag"); try{ drag.h.setPointerCapture&&e.pointerId!==undefined&&drag.h.setPointerCapture(e.pointerId); }catch(x){} }
        e.preventDefault();
        drag.h.style.transform="translate("+dx+"px,"+dy+"px) scale(1.2)";
        /* the slot under the pointer */
        var to=drag.i, best=1e9;
        drag.rects.forEach(function(r,k){ var cx=r.left+r.width/2, cy=r.top+r.height/2; var d=(e.clientX-cx)*(e.clientX-cx)+(e.clientY-cy)*(e.clientY-cy); if(d<best){ best=d; to=k; } });
        drag.to=to;
        drag.hosts.forEach(function(x,k){
          if(x===drag.h) return;
          var sh=0;
          if(drag.i<to&&k>drag.i&&k<=to) sh=-1; else if(to<drag.i&&k>=to&&k<drag.i) sh=1;
          if(!sh){ x.style.transform=""; return; }
          var r=drag.rects[k], n=drag.rects[k+sh];
          x.style.transform="translate("+(n.left-r.left)+"px,"+(n.top-r.top)+"px)";
        });
      };
      var end=function(e){
        if(!drag) return;
        var d=drag; drag=null;
        d.hosts.forEach(function(x){ x.style.transform=""; });
        d.h.classList.remove("drag");
        if(!d.moved) return;
        /* a drag is not a click on the swatch */
        justDragged=true; setTimeout(function(){ justDragged=false; },0);
        if(d.to===d.i) return;
        var list=vals(); var v=list.splice(d.i,1)[0]; list.splice(d.to,0,v);
        var real=list.filter(function(c){ return !derivedSet[c]; });
        MY.cols=parseList(real.concat(MY.cols).join(" ")); store();
        /* the row is laid out as you left it; the set keeps the order */
        apply(list,Object.keys(derivedSet));
      };
      document.addEventListener("pointermove",move);
      document.addEventListener("pointerup",end);
      document.addEventListener("pointercancel",end);
    }

    /* a swatch edited by hand offers Save changes; a rebuilt row keeps its rings */
    document.addEventListener("input",function(e){
      if(applying) return;
      if(e.target&&e.target.type==="color"){ mark(); ui(); }
    });
    if(window.MutationObserver&&swHost)
      new MutationObserver(function(){ if(!applying){ mark(); ui(); } }).observe(swHost,{childList:true,subtree:true});
    /* a set saved in another tab shows here at once */
    window.addEventListener("storage",function(e){
      if(e.key!==KEY) return;
      load(); ui();
      if(MY.on){ var f=fit(MY.cols,slots().length); apply(f.list,f.derived); }
    });

    load();
    if(MY.on){ own=vals(); var f=fit(MY.cols,slots().length); apply(f.list,f.derived); }
    mark(); ui();
  })();

  if(window.MutationObserver){
    var dob=new MutationObserver(syncDisabled);
    document.querySelectorAll(".pr input[type=range]").forEach(function(el){
      dob.observe(el,{attributes:true,attributeFilter:["disabled"]});
    });
  }

  /* ---- corner readouts ------------------------------------------------- */
  var ratioEcho=$("#ratioEcho"), ratioVal=$("#ratioVal"),
      sizeEcho=$("#sizeEcho"), sizeVal=$("#sizeVal"),
      inkEcho=$("#inkEcho"), swatches=$("#swatches");
  function put(el,v){ if(el && el.textContent!==v) el.textContent=v; }
  /* Not every tool has a single Size to mirror: some spell it as several
     sizes of different things, some have none at all. Rather than leave the
     placeholder em-dash sitting in the corner readout for good, take the row
     out. */
  if(!sizeVal && sizeEcho){
    var sizeKey=sizeEcho.previousElementSibling;
    if(sizeKey) sizeKey.style.display="none";
    sizeEcho.style.display="none";
  }
  /* the hidden mirror ships with a placeholder and is only rewritten on click,
     so seed it from whichever ratio tile starts pressed */
  if(ratioVal){
    var act=document.querySelector('#ratios .ratio[aria-pressed="true"] .t');
    if(act && act.textContent.trim()) ratioVal.textContent=act.textContent.trim();
  }
  function echo(){
    if(ratioVal) put(ratioEcho, ratioVal.textContent||"1:1");
    if(sizeVal) put(sizeEcho, sizeVal.textContent||"");
    if(swatches){
      var n=swatches.querySelectorAll(".sw").length;
      put(inkEcho, (n<10?"0":"")+n);
    }
  }
  echo();
  /* watch only the sources — never the targets, or echo() would feed itself */
  if(window.MutationObserver){
    var mo=new MutationObserver(echo);
    [ratioVal,sizeVal,swatches].forEach(function(n){
      if(n) mo.observe(n,{childList:true,subtree:true,characterData:true});
    });
  }
  var clock=$("#clock");
  if(clock){
    var d=new Date();
    var p=function(n){return (n<10?"0":"")+n;};
    clock.textContent=p(d.getDate())+"."+p(d.getMonth()+1)+"."+d.getFullYear()+
      " \u00b7 "+p(d.getHours())+":"+p(d.getMinutes());
  }

  /* ---- captures -------------------------------------------------------- */
  var art=$("#art"), seedIn=$("#seed"), strip=$("#history");
  var hist=[], at=-1, SLOTS=8, CAP=60;

  function snap(){
    if(!art||!art.width) return "";
    var c=document.createElement("canvas");
    c.width=c.height=64;
    var x=c.getContext("2d");
    var s=Math.min(art.width,art.height);
    x.drawImage(art,(art.width-s)/2,(art.height-s)/2,s,s,0,0,64,64);
    try{ return c.toDataURL("image/png"); }catch(e){ return ""; }
  }
  function record(){
    var seed=seedIn?seedIn.value:"";
    var shot=snap();
    if(at>=0 && hist[at] && hist[at].seed===seed){ hist[at].img=shot; }
    else{
      hist=hist.slice(0,at+1);
      hist.push({seed:seed,img:shot});
      if(hist.length>CAP) hist.shift();
      at=hist.length-1;
    }
    drawStrip();
  }
  function go(i){
    if(i<0||i>=hist.length) return;
    at=i;
    if(seedIn){
      seedIn.value=hist[i].seed;
      seedIn.dispatchEvent(new Event("change",{bubbles:true}));
    }
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      if(hist[at]) hist[at].img=snap();
      drawStrip();
    });});
  }
  function drawStrip(){
    if(!strip) return;
    var end=Math.max(SLOTS-1,at), start=end-SLOTS+1;
    var out='<button class="capnav" id="hBack" aria-label="Previous variation">&lsaquo;</button>';
    for(var k=0;k<SLOTS;k++){
      var i=start+k, h=hist[i];
      out += h
        ? '<button class="cap" data-i="'+i+'" aria-current="'+(i===at)+'" '+
          'title="Variation '+h.seed+'" aria-label="Variation '+h.seed+'"></button>'
        : '<span class="cap slot" aria-hidden="true"></span>';
    }
    out += '<button class="capnav" id="hFwd" aria-label="Next variation">&rsaquo;</button>';
    strip.innerHTML=out;
    var b=$("#hBack"), f=$("#hFwd");
    if(b){ b.disabled = at<=0; b.onclick=function(){go(at-1);}; }
    if(f){ f.disabled = at>=hist.length-1; f.onclick=function(){go(at+1);}; }
    strip.querySelectorAll(".cap[data-i]").forEach(function(t){
      t.onclick=function(){go(+t.dataset.i);};
    });
  }

  var shuf=$("#shuf"), rnd=$("#randomize");
  if(rnd){
    rnd.addEventListener("click",function(){
      if(shuf) shuf.click();
      requestAnimationFrame(function(){requestAnimationFrame(record);});
    });
  }
  ["keydown","click"].forEach(function(ev){
    document.addEventListener(ev,function(e){
      if(ev==="keydown" && e.code!=="Space") return;
      if(ev==="keydown" && e.target.matches("input,textarea")) return;
      if(ev==="click" && e.target!==art) return;
      requestAnimationFrame(function(){requestAnimationFrame(record);});
    });
  });
  if(seedIn) seedIn.addEventListener("change",function(){
    requestAnimationFrame(function(){requestAnimationFrame(record);});
  });

  /* ---- copy ------------------------------------------------------------ */
  var copy=$("#copySeed");
  function confirmCopy(v){
    if(window.__toast) window.__toast("Variation "+v+" copied");
    if(!copy) return;
    copy.classList.add("done");
    copy.textContent="Copied";
    clearTimeout(copy.__t);
    copy.__t=setTimeout(function(){copy.classList.remove("done");copy.textContent="Copy";},1500);
  }
  function legacy(v){
    try{
      var t=document.createElement("textarea");
      t.value=v; t.style.cssText="position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(t); t.select();
      var ok=document.execCommand("copy");
      t.remove();
      ok ? confirmCopy(v) : window.__toast && window.__toast("Press Ctrl+C to copy "+v);
    }catch(e){ if(window.__toast) window.__toast("Press Ctrl+C to copy "+v); }
  }
  if(copy) copy.addEventListener("click",function(){
    var v=String(seedIn.value);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(v).then(function(){confirmCopy(v);},function(){legacy(v);});
    } else legacy(v);
  });

  /* ---- add-colour popover --------------------------------------------- */
  var pop=null;
  function closePop(){ if(pop){ pop.remove(); pop=null; } }
  /* opts.start  — open on an existing colour instead of a fresh hue
     opts.label  — the confirm button's word
     opts.live   — apply every change as it is made, so the artwork previews */
  function hsv2hexC(h,sa,v){
    h=((h%360)+360)%360;
    var c=v*sa, x=c*(1-Math.abs((h/60)%2-1)), m=v-c, r=0,g=0,b=0;
    if(h<60){r=c;g=x;} else if(h<120){r=x;g=c;} else if(h<180){g=c;b=x;}
    else if(h<240){g=x;b=c;} else if(h<300){r=x;b=c;} else {r=c;b=x;}
    function p(n){return Math.round((n+m)*255).toString(16).padStart(2,"0");}
    return "#"+p(r)+p(g)+p(b);
  }
  function hex2hsvC(hex){
    var v=String(hex).replace("#","");
    if(v.length===3) v=v.replace(/./g,function(c){return c+c;});
    var n=parseInt(v,16);
    var r=((n>>16)&255)/255, g=((n>>8)&255)/255, b=(n&255)/255;
    var mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn, h=0;
    if(d){
      if(mx===r) h=((g-b)/d+(g<b?6:0));
      else if(mx===g) h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h*=60;
    }
    return [h, mx?d/mx:0, mx];
  }
  /* opts.start  — open on an existing colour instead of a fresh hue
     opts.label  — the confirm button's word
     opts.live   — apply every change as it is made, so the artwork previews */
  window.__pickColour=function(anchor,commit,opts){
    closePop();
    opts=opts||{};
    var hex=opts.start||freshHue();
    var hsv=hex2hsvC(hex);
    pop=document.createElement("div");
    pop.className="cpick";
    pop.innerHTML=
      '<div class="sv"><div class="lay" data-hue></div>'+
        '<div class="lay" style="background:linear-gradient(to right,#fff,rgba(255,255,255,0))"></div>'+
        '<div class="lay" style="background:linear-gradient(to top,#000,rgba(0,0,0,0))"></div>'+
        '<span class="dot"></span></div>'+
      '<div class="hue"><span class="hnd"></span></div>'+
      '<div class="cprow"><span class="cpsw"></span>'+
        '<input class="cphex" spellcheck="false" autocomplete="off" aria-label="Hex value">'+
        '<button class="cpok" type="button">'+(opts.label||"Add")+'</button></div>';
    document.body.appendChild(pop);
    var r=anchor.getBoundingClientRect();
    var w=pop.offsetWidth||198, h=pop.offsetHeight||210;
    var x=Math.min(Math.max(8,r.left-6),innerWidth-w-8);
    var y=r.bottom+8; if(y+h>innerHeight-8) y=Math.max(8,r.top-h-8);
    pop.style.left=x+"px"; pop.style.top=y+"px";

    var sv=pop.querySelector(".sv"), hueBar=pop.querySelector(".hue");
    var hueLay=pop.querySelector("[data-hue]"), dot=pop.querySelector(".dot");
    var hnd=pop.querySelector(".hnd"), sw=pop.querySelector(".cpsw");
    var field=pop.querySelector(".cphex");

    function norm(v){
      v=String(v).trim().replace(/^#/,"");
      if(/^[0-9a-f]{3}$/i.test(v)) v=v.replace(/./g,function(c){return c+c;});
      return /^[0-9a-f]{6}$/i.test(v) ? "#"+v.toLowerCase() : null;
    }
    /* live edits arrive as fast as the pointer can drag; one apply per frame is
       plenty and keeps the heavier tools from stuttering under the cursor */
    var queued=null, ticking=false;
    function flush(){ ticking=false; if(queued!==null){ var v=queued; queued=null; commit(v); } }
    function push(v){
      hex=v;
      if(!opts.live) return;
      queued=v;
      if(!ticking){ ticking=true; requestAnimationFrame(flush); }
    }
    /* one place paints the whole box, so the field, the swatch, the dot and
       the hue handle can never disagree about what colour is selected */
    function render(typing){
      var v=hsv2hexC(hsv[0],hsv[1],hsv[2]);
      hueLay.style.background=hsv2hexC(hsv[0],1,1);
      dot.style.left=(hsv[1]*100)+"%";
      dot.style.top=((1-hsv[2])*100)+"%";
      hnd.style.left=(hsv[0]/360*100)+"%";
      sw.style.background=v;
      if(!typing){ field.value=v; field.classList.remove("bad"); }
      push(v);
    }
    function drag(el,move){
      el.addEventListener("pointerdown",function(e){
        el.setPointerCapture(e.pointerId);
        var go=function(ev){
          var b=el.getBoundingClientRect();
          move(Math.min(1,Math.max(0,(ev.clientX-b.left)/b.width)),
               Math.min(1,Math.max(0,(ev.clientY-b.top)/b.height)));
          render();
        };
        go(e);
        var up=function(){ el.removeEventListener("pointermove",go);
          el.removeEventListener("pointerup",up); el.removeEventListener("pointercancel",up); };
        el.addEventListener("pointermove",go);
        el.addEventListener("pointerup",up);
        el.addEventListener("pointercancel",up);
        e.preventDefault();
      });
    }
    drag(sv,function(px,py){ hsv[1]=px; hsv[2]=1-py; });
    drag(hueBar,function(px){ hsv[0]=px*360; });

    field.addEventListener("input",function(){
      var v=norm(field.value);
      field.classList.toggle("bad",!v);
      if(v){ hsv=hex2hsvC(v); render(true); }
    });
    function done(){
      var v=norm(field.value);
      if(!v){field.classList.add("bad");field.focus();return;}
      closePop();
      /* a live picker has already applied every step; committing again here
         would only queue a redundant redraw */
      if(opts.live){ if(queued!==null||v!==hex) commit(v); }
      else commit(v);
    }
    pop.querySelector(".cpok").addEventListener("click",done);
    field.addEventListener("keydown",function(e){
      if(e.key==="Enter"){ e.preventDefault(); done(); }
      if(e.key==="Escape"){ closePop(); }
    });
    render();
    setTimeout(function(){ field.focus(); field.select(); },0);
  };
  /* ---- editing an ink --------------------------------------------------
     Every colour circle now means "edit me": clicking one opens the same
     wheel-and-hex popover the + button uses, starting on that colour and
     applying as you go. Deleting moved to the badge in the corner, so the
     circle is no longer a delete button wearing a colour.

     The popover writes through the tool's own <input type=color> and fires
     its input event, so each tool's existing handler does the actual work —
     no per-tool code, and nothing here can drift from it. Only inputs found
     at load are claimed, and only a claimed one has its native dialog
     suppressed: anything unrecognised keeps working exactly as it did. */
  function inkHost(input){
    var sw=input.closest(".sw");
    if(sw) return sw;
    var lab=input.closest("label");
    if(lab) return lab;
    return input.parentElement;
  }
  function claimInks(){
    var col=document.querySelector(".z-left")||document.body;
    col.querySelectorAll('input[type=color]').forEach(function(input){
      if(input.closest(".cpick")) return;
      var host=inkHost(input);
      if(!host||host.hasAttribute("data-ink")) return;
      host.setAttribute("data-ink","");
    });
  }
  claimInks();
  /* the swatch row is rebuilt whenever colours are added or removed */
  var swHostAll=document.getElementById("swatches");
  if(window.MutationObserver&&swHostAll)
    new MutationObserver(claimInks).observe(swHostAll,{childList:true,subtree:true});

  document.addEventListener("click",function(e){
    /* the corner badge is the tool's own delete; let it through untouched */
    if(e.target.closest(".x")) return;
    var host=e.target.closest("[data-ink]");
    if(!host||e.target.closest(".cpick")) return;
    var input=host.querySelector('input[type=color]');
    if(!input) return;
    e.preventDefault(); e.stopPropagation();
    window.__pickColour(host,function(v){
      if(input.value===v) return;
      input.value=v;
      input.dispatchEvent(new Event("input",{bubbles:true}));
    },{start:input.value,label:"Done",live:true});
  },true);

  /* ---- fresh palettes --------------------------------------------------
     Several tools dealt New colors from a fixed list of five or six sets, so
     clicking repeatedly cycled the same handful of looks. This recolours a
     set instead: every hue is dealt afresh, while each slot keeps its
     lightness and saturation. That value structure is the tool's own design
     — which ink is the board, which is the page, which is the accent — and
     randomising it too would break the artwork rather than recolour it. */
  function rgb2hslA(hex){
    var h=String(hex).replace("#","");
    if(h.length===3) h=h.split("").map(function(c){return c+c;}).join("");
    var n=parseInt(h,16)||0;
    var r=((n>>16)&255)/255, g=((n>>8)&255)/255, b=(n&255)/255;
    var mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
    var l=(mx+mn)/2, sa=0, hu=0;
    if(d){
      sa=l>0.5 ? d/(2-mx-mn) : d/(mx+mn);
      if(mx===r) hu=((g-b)/d+(g<b?6:0));
      else if(mx===g) hu=(b-r)/d+2;
      else hu=(r-g)/d+4;
      hu*=60;
    }
    return [hu,sa,l];
  }
  function hsl2hexA(h,s,l){
    h=((h%360)+360)%360; s=Math.min(1,Math.max(0,s)); l=Math.min(1,Math.max(0,l));
    var a=s*Math.min(l,1-l);
    function f(n){
      var k=(n+h/30)%12;
      var v=l-a*Math.max(-1,Math.min(k-3,9-k,1));
      return Math.round(v*255).toString(16).padStart(2,"0");
    }
    return "#"+f(0)+f(8)+f(4);
  }
  window.__freshPalette=function(base){
    if(!base||!base.length) return base;
    var h0=Math.random()*360;
    /* a scheme rather than free hues: unrelated hues look like a mistake */
    var schemes=[[0,24,48,72,96,120,144,168],
                 [0,180,25,205,50,230,75,255],
                 [0,120,240,40,160,280,80,200],
                 [0,16,32,186,202,218,48,170]];
    var sch=schemes[(Math.random()*schemes.length)|0];
    var flip=Math.random()<0.5?1:-1;
    return base.map(function(hex,i){
      var c=rgb2hslA(hex);
      var h=h0+flip*sch[i%sch.length]+(Math.random()-0.5)*20;
      var sa=c[1], l=c[2];
      /* a near-grey stays near-grey — that slot is usually the board or the
         page, and colouring it would change the tool's structure */
      if(sa>0.08) sa=Math.min(1,Math.max(0.12,sa*(0.8+Math.random()*0.55)));
      l=Math.min(0.97,Math.max(0.03,l*(0.9+Math.random()*0.22)));
      return hsl2hexA(h,sa,l);
    });
  };

  function freshHue(){
    var h=Math.floor(Math.random()*360), s=62, l=56, a=s/100*Math.min(l/100,1-l/100);
    function f(n){ var k=(n+h/30)%12, c=l/100-a*Math.max(-1,Math.min(k-3,9-k,1));
      return Math.round(c*255).toString(16).padStart(2,"0"); }
    return "#"+f(0)+f(8)+f(4);
  }
  document.addEventListener("mousedown",function(e){
    if(pop && !pop.contains(e.target) && !e.target.closest(".sw-add,[data-ink]")) closePop();
  },true);

  /* ---- disclosures ----------------------------------------------------- */
  var exp=$("#exportTog"), expBody=$("#exportBody");
  function place(body,btn){
    if(!body||!btn||body.hidden) return;
    body.classList.add("pop");
    var w=body.offsetWidth||232, h=body.offsetHeight||160;
    var r=btn.getBoundingClientRect();
    var x=r.right-w, y=r.bottom+10;
    if(y+h>innerHeight-16) y=r.top-h-10;
    y=Math.max(16,Math.min(y,innerHeight-h-16));
    x=Math.max(16,Math.min(x,innerWidth-w-16));
    body.style.left=Math.round(x)+"px";
    body.style.top=Math.round(y)+"px";
  }
  function closeExport(){
    if(!expBody||expBody.hidden) return;
    expBody.hidden=true;
    expBody.classList.remove("pop");
    exp.setAttribute("aria-pressed","false");
    exp.classList.remove("on");
  }
  if(exp) exp.addEventListener("click",function(){
    var open=expBody.hidden;
    if(!open){ closeExport(); return; }
    expBody.hidden=false;
    exp.setAttribute("aria-pressed","true");
    exp.classList.add("on");
    place(expBody,exp);
  });
  document.addEventListener("mousedown",function(e){
    if(expBody && !expBody.hidden && !expBody.contains(e.target) && e.target!==exp
       && !e.target.closest("#exportTog")) closeExport();
  },true);
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeExport(); });

  /* the hint belongs with the greyed-out buttons, so it comes and goes with
     them rather than sitting there once Animate is on */
  (function(){
    var vid=$("#expVid"), tip=$(".vidhint");
    if(!vid||!tip) return;
    var sync=function(){ tip.hidden=!vid.disabled; };
    new MutationObserver(sync).observe(vid,{attributes:true,attributeFilter:["disabled"]});
    sync();
  })();

  var mot=$("#motionTog");
  if(mot) mot.addEventListener("click",function(){
    var on=mot.getAttribute("aria-pressed")==="true";
    mot.classList.toggle("on",on);
  });
  addEventListener("resize",function(){ place(expBody,exp); });

  /* ---- a fresh variation every visit ------------------------------------
     The page opens on a different deal each time, with different colours,
     the way pressing New and New colors would, unless the address pins one
     with ?seed=N (or #seed=N, for hosts that drop query strings). Embedded
     copies already do this themselves. */
  (function(){
    var q=new URLSearchParams(location.search);
    var embedded=q.has("embed")||location.hash.indexOf("embed")>-1;
    try{ embedded=embedded||false; }catch(e){ embedded=true; }
    if(embedded) return;
    var m=/(?:^|[?#&])seed=(\d+)/.exec(location.search+location.hash);
    var pin=q.get("seed")||(m&&m[1]);
    if(pin){
      if(seedIn){ seedIn.value=pin; seedIn.dispatchEvent(new Event("change",{bubbles:true})); }
      return;
    }
    var sh=$("#shuf"); if(sh) sh.click();
    /* and fresh colours with it, unless My colors is switched on */
    var mine=false;
    try{ var j=JSON.parse(localStorage.getItem("ptrn.mycolors")||"null"); mine=!!(j&&j.on&&j.cols instanceof Array&&j.cols.length); }catch(e){}
    var sc=$("#shufColors"); if(sc&&!mine) sc.click();
  })();

  /* ---- first run: point out the New button ------------------------------
     Shown once per person, not once per tool, and it goes the moment they do
     the thing it is asking for. */
  (function(){
    var KEY="ptrn.seen.new";
    var btn=$("#randomize");
    if(!btn) return;
    try{ if(localStorage.getItem(KEY)) return; }catch(e){ return; }
    var tip=document.createElement("div");
    tip.className="firstrun";
    tip.setAttribute("role","status");
    /* no point telling a phone about the space bar, and the line has to be
       short enough not to run the width of one */
    var touch=matchMedia("(pointer:coarse)").matches;
    tip.textContent=touch ? "Tap New for a different one"
                          : "Press New for a different one · or hit space";
    document.body.appendChild(tip);
    function place(){
      var r=btn.getBoundingClientRect();
      tip.style.left=Math.round(r.left+r.width/2-tip.offsetWidth/2)+"px";
      tip.style.top=Math.round(r.bottom+12)+"px";
      /* a narrow phone would push it off the side */
      var t=tip.getBoundingClientRect();
      if(t.left<10) tip.style.left="10px";
      if(t.right>innerWidth-10) tip.style.left=Math.round(innerWidth-10-t.width)+"px";
      /* clamped against an edge it is no longer centred under the button, so
         the arrow has to be moved to keep pointing at it */
      var f=tip.getBoundingClientRect();
      tip.style.setProperty("--ax",
        Math.max(10,Math.min(f.width-10,(r.left+r.width/2)-f.left))+"px");
    }
    var done=false;
    function dismiss(){
      if(done) return;
      done=true;
      try{ localStorage.setItem(KEY,"1"); }catch(e){}
      tip.classList.remove("on");
      btn.classList.remove("nudge");
      setTimeout(function(){ if(tip.parentNode) tip.parentNode.removeChild(tip); },400);
      removeEventListener("resize",place);
    }
    /* the moment they use it, or the moment they get on with something else */
    btn.addEventListener("click",dismiss);
    addEventListener("keydown",function(e){
      if(e.code==="Space"||e.key==="Escape") dismiss();
    });
    document.addEventListener("pointerdown",function(e){
      if(e.target!==btn) dismiss();
    },true);
    addEventListener("resize",place);
    setTimeout(function(){
      if(done) return;
      place(); tip.classList.add("on"); btn.classList.add("nudge");
      place();
    },1400);
    setTimeout(dismiss,14000);
  })();


  requestAnimationFrame(function(){requestAnimationFrame(record);});
})();

/*
 * 32:9 monitor frame: export-size readout (local addition).
 *
 * The 32:9 frame always exports at 5120 x 1440, whatever the Size slider says
 * (the export handlers themselves are patched by _scripts/add_monitor_frame.py).
 * This file keeps the interface honest about that: while 32:9 is the pressed
 * frame tile it shows "5120 px" in the export size label (which the right-rail
 * "Size" readout mirrors) and locks the export size slider; picking any other
 * frame puts the label back exactly as it was and re-enables the slider.
 *
 * Some tools keep a separate design "Size" control and use #sizePx / #sizePxVal
 * for the export size; those are handled too, and the design Size is untouched.
 * It never dispatches input or change events.
 */
(function () {
  "use strict";

  var FRAME = "32:9", TEXT = "5120 px";
  var saved = null;

  function exportPair() {
    var s = document.getElementById("sizePx"), l = document.getElementById("sizePxVal");
    if (s && l) return [s, l];
    s = document.getElementById("size"); l = document.getElementById("sizeVal");
    if (s && l) return [s, l];
    return null;
  }

  function monitorOn() {
    var t = document.querySelector('#ratios .ratio[aria-pressed="true"] .t');
    return !!t && t.textContent.trim() === FRAME;
  }

  function apply() {
    try {
      var p = exportPair();
      if (!p) return;
      var s = p[0], l = p[1];
      if (monitorOn()) {
        if (saved === null) { saved = l.textContent; s.disabled = true; }
        if (l.textContent !== TEXT) l.textContent = TEXT;
      } else if (saved !== null) {
        s.disabled = false;
        l.textContent = saved;
        saved = null;
      }
    } catch (e) { /* never break the page over a label */ }
  }

  function start() {
    var rack = document.getElementById("ratios");
    var p = exportPair();
    apply();
    if (!window.MutationObserver) return;
    if (rack) new MutationObserver(apply).observe(rack, { attributes: true, attributeFilter: ["aria-pressed"], childList: true, subtree: true });
    /* history restore / presets can rewrite the label while 32:9 is on */
    if (p) new MutationObserver(function () { if (saved !== null && p[1].textContent !== TEXT) apply(); })
      .observe(p[1], { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
