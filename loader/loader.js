
(function script() {
  fetch("https://raw.githubusercontent.com/LukewarmCat/ap37/indev/src/script.js").then(async (r) => {
    var x = document.createElement("script");
    var t = document.createTextNode(await r.text());
    x.appendChild(t);
    document.body.appendChild(x);
  });
})();
