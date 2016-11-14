var MG_Utils={browser:{hasTouchSupport:("createTouch" in document),version:(navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[])[1],androidversion:function(){var a=navigator.userAgent.match(/\s*Android\s*([0-9]+)\.?([0-9]+)?\.?([0-9]+)?\s*/);return(a&&a[1]&&a[2])?parseFloat(a[1]+"."+a[2]):((a&&a[1])?parseFloat(a[1]):false)},isWebkit:(navigator.userAgent.indexOf("AppleWebKit/")>-1),isMobileSafari:/(ipad|iphone|ipod|android).*apple.*mobile.*safari/.test(navigator.userAgent.toLowerCase()),isAppleChrome:/crios/.test(navigator.userAgent.toLowerCase()),isAppleMobileDevice:/(ipad|iphone|ipod)/.test(navigator.userAgent.toLowerCase()),isAndroidMobileDevice:/android/.test(navigator.userAgent.toLowerCase()),isTansoDl:navigator.userAgent.toLowerCase().match(/TansoDL/i),isWindowsPhone:function(){return(navigator.userAgent.toLowerCase().match(/Windows CE|IEMobile|Windows Phone OS/i)||"XDomainRequest" in window)?true:false},highPixelDensityDisplay:(window.devicePixelRatio>=2),iPhone4:(window.devicePixelRatio>=2&&this.isMobileSafari),currentOrientation:null,isBlackBerry:function(){return(navigator.userAgent.match(/BlackBerry/i)?!!1:!!0)},isBB10:function(){return(navigator.userAgent.match(/BB10/i)?!!1:!!0)},iOSversion:function(){var a=window.navigator.userAgent,b=a.indexOf("OS ");if((a.indexOf("iPhone")>-1||a.indexOf("iPad")>-1)&&b>-1){return window.Number(a.substr(b+3,3).replace("_","."))}return 0}},storage:{hasLocalStorage:(function(){try{localStorage.enableStorage=1;localStorage.removeItem("enableStorage")}catch(a){return false}return true})(),defaultExpiry:1,saveWithExpiry:function(a,c,b){if(!this.hasLocalStorage){return undefined}if(c.expires&&!b){b=c.expires}if(!b){b=new Date();b.setDate(b.getDate()+this.defaultExpiry)}b=(b instanceof Date)?b.getTime():parseInt(b);this.saveItem(a,{val:c,expires:b})},getItem:function(a){if(!this.hasLocalStorage){return undefined}var b;try{b=JSON.parse(localStorage[a])}catch(c){return localStorage[a]}if(parseInt(b.expires)<new Date().getTime()){this.deleteItem(a);return null}return b.val||b},saveItem:function(a,b){if(!this.hasLocalStorage){return undefined}b=JSON.stringify(typeof b==="object"?b:{val:b});localStorage.setItem(a,b)},deleteItem:function(a){if(!this.hasLocalStorage){return undefined}localStorage.removeItem(a)},saveExpiry:function(d,b,a){if(typeof(Storage)=="undefined"){return false}var a=a,c={value:JSON.stringify(b),timestamp:new Date().getTime()+a};localStorage.setItem(d,JSON.stringify(c));return b},getExpiry:function(b){if(typeof(Storage)=="undefined"){return false}var a=JSON.parse(localStorage.getItem(b));if(!a){return false}return(new Date().getTime()<a.timestamp&&JSON.parse(a.value))}},bindEvent:function(c,a,b){if(c.addEventListener){c.addEventListener(a,b,false)}else{if(c.attachEvent){c.attachEvent("on"+a,b)}}},isLocalStorageEnabled:function(){if(typeof localStorage=="undefined"){return false}try{localStorage.removeItem("LsAccessSuccess");localStorage.setItem("LsAccessSuccess","localStorageEnabledOk");localStorage.removeItem("LsAccessSuccess")}catch(c){return false}if(MG_Utils.areCookiesEnabled()){if(document.cookie.indexOf("local_storage")==-1){var b=new Date();b.setTime(b.getTime()+(365*24*60*60*1000));var a=" expires = "+b.toGMTString()+";";var d=" path=/;";document.cookie="local_storage = 1;"+a+d}return true}return false},areCookiesEnabled:function(){var a=(navigator.cookieEnabled)?true:false;if(typeof(navigator.cookieEnabled)=="undefined"&&!a){document.cookie="testcookie";a=(document.cookie.indexOf("testcookie")!=-1)?true:false}return(a)},filterQuery:function(c,g,a){var b=[location.protocol,"//",location.host,location.pathname,"?"].join("");var e=b+a+c.reduce(function(h,k){var i="";var j=(a!=undefined&&a!=="");if(typeof k=="object"&&typeof k.evaluate=="function"){i=k.evaluate()}else{if(typeof g=="function"){i=g(k)}else{i=k}}if(typeof i=="string"&&i!==""){if(i.search(/(.*=.*)/)==-1){throw new Error("Improperly formatted query ("+i+"). Should be a string of format field=value")}return h+(j||h!==""?"&":"")+i}else{return h}},"");var f=e.lastIndexOf("?");var d=e.substring(f+1);window.location.href=(d&&d!="")?e:e.substring(0,f)},debounce:function(c,e,a){var d=null;var b=function(){d=null};return function(){a&&a.apply(this,arguments);var f=!d;if(f){c.apply(this,arguments);d=setTimeout(b,e)}}},toggleClass:function(e,d){if(e.classList){e.classList.toggle(d)}else{var c=e.className.split(" ");var a=-1;for(var b=c.length;b--;){if(c[b]===d){a=b}}if(a>=0){c.splice(a,1)}else{c.push(d)}e.className=c.join(" ")}},toggle:function(a){if(a.style.display==null||a.style.display=="none"){a.style.display="block"}else{a.style.display="none"}},closest:function(b,a){var c;["matches","webkitMatchesSelector","mozMatchesSelector","msMatchesSelector","oMatchesSelector"].some(function(d){if(typeof document.body[d]=="function"){c=d;return true}return false});while(b!==null){parent=b.parentElement;if(parent!==null&&parent[c](a)){return parent}b=parent}return null},triggerEvent:function(b,a){if(document.createEvent){var c=document.createEvent("HTMLEvents");c.initEvent(a,true,false);b.dispatchEvent(c)}else{b.fireEvent("on"+a)}},appendString:function(c,b){var a=document.createElement("div");a.innerHTML=b;while(a.firstChild){c.appendChild(a.firstChild)}},previousElementSibling:function(a){do{a=a.previousSibling}while(a&&a.nodeType!==1);return a},addClass:function(b,a){if(b.classList){b.classList.add(a)}else{b.className+=" "+a}},addClassMultiple:function(c,b){for(var a=0;a<c.length;a++){(function(d,e){if(!d.hasClass(c[e],b)){c[a].className?c[a].className+=" "+b:c[a].className+=b}}(this,a))}},removeClass:function(b,a){if(b.classList){b.classList.remove(a)}else{b.className=b.className.replace(new RegExp("(^|\\b)"+a.split(" ").join("|")+"(\\b|$)","gi")," ")}},removeMultipleClass:function(b,c){context=b.className;if(b.classList){for(var a=0;a<=c.length;a++){b.classList.remove(c[a])}}else{for(var a=0;a<=c.length;a++){context=context.replace(new RegExp("(^|\\b)"+context[a].split(" ").join("|")+"(\\b|$)","gi")," ")}}},removeClassMultiple:function(c,b){for(var a=0;a<c.length;a++){(function(d,e){var f=" "+c[a].className.replace(/[\t\r\n]/g," ")+" ";if(d.hasClass(c[a],b)){while(f.indexOf(" "+b+" ")>=0){f=f.replace(" "+b+" "," ")}c[a].className=f.replace(/^\s+|\s+$/g,"")}}(this,a))}},removeEventHandler:function(c,a,b){if(c.removeEventListener){c.removeEventListener(a,b,false)}else{if(c.detachEvent){c.detachEvent("on"+a,b)}else{c["on"+a]=null}}},addEventHandler:function(c,a,b){if(c.addEventListener){c.addEventListener(a,b,false)}else{if(c.attachEvent){c.attachEvent("on"+a,b)}else{c["on"+a]=b}}},ajaxGet:function(b){var e="",a;if(typeof b.data!=="undefined"){for(var c in b.data){if(e!=""){e+="&"}e+=c+"="+encodeURIComponent(b.data[c])}}a=b.url;e===""?a:a+"?"+e;var d=new XMLHttpRequest();d.open("GET",a,true);d.onreadystatechange=function(){if(this.readyState===4){if(this.status>=200&&this.status<400){if(b.success&&typeof b.success==="function"){b.success(this.responseText)}}else{console.error("Ajax error occured.")}}};d.send();d=null},setText:function(a,b){if(a.textContent!==undefined){a.textContent=b}else{a.innerText=b}},hasClass:function(b,a){return b.className&&new RegExp("(\\s|^)"+a+"(\\s|$)").test(b.className)},extendDefaults:function(e,c,f){var d=Object.prototype.hasOwnProperty;for(var g in c){if(d.call(c,g)){if(!(g==="constructor"&&e===window)){if(c[g]===undefined){delete e[g]}else{if(!(f&&typeof e[g]!=="undefined")){e[g]=c[g]}}}}}return e},domReady:function(c){var b=false;var g=function(){if(document.addEventListener){document.removeEventListener("DOMContentLoaded",a);window.removeEventListener("load",a)}else{document.detachEvent("onreadystatechange",a);window.detachEvent("onload",a)}};var a=function(){if(!b&&(document.addEventListener||event.type==="load"||document.readyState==="complete")){b=true;g();c()}};if(document.readyState==="complete"){c()}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",a);window.addEventListener("load",a)}else{document.attachEvent("onreadystatechange",a);window.attachEvent("onload",a);var f=false;try{f=window.frameElement==null&&document.documentElement}catch(d){}if(f&&f.doScroll){(function h(){if(b){return}try{f.doScroll("left")}catch(i){return setTimeout(h,50)}b=true;g();c()})()}}}}};if(!String.prototype.capitalize){String.prototype.capitalize=function(){return this.charAt(0).toUpperCase()+this.slice(1)}};