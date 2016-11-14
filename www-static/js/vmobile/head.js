function setCookieAdvanced(b, g, c, j, e, a) {
    if (c) {
        var f = new Date();
        f.setTime(f.getTime());
        c = c * 1000 * 60 * 60 * 24;
        var h = new Date(f.getTime() + c)
    }
    var d = getDomain();
    document.cookie = b + "=" + escape(g) + (c ? ";expires=" + h.toGMTString() : "") + (j ? ";path=" + j : ";path=/") + (e ? ";domain=" + e : ";domain=" + d) + (a ? ";secure" : "")
}
function getCookieAdvanced(a) {
    var f = document.cookie.split(";");
    var b = "";
    var d = "";
    var e = "";
    var c = false;
    for (i = 0; i < f.length; i++) {
        b = f[i].split("=");
        d = b[0].replace(/^\s+|\s+$/g, "");
        if (d == a) {
            c = true;
            if (b.length > 1) {
                e = unescape(b[1].replace(/^\s+|\s+$/g, ""))
            }
            return e;
            break
        }
        b = null;
        d = ""
    }
    if (!c) {
        return null
    }
}
function deleteCookieAdvanced(a, d, c) {
    if (getCookieAdvanced(a)) {
        var b = getDomain();
        document.cookie = a + "=" + (d ? ";path=" + d : ";path=/") + (c ? ";domain=" + c : ";domain=" + b) + ";expires=Thu, 01-Jan-1970 00:00:01 GMT"
    }
}
function getDomain() {
    var c = document.domain;
    var b = c.toString().split(".".toString());
    var a = b[b.length - 2] + "." + b[b.length - 1];
    return a
}
function time() {
    return Math.floor(new Date().getTime() / 1000)
}
// $(function () {
//     var b = document.createElement("script");
//     b.type = "text/javascript";
//     b.id = "htScript";
//     b.async = true;
//     b.src = ("https:" == document.location.protocol ? "https://" : "http://") + "ht.pornhub.com/js/ht.js?site_id=3";
//     b.onload = function () {
//         htUrl = "ht.pornhub.com"
//     };
//     var a = document.getElementsByTagName("script")[0];
//     a.parentNode.insertBefore(b, a)
// });