if(!Object.create){Object.create=function(b){if(arguments.length>1){throw new Error("Object.create implementation only accepts the first parameter.")}function a(){}a.prototype=b;return new a()}}var QualitySelector={qsItem:[],qsContainer:"",qsSegement:"",qsCampaign:"",init:function(b,a,c,d){this.qsItem=b;this.qsContainer=a;this.qsSegement=c||"straight";this.qsCampaign=d||null;this.createButtons(this.storeButtons(this.qsItem,this.qsSegement));return this},storeButtons:function(c,e){var b=[];for(var d=0;d<c.length;d++){var a=c[d].active?" default":"";button='<button id="'+c[d].id+'" class="streamQuality'+a+'" data-quality="'+c[d].url+'" type="button">'+c[d].text+"</button>";if(c[d].upgrade){button='<i class="premiumIcon"></i><button class="streamQuality" type="button" data-upgrade="1" data-entrycode="'+this.qsCampaign+'" data-segment="'+e+'" onclick="triggerGatewayModal(event);">'+c[d].text+"</button>"}b.push(button)}return b},createButtons:function(a){var b=a;this.buildDisplay(b)},buildDisplay:function(c){var b=document.getElementById(this.qsContainer),e=document.createDocumentFragment();if(b!==null){var f=0,d=c.length;for(f;f<d;f++){var a=document.createElement("li");a.innerHTML=c[f];e.appendChild(a)}b.appendChild(e);return b}}};