function getKeys(c) {
    var b = [], a;
    for (a in c) {
        if (c.hasOwnProperty(a)) {
            b.push(a)
        }
    }
    return b
}
function getUrlVars() {
    var b = {};
    var a = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (c, d, e) {
        b[d] = e
    });
    return b
}
function chargePbBlock() {
    var a = document.getElementById("pb_template");
    if (!a) {
        return
    }
    var b = document.querySelector(".mhp1138_container");
    b.appendChild(a)
}
function prettyTime(b) {
    var f = parseInt(b, 10);
    var a = Math.floor(f / 3600);
    var c = Math.floor((f - (a * 3600)) / 60);
    var e = f - (a * 3600) - (c * 60);
    if (a < 10) {
        a = "0" + a
    }
    if (c < 10) {
        c = "0" + c
    }
    if (e < 10) {
        e = "0" + e
    }
    var d = (parseInt(a) > 0 ? a + ":" : "") + c + ":" + e;
    return d
}
function togglePlayerSizeHD() {
    var b = document.getElementById("player");
    var c = document.querySelector(".playerFlvContainer");
    var a = document.getElementById("hd-rightColVideoPage");
    var d = [b, c, a];
    if (MG_Utils.hasClass(b, "original")) {
        MG_Utils.addClassMultiple(d, "wide");
        MG_Utils.removeClassMultiple(d, "original");
        ga("send", "event", "Watch Page", "click", "expand")
    } else {
        MG_Utils.addClassMultiple(d, "original");
        MG_Utils.removeClassMultiple(d, "wide")
    }
}
function mphLoadPlayer() {
    var c = 0, e = getKeys(playerObjList), b = e.length, a = getUrlVars()["t"], f, d, g = [];
    if (a == undefined) {
        a = 0
    }
    for (c; c < b; c++) {
        (function () {
            var r = playerObjList[e[c]].flashvars.embedId;
            var j = window["flashvars_" + r];
            if (typeof j !== "undefined" && typeof window["playerDiv_" + r] !== "undefined") {
                var p, s = (premiumFlag == true) ? "" : j.pauseroll_url, t = (premiumFlag == true) ? "" : j.postroll_url, u = (premiumFlag == true) ? "false" : "true", m = (premiumFlag == true), o = j.vcServerUrl || null;
                if (typeof isVr !== "undefined" && isVr) {
                    p = (window["flashvars_" + playerObjList[e[c]].flashvars.embedId].display_hd_upsell == true && !m) ? ["2160p"] : []
                } else {
                    p = (window["flashvars_" + playerObjList[e[c]].flashvars.embedId].display_hd_upsell == true) ? [1080] : []
                }
                if (typeof isShowPage !== "undefined") {
                    f = j.autoplay;
                    d = false
                } else {
                    f = false;
                    d = true
                }
                if (typeof j.preroll !== "undefined") {
                    for (var n = 0; n < j.preroll.campaigns.length; n++) {
                        var h = {}, q = j.preroll.campaigns[n];
                        h = {
                            campaignName: q.campaign_name,
                            clickUrl: q.click_url,
                            onNth: q.on_nth,
                            repeat: q.repeat,
                            skipDelay: q.skip_delay,
                            videoUrl: q.video_url,
                            trackUrl: q.track_url,
                            skipMessage: "",
                            skipDelayMessage: ""
                        };
                        g.push(h)
                    }
                }
                if (!window["playerDiv_" + r].getAttribute("data-processed")) {
                    window["playerDiv_" + r].setAttribute("data-processed", 1);
                    var i = false;

                    function l() {
                        return !!navigator.userAgent.match(" Safari/") && !navigator.userAgent.match(" Chrom") && !!navigator.userAgent.match(" Version/5.")
                    }

                    if (l()) {
                        document.getElementById("playerDiv_" + r).classList.add("unsupported-safari")
                    }
                    MHP1138.createPlayer("playerDiv_" + r, {
                        seekParams: {mp4: j.mp4_seek},
                        autoPlayVideo: {enabler: false},
                        autoplay: f,
                        startOffset: a,
                        medias: {
                            actionTags: j.actionTags,
                            defaultQuality: j.defaultQuality,
                            poster: j.image_url,
                            sources: {
                                180: j.quality_180p,
                                240: j.quality_240p,
                                480: j.quality_480p,
                                720: j.quality_720p,
                                1080: j.quality_1080p,
                                1440: (typeof isVr !== "undefined" && isVr) ? window["flashvars_" + playerObjList[e[c]].flashvars.embedId].quality_1440p : null,
                                "2160p": (typeof isVr !== "undefined" && isVr && m) ? window["flashvars_" + playerObjList[e[c]].flashvars.embedId].quality_2160p : null
                            },
                            thumbs: {
                                urlPattern: j.thumbs.urlPattern,
                                type: "normal",
                                samplingFrequency: j.thumbs.samplingFrequency,
                                thumbWidth: j.thumbs.thumbWidth,
                                thumbHeight: j.thumbs.thumbHeight
                            },
                            videoDuration: j.video_duration,
                            videoTitle: j.video_title,
                            videoUnavailable: false,
                            videoUnavailableMessage: "",
                            videoUrl: j.link_url,
                            qualityUpsell: p
                        },
                        menu: {relatedUrl: j.related_url},
                        features: {
                            embedCode: j.embedCode,
                            playerSizeToggle: window["playerDiv_" + r].getAttribute("data-enlarge") ? true : false,
                            ignorePreferences: d,
                            optionsEnabled: true,
                            showAutoplayOption: window["playerDiv_" + r].getAttribute("data-showautoplayoption") ? true : false,
                            hideControlsTimeout: 2
                        },
                        flashSettings: {
                            postRollUrl: t,
                            pauseRollUrl: s,
                            htmlPauseRoll: u,
                            htmlPostRoll: u,
                            extraFlashvars: {
                                oldFlash: {hidePostPauseRoll: m},
                                fourPlay: {
                                    tracking: [{
                                        reportType: "qosevents",
                                        rollType: "video",
                                        rollTiming: "main",
                                        cdn: j.cdn,
                                        startLagThreshold: j.startLagThreshold,
                                        outBufferLagThreshold: j.outBufferLagThreshold
                                    }]
                                }
                            }
                        },
                        events: {
                            collapsePlayer: function () {
                                togglePlayerSizeHD()
                            }, downloadsFlashMessage: function (k) {
                                document.getElementById("noPlayerMsg").removeAttribute("style")
                            }, expandPlayer: function () {
                                togglePlayerSizeHD()
                            }, hideRoll: function () {
                                if (typeof Pb_block !== "undefined") {
                                    Pb_block.closeAdBlock()
                                }
                            }, onSeek: function () {
                                if (typeof htTrack != "undefined") {
                                    htTrack.ptrack()
                                }
                            }, onShare: function (k, v, w) {
                                triggerShareClick();
                                MHP1138.exitFullscreen(k)
                            }, onReady: function (k, v, w) {
                                if (typeof initVrPlayer == "function") {
                                    initVrPlayer()
                                }
                                if (typeof isShowPage !== "undefined") {
                                    chargePbBlock()
                                }
                            }, onFullscreen: function (k) {
                                if (typeof isShowPage == "undefined") {
                                    triggerFullScreenDisplay(k)
                                }
                            }, onQualityUpsell: function (k, v, w) {
                                if (typeof isVr !== "undefined" && isVr && j.display_hd_upsell == true && !m) {
                                    triggerUpselllGatewayModal("Player2160pUpsell", phOrientationSegment)
                                } else {
                                    if (j.display_hd_upsell == true) {
                                        triggerUpselllGatewayModal("Player1080pUpsell", phOrientationSegment)
                                    }
                                }
                                MHP1138.exitFullscreen(k)
                            }, showPauseRoll: function (k, v, w) {
                                if (typeof Pb_block !== "undefined") {
                                    Pb_block.openAdBlock()
                                }
                            }, showPostRoll: function (k, v, w) {
                                if (typeof Pb_block !== "undefined") {
                                    Pb_block.params.showBlock = true;
                                    Pb_block.openAdBlock()
                                }
                            }, onPlaylistCountdown: function (k, v, w) {
                                if (typeof varObj !== "undefined" && parseInt(varObj.dataMainContainer.data("playlist-check")) == 1) {
                                    playlist_countdown(w.count)
                                }
                            }, onPlay: function () {
                                if (o === null) {
                                    return
                                }
                                setTimeout(function () {
                                    if (!i) {
                                        i = true;
                                        var k = new XMLHttpRequest();
                                        k.open("GET", o);
                                        k.send()
                                    }
                                }, 5000)
                            }, onVrError: function () {
                                alert("This feature is not supported on your current browser!")
                            }
                        },
                        preRoll: {candidates: g},
                        isVideoPage: (typeof isVideoPage !== "undefined"),
                        vrProps: (typeof vrProps !== "undefined") ? vrProps : "",
                        isVr: !!(typeof isVr !== "undefined" && isVr)
                    })
                }
            }
        })()
    }
}
function triggerFullScreenDisplay(a) {
    document.getElementById(a).classList.toggle("fullscreen")
}
mphLoadPlayer();