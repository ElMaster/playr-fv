(function(){var b=/iPhone|iPod|iPad/.test(window.navigator.userAgent);if(b){return}var i=document.getElementById("vrContainer");var t=document.querySelector(".player-html5");if(!t){return}var o=document.getElementById("vrVideoCanvas");var k=document.getElementById("vrVideoControls");var d=document.getElementById("vrButtonPlayPause");var n=document.getElementById("vrProgress");var r=document.getElementById("vrButtonFullScreen");var h=document.getElementById("vrButtonCardboard");var u,c;switch(varObj.vr.projection){case 1:u=VrPlayer.PROJECTION_EQUIDISTANT_180;break;case 2:u=VrPlayer.PROJECTION_EQUIRECTANGULAR_360;break;case 3:u=VrPlayer.PROJECTION_EQUIRECTANGULAR_180;break;default:throw"Invalid projection type"}if(!varObj.vr.stereoSrc){c=VrPlayer.MONO}else{switch(varObj.vr.stereoType){case 1:c=VrPlayer.STEREO_SIDE_BY_SIDE_LR;break;case 2:c=VrPlayer.STEREO_OVER_UNDER_LR;break;case 3:c=VrPlayer.STEREO_SIDE_BY_SIDE_RL;break;case 4:c=VrPlayer.STEREO_OVER_UNDER_RL;break;default:throw"Invalid stereo type"}}function p(){document.getElementById("vrFallback").style.display="block"}try{var f=new VrPlayer({canvas:o,video:t,fullscreenElement:i,projection:u,stereoType:c,stereoView:false});t.addEventListener("canplaythrough",function(){f.start()});t.addEventListener("durationchange",function(){n.max=t.duration});t.addEventListener("timeupdate",function(){n.value=t.currentTime});t.addEventListener("play",function(){t.style.display="none";i.style.display="block";d.className="playing";a()});t.addEventListener("pause",function(){d.className="";s()});t.addEventListener("ended",function(){f.exitFullscreen();f.stop();i.style.display=null});n.addEventListener("click",function(w){var v=w.offsetX/n.offsetWidth;t.currentTime=v*t.duration;a()});d.addEventListener("click",function(){if(t.paused){t.play()}else{t.pause()}});r.addEventListener("click",function(){if(f.isFullscreen()){f.exitFullscreen();h.className="";r.className=""}else{f.fullscreen();r.className="exit"}a()});h.addEventListener("click",function(){if(f.isStereoView()){f.setStereoView(false);h.className=""}else{f.launchStereoView();h.className="exit";r.className="exit"}a()});o.addEventListener("touchstart",m);window.addEventListener("resize",f.resize);var j=window.navigator.userAgent.match(/Android (\d+(?:\.\d+)+);/)[1];if(j&&j<"5.0"){console.log("Android version below 5.0");p()}}catch(q){console.log(q);p()}var l=3000;var g;function a(){window.clearTimeout(g);g=setTimeout(function(){k.className="hide"},l)}function s(){window.clearTimeout(g);k.className=""}function m(){s();if(!t.paused){a()}}})();