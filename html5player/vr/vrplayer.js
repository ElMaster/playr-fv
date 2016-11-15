var VrPlayer = function (y) {
    var i = this;
    var J;
    if (!y.canvas || !y.video) {
        console.error("VrPlayer: canvas and video required")
    }
    var B = y.canvas;
    var l = y.video;
    var k = y.fullscreenElement || B;
    var H = y.projection || VrPlayer.PROJECTION_EQUIDISTANT_180;
    var f = y.stereoView || false;
    var e = y.stereoType || VrPlayer.MONO;
    var K = 1;
    var z = null;
    var b = 5000;
    var h = 60;
    var d = 1;
    var m = B.getContext("webgl") || B.getContext("experimental-webgl");
    m.clearColor(0, 0, 0, 1);
    m.disable(m.DEPTH_TEST);
    m.clear(m.COLOR_BUFFER_BIT | m.DEPTH_BUFFER_BIT);
    var w = {positions: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), indices: new Uint16Array([0, 1, 2, 0, 2, 3])};
    var a = m.createProgram();
    var F = {vpos: null};
    var n = {sampler: null, eye: null, invProj: null, stereoType: null};
    var A = {azimuth: 0, elevation: 0, vec: vec3.fromValues(0, 0, -1)};
    var o = mat4.create();
    var c = mat4.create();
    var r = mat4.create();
    var E = new Normotion();
    var u = {positions: m.createBuffer(), indices: m.createBuffer()};
    var g = {video: m.createTexture()};
    G();
    this.resize = function () {
        var R = window.devicePixelRatio || 1;
        B.width = B.offsetWidth * R * K;
        B.height = B.offsetHeight * R * K;
        d = R * K;
        var N = B.width / B.height;
        if (f) {
            N /= 2
        }
        var O = Math.PI * 0.5;
        var Q = O * 0.5;
        var T = Math.PI * 0.01;
        var P = N * 0.5 * Math.tan(-Q);
        var U = N * 0.5 * Math.tan(Q);
        var S = 0.5 * Math.tan(Q);
        var M = 0.5 * Math.tan(-Q);
        mat4.frustum(o, P, U, M, S, 0.5, 2);
        P = N * 0.5 * Math.tan(-Q - T);
        U = N * 0.5 * Math.tan(Q - T);
        mat4.frustum(c, P, U, M, S, 0.5, 2);
        P = N * 0.5 * Math.tan(-Q + T);
        U = N * 0.5 * Math.tan(Q + T);
        mat4.frustum(r, P, U, M, S, 0.5, 2)
    };
    function j() {
        if (K < 0.5) {
            return
        }
        K /= Math.sqrt(2);
        console.log("Downsample changed to: " + K);
        i.resize()
    }

    function x() {
        K *= Math.sqrt(2);
        if (K > 1) {
            K = 1
        }
        console.log("Downsample changed to: " + K);
        i.resize()
    }

    this.fullscreen = function () {
        k.requestFullscreen && k.requestFullscreen() || k.msRequestFullscreen && k.msRequestFullscreen() || k.mozRequestFullScreen && k.mozRequestFullScreen() || k.webkitRequestFullscreen && k.webkitRequestFullscreen()
    };
    this.exitFullscreen = function () {
        document.exitFullscreen && document.exitFullscreen() || document.msExitFullscreen && document.msExitFullscreen() || document.mozCancelFullScreen && document.mozCancelFullScreen() || document.webkitExitFullscreen && document.webkitExitFullscreen()
    };
    this.isFullscreen = function () {
        var M = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        return M != null
    };
    this.launchStereoView = function () {
        var M = screen.orientation || screen.mozOrientation || screen.msOrientation;
        f = true;
        i.fullscreen();
        M.lock("landscape");
        i.resize()
    };
    this.isStereoView = function () {
        return f
    };
    this.setStereoView = function (M) {
        f = M;
        i.resize()
    };
    ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(function (M) {
        window.addEventListener(M, function () {
            if (!i.isFullscreen()) {
                f = false;
                var N = screen.orientation || screen.mozOrientation || screen.msOrientation;
                N.unlock()
            }
            i.resize()
        })
    });
    this.start = function () {
        if (!J) {
            this.resize();
            window.requestAnimationFrame(s)
        }
    };
    this.stop = function () {
        window.cancelAnimationFrame(J);
        J = undefined
    };
    function G() {
        D();
        I();
        v();
        p();
        C()
    }

    function D() {
        var N = {vertex: null, fragment: null};
        var M = VrPlayer.SHADER_VERTEX;
        var O;
        switch (H) {
            case VrPlayer.PROJECTION_EQUIDISTANT_180:
                O = VrPlayer.SHADER_EQUIDISTANT_180;
                break;
            case VrPlayer.PROJECTION_EQUIRECTANGULAR_360:
                O = VrPlayer.SHADER_EQUIRECTANGULAR_360;
                break;
            case VrPlayer.PROJECTION_EQUIRECTANGULAR_180:
                O = VrPlayer.SHADER_EQUIRECTANGULAR_180;
                break;
            default:
                throw"Invalid projection specified"
        }
        N.vertex = m.createShader(m.VERTEX_SHADER);
        m.shaderSource(N.vertex, M);
        m.compileShader(N.vertex);
        N.fragment = m.createShader(m.FRAGMENT_SHADER);
        m.shaderSource(N.fragment, O);
        m.compileShader(N.fragment);
        m.attachShader(a, N.vertex);
        m.attachShader(a, N.fragment);
        m.linkProgram(a);
        if (!m.getProgramParameter(a, m.LINK_STATUS)) {
            throw"Unable to initialize the shader program."
        }
        m.useProgram(a);
        Object.keys(F).forEach(function (P) {
            F[P] = m.getAttribLocation(a, P);
            m.enableVertexAttribArray(F[P])
        });
        Object.keys(n).forEach(function (P) {
            n[P] = m.getUniformLocation(a, P)
        })
    }

    function I() {
        m.useProgram(a);
        m.bindBuffer(m.ARRAY_BUFFER, u.positions);
        m.bufferData(m.ARRAY_BUFFER, w.positions, m.STATIC_DRAW);
        m.vertexAttribPointer(F.vpos, 2, m.FLOAT, false, 0, 0);
        m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, u.indices);
        m.bufferData(m.ELEMENT_ARRAY_BUFFER, w.indices, m.STATIC_DRAW)
    }

    function v() {
        m.bindTexture(m.TEXTURE_2D, g.video);
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_MIN_FILTER, m.LINEAR);
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_S, m.CLAMP_TO_EDGE);
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_T, m.CLAMP_TO_EDGE);
        m.activeTexture(m.TEXTURE0);
        m.bindTexture(m.TEXTURE_2D, g.video);
        m.uniform1i(n.sampler, 0)
    }

    function p() {
        var S = undefined;
        var Q = undefined;
        var N = 0;
        var M = 0;
        var R = 0.92;
        var T;
        var O = function (X) {
            X.preventDefault();
            var U, Y, W, V;
            if (X.type === "mousemove") {
                U = X.screenX;
                Y = X.screenY
            } else {
                if (X.type === "touchmove") {
                    U = X.touches[0].screenX;
                    Y = X.touches[0].screenY
                } else {
                    return
                }
            }
            if (typeof S === "undefined" || typeof Q === "undefined") {
                W = 0;
                V = 0
            } else {
                W = U - S;
                V = Y - Q
            }
            t(W, V);
            S = U;
            Q = Y;
            N = W;
            M = V
        };
        var P = function () {
            N = N * R;
            M = M * R;
            if (Math.abs(N) < 0.001 || Math.abs(M) < 0.001) {
                window.cancelAnimationFrame(T)
            } else {
                t(N, M);
                T = window.requestAnimationFrame(P)
            }
        };
        B.addEventListener("mousedown", function () {
            window.addEventListener("mousemove", O)
        });
        window.addEventListener("mouseup", function () {
            S = undefined;
            Q = undefined;
            window.removeEventListener("mousemove", O);
            P()
        });
        B.addEventListener("touchstart", function () {
            window.addEventListener("touchmove", O)
        });
        window.addEventListener("touchend", function () {
            S = undefined;
            Q = undefined;
            window.removeEventListener("touchmove", O);
            P()
        })
    }

    function C() {
        window.addEventListener("devicemotion", E.onDeviceMotion);
        window.addEventListener("deviceorientation", E.onDeviceOrientation);
        window.addEventListener("orientationchange", E.forceReorient)
    }

    function t(N, M) {
        if (E.hasSensorInput()) {
            M = 0
        }
        var R = 0.003;
        A.azimuth += R * N;
        A.elevation += R * M;
        var Q = Math.PI / 2;
        if (A.elevation > Q) {
            A.elevation = Q
        }
        if (A.elevation < -Q) {
            A.elevation = -Q
        }
        A.azimuth = A.azimuth % (Math.PI * 2);
        var O = vec3.fromValues(0, 0, -1);
        var P = mat4.create();
        mat4.rotateY(P, P, A.azimuth);
        mat4.rotateX(P, P, A.elevation);
        vec3.transformMat4(O, O, P);
        A.vec = O
    }

    function q() {
        m.bindTexture(m.TEXTURE_2D, g.video);
        m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL, 1);
        m.texImage2D(m.TEXTURE_2D, 0, m.RGBA, m.RGBA, m.UNSIGNED_BYTE, l)
    }

    function L(O) {
        var P = mat4.lookAt(mat4.create(), vec3.fromValues(0, 0, 0), A.vec, vec3.fromValues(0, 1, 0));
        var Q = mat4.create();
        mat4.fromQuat(Q, quat.invert(quat.create(), E.getViewQuat()));
        var N = mat4.multiply(mat4.create(), Q, P);
        if (f === false) {
            N = mat4.multiply(N, o, N)
        } else {
            if (O === 0) {
                N = mat4.multiply(N, c, N)
            } else {
                if (O === 1) {
                    N = mat4.multiply(N, r, N)
                } else {
                    throw"Invalid eye"
                }
            }
        }
        var M = mat4.invert(mat4.create(), N);
        m.uniformMatrix4fv(n.invProj, false, M);
        m.uniform1i(n.eye, O);
        m.uniform1i(n.stereoType, e)
    }

    function s(O) {
        if (z !== null) {
            var M = O - z;
            var N = (M > 0) ? 1000 / M : 1000;
            h += (N - h) * 0.1;
            if (O > b) {
                console.log("Max FPS: " + h);
                if (h < 45) {
                    j()
                } else {
                    if (h > 60) {
                        x()
                    }
                }
                b = O + 5000
            }
        }
        z = O;
        m.clear(m.COLOR_BUFFER_BIT);
        q();
        m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, u.indices);
        if (f) {
            var P = B.width * 0.5;
            L(0);
            m.viewport(0, 0, P, B.height);
            m.drawElements(m.TRIANGLES, 6, m.UNSIGNED_SHORT, 0);
            L(1);
            m.viewport(P, 0, P, B.height);
            m.drawElements(m.TRIANGLES, 6, m.UNSIGNED_SHORT, 0)
        } else {
            L(0);
            m.viewport(0, 0, B.width, B.height);
            m.drawElements(m.TRIANGLES, 6, m.UNSIGNED_SHORT, 0)
        }
        J = window.requestAnimationFrame(s)
    }
};
VrPlayer.PROJECTION_EQUIDISTANT_180 = 0;
VrPlayer.PROJECTION_EQUIRECTANGULAR_360 = 1;
VrPlayer.PROJECTION_EQUIRECTANGULAR_180 = 2;
VrPlayer.MONO = 0;
VrPlayer.STEREO_SIDE_BY_SIDE_LR = 1;
VrPlayer.STEREO_OVER_UNDER_LR = 2;
VrPlayer.STEREO_SIDE_BY_SIDE_RL = 3;
VrPlayer.STEREO_OVER_UNDER_RL = 4;