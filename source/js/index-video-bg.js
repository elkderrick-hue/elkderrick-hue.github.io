(function () {
  // 只在首页生效（/ 或 /index.html）
  var p = location.pathname;
  if (p !== "/" && !p.endsWith("/index.html")) return;

  function addVideo() {
    var header = document.querySelector("#page-header");
    if (!header) return;

    if (document.getElementById("index-video-bg")) return;

    var v = document.createElement("video");
    v.id = "index-video-bg";
    v.src = "/video/cover.mp4";
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("webkit-playsinline", "true");

    header.prepend(v);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addVideo);
  } else {
    addVideo();
  }
})();
