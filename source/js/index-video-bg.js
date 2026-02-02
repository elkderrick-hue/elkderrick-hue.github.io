// (function () {
//   // 只在首页生效（/ 或 /index.html）
//   var p = location.pathname;
//   if (p !== "/" && !p.endsWith("/index.html")) return;

//   function addVideo() {
//     var header = document.querySelector("#page-header");
//     if (!header) return;

//     if (document.getElementById("index-video-bg")) return;

//     var v = document.createElement("video");
//     v.id = "index-video-bg";
//     v.src = "/video/cover.mp4";
//     // v.poster = "/img/cover-poster.jpg";
//     // v.preload = "metadata";
//     v.autoplay = true;
//     v.loop = true;
//     v.muted = true;
//     v.playsInline = true;
//     v.setAttribute("webkit-playsinline", "true");

//     header.prepend(v);
//   }

//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", addVideo);
//   } else {
//     addVideo();
//   }
// })();
(function () {
  // 只在首页生效（/ 或 /index.html）
  var p = location.pathname;
  if (p !== "/" && !p.endsWith("/index.html")) return;

  // 手机端不加载视频（更快更省流量）——如果你想手机也播放，删掉这一行
  if (window.matchMedia("(max-width: 768px)").matches) return;

  function addVideo() {
    var header = document.querySelector("#page-header");
    if (!header) return;

    // 防止重复插入
    if (document.getElementById("index-video-bg")) return;

    var v = document.createElement("video");
    v.id = "index-video-bg";

    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("webkit-playsinline", "true");

    // 关键：先显示封面图，视频渐进加载（体感更快）
    v.preload = "metadata";
    v.poster = "/img/cover-poster.jpg";

    // WebM 优先（Chrome/Edge 更快）
    var s1 = document.createElement("source");
    s1.src = "/video/cover-720.webm";
    s1.type = "video/webm";

    // MP4 兜底（Safari 需要）
    var s2 = document.createElement("source");
    s2.src = "/video/cover-720.mp4";
    s2.type = "video/mp4";

    v.appendChild(s1);
    v.appendChild(s2);

    header.prepend(v);
  }

  // 稍微延迟一点点，让首屏文字先出来（体感更顺）
  function boot() {
    setTimeout(addVideo, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
