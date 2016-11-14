(function() {
    function multiline(f) {
        // hack for clean multiline strings
        return f.toString().split("\n").slice(1, -1).join("\n");
    }

    // Shaders
    VrPlayer.SHADER_VERTEX = multiline(function () { /**
    attribute highp vec2 vpos;

    uniform highp mat4 invProj;

    varying highp vec3 vDir;

    void main(void) {
      gl_Position = vec4(vpos, 1.0, 1.0);
      highp vec4 dir = invProj * gl_Position;
      vDir = dir.xyz / dir.w;
    }
    **/});

    VrPlayer.SHADER_EQUIDISTANT_180 = multiline(function () { /**
    precision highp float;

    varying highp vec3 vDir;
    uniform int eye;
    uniform int stereoType;
    uniform sampler2D sampler;

    #define PI 3.1415926535897932384626433832795

    mediump vec4 getColor(vec3 direction, int eye) {
      highp float phi = atan(length(direction.xy), -1.0 * direction.z);

      if (phi > PI / 2.0) {
        return vec4(0.0, 0.0, 0.0, 1.0);
      }

      highp float theta = atan(direction.y, direction.x);

      highp float R = phi / PI;
      highp float X = R * cos(theta) + 0.5;
      highp float Y = R * sin(theta) + 0.5;

      if (stereoType == 1) {
        X = (X + float(eye)) * 0.5;
      } else if (stereoType == 2) {
        Y = (Y + float(eye)) * 0.5;
      } else if (stereoType == 3) {
        X = (X + float(1 - eye)) * 0.5;
      } else if (stereoType == 4) {
        Y = (Y + float(1 - eye)) * 0.5;
      }

      return texture2D(sampler, vec2(X, Y));
    }

    void main(void) {
      gl_FragColor = getColor(vDir, eye);
    }
    **/});

    VrPlayer.SHADER_EQUIRECTANGULAR_360 = multiline(function () { /**
    precision highp float;

    varying highp vec3 vDir;
    uniform int eye;
    uniform int stereoType;
    uniform sampler2D sampler;

    #define PI 3.1415926535897932384626433832795

    mediump vec4 getColor(vec3 direction, int eye) {
      mediump float phi = atan(direction.x, -1.0 * direction.z);
      mediump float theta = atan(direction.y, length(direction.xz));

      highp float invTwoPi = 0.5 / PI;

      highp float X = phi * invTwoPi + 0.5;
      highp float Y = theta * invTwoPi * 2.0 + 0.5;

      if (stereoType == 1) {
        X = (X + float(eye)) * 0.5;
      } else if (stereoType == 2) {
        Y = (Y + float(eye)) * 0.5;
      } else if (stereoType == 3) {
        X = (X + float(1 - eye)) * 0.5;
      } else if (stereoType == 4) {
        Y = (Y + float(1 - eye)) * 0.5;
      }

      return texture2D(sampler, vec2(X, Y));
    }

    void main(void) {
      gl_FragColor = getColor(vDir, eye);
    }
    **/});

    VrPlayer.SHADER_EQUIRECTANGULAR_180 = multiline(function () { /**
    precision highp float;

    varying highp vec3 vDir;
    uniform int eye;
    uniform int stereoType;
    uniform sampler2D sampler;

    #define PI 3.1415926535897932384626433832795

    mediump vec4 getColor(vec3 direction, int eye) {
      highp float phi = atan(direction.x, -1.0 * direction.z);
      highp float theta = atan(direction.y, length(direction.xz));

      if (abs(phi) > 0.5 * PI) {
        return vec4(0.0, 0.0, 0.0, 1.0);
      }

      highp float invPi = 1.0 / PI;

      highp float X = phi * invPi + 0.5;
      highp float Y = theta * invPi + 0.5;

      if (stereoType == 1) {
        X = (X + float(eye)) * 0.5;
      } else if (stereoType == 2) {
        Y = (Y + float(eye)) * 0.5;
      } else if (stereoType == 3) {
        X = (X + float(1 - eye)) * 0.5;
      } else if (stereoType == 4) {
        Y = (Y + float(1 - eye)) * 0.5;
      }

      return texture2D(sampler, vec2(X, Y));
    }

    void main(void) {
      gl_FragColor = getColor(vDir, eye);
    }
    **/});
})();
