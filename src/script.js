(function script() {
  'use strict';
  var w, h;

  let options = {
    version: "2",
    title: `Rainbow37`,
    news: "// News"
  };

  options.title += ` (v${options.version})`
  function init() {
    ap37.setTextSize(11);

    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();
    background.init();
    info.init();
    apps.init();
    quickmenu.init();
    transmissions.init();

    ap37.setOnTouchListener(function (x, y) {
      apps.onTouch(x, y);
      transmissions.onTouch(x, y);
      quickmenu.onTouch(x, y);
    });
  }

  var quickmenu = {
    apps: [["Firefox", 62], ["YouTube", 226], ["Play Store", 145]],
    title: "Quickmenu - ",
    init: function () {
      let title = quickmenu.title;

      for(var i = 0; quickmenu.apps.length > i; i++) {
         title += truncateApps(i) + " | "
      }

      title = title.slice(0, -3);

      print(0, h-8, title, "#999999")
    },
    onTouch: function (x, y) {
      if(y == h-8) {
         let one = quickmenu.title.length + truncateApps(0).length
         let two = one + 3 + truncateApps(1).length
         let three = two + 3 + truncateApps(2).length

         if (x <= one && x >= quickmenu.title.length)
          return ap37.openApp(quickmenu.apps[0][1]);
         if (x <= two && x >= one + 3)
          return ap37.openApp(quickmenu.apps[1][1]);
         if (x <= three && x >= two + 3)
          return ap37.openApp(quickmenu.apps[2][1]);
      }
    }
  };

  var background = {
    buffer: [],
    bufferColors: [],
    pattern: '',
    printPattern: function (x0, xf, y) {
      print(x0, y,
        background.pattern.substring(y * w + x0, y * w + xf), '#333333');
    },
    init: function () {
      background.pattern = rightPad(script, h * w, ' ');

      for (var i = 0; i < h; i++) {
        background.buffer.push(background.pattern.substr(i * w, w));
        background.bufferColors.push(Array(w).fill('#333333'));
      }

      ap37.printLines(background.buffer, '#333333');
    }
  };

  var info = {
    lastLength: 0,
    update: function () {
      var d = new Date();
      var str = `${ap37.getBatteryLevel()}% / ${d.toTimeString().split(' ')[0].substr(0, 5)}`
      print(w - (str.length+1), 0, " ".repeat(str.length+1))
      print(w - str.length, 0, str, "rainbow")

      print(1,0, options.title, "rainbow")
    },
    init: function () {
      info.update();
      setInterval(info.update, 60000);
    }
  };


  var apps = {
    list: [],
    lineHeight: 2,
    topMargin: 2,
    bottomMargin: 10,
    lines: 0,
    appWidth: 6,
    appsPerLine: 0,
    appsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
    printPage: function (page) {
      var appPos = page * apps.appsPerPage;

      for (var x = 0; x + apps.appWidth <= w; x += apps.appWidth) {
        for (var y = apps.topMargin; y < apps.topMargin + apps.lines *
        apps.lineHeight; y += apps.lineHeight) {
          background.printPattern(x, x + apps.appWidth, y);
          if (appPos < apps.list.length) {
            app.y = y;
            app.x0 = x;
            var app = apps.list[appPos];
            app.xf = x + apps.appWidth;
            apps.printApp(app, false);
            appPos++;
          }
        }
      }
    },
    printApp: function (app, highlight) {
     print(app.x0, app.y, app.name.substr(0, apps.appWidth - 1), "#999999")
    },
    init: function () {
      apps.list = ap37.getApps();
      apps.lines = Math.floor((h - apps.topMargin - apps.bottomMargin) / apps.lineHeight);
      apps.appsPerLine = Math.ceil(apps.list.length / apps.lines);
      apps.appWidth = Math.floor(w / apps.appsPerLine);

      print(0,h-7, " ".repeat(w))
      print(0,h-7, `Last opened app: Nothing!`, "#999999")

      if (apps.appWidth < 6) {
        apps.appWidth = 6;
        apps.appsPerLine = Math.floor(w / apps.appWidth);
        apps.isNextPageButtonVisible = true;
        print(w - 4, h - 11, '>>>', "#999999");
        print(w - 4, h - 10, '>>>', "#999999");
      } else {
        apps.isNextPageButtonVisible = false;
        background.printPattern(w - 4, w, h - 9);
      }

      apps.appsPerPage = apps.lines * apps.appsPerLine;
      apps.currentPage = 0;

      apps.printPage(apps.currentPage);

      ap37.setOnAppsListener(apps.init);
    },
    onTouch: function (x, y) {
      for (var i = apps.currentPage * apps.appsPerPage; i <
      apps.list.length; i++) {
        var app = apps.list[i];
        if (y >= app.y && y <= app.y + 1 &&
          x >= app.x0 && x <= app.xf) {
          apps.printApp(app, true);
          ap37.openApp(app.id);

          print(0,h-7, " ".repeat(w))
          print(0,h-7, `Last opened app: ${app.name} (${app.id})`, "#999999")

          return;
        }
      }
      if (apps.isNextPageButtonVisible &&
        y >= h - 11 && y <= h - 10 &&
        x >= w - 4 && x <= w) {
        apps.currentPage++;
        if (apps.currentPage * apps.appsPerPage >= apps.list.length) {
          apps.currentPage = 0;
        }
        apps.printPage(apps.currentPage);
      }
    }
  };

  var transmissions = {
    list: [],
    update: function () {
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(async (r) => {
        try {
          var result = await r.json(),
            line = h - 4,
            t = transmissions;
          t.list = [];
          for (var i = 0; i < result.length && i < 4; i++) {
            fetch('https://hacker-news.firebaseio.com/v0/item/' + result[i] + '.json').then(async (m) => {
              var itemResult = await m.json();
              var transmission = {
                title: itemResult.title,
                url: itemResult.url,
                y: line
              };
              t.list.push(transmission);
              background.printPattern(0, w, line);
              t.printTransmission(transmission, false);
              line++;
            });
          }
        } catch (e) {
        }
      });
    },
    printTransmission: function (transmission, highlight) {
      print(0, transmission.y, transmission.title,
        highlight ? 'rainbow' : '#999999');
      if (highlight) {
        setTimeout(function () {
          transmissions.printTransmission(transmission, false);
        }, 1000);
      }
    },
    init: function () {
      print(0, h - 5, options.news, "rainbow")
      transmissions.update();
      setInterval(transmissions.update, 3600000);
    },
    onTouch: function (x, y) {
      for (var i = 0; i < transmissions.list.length; i++) {
        if (transmissions.list[i].y === y &&
          x <= transmissions.list[i].title.length) {
          transmissions.printTransmission(transmissions.list[i], true);
          ap37.openLink(transmissions.list[i].url);
          return;
        }
      }
    }
  };

  function print(x, y, text, color) {
    color = color || '#ffffff';
    background.buffer[y] = background.buffer[y].substr(0, x) + text +
      background.buffer[y].substr(x + text.length);
    for (var i = x; i < x + text.length; i++) {
      background.bufferColors[y][i] = color;
    }

    if(color == "rainbow") {
      let rainbows = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
      let rainbowColors = Array(Math.floor(text.length / rainbows.length) + 1).fill(rainbows).flat();

      ap37.printMultipleColors(x, y, text, rainbowColors)
    } else {
      ap37.print(x, y, text, color);
    }
  }

  function leftPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      new Array(newLength - str.length + 1).join(char) + str : str;
  }

  function rightPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      str + new Array(newLength - str.length + 1).join(char) : str;
  }

  function truncateApps(num) {
    return quickmenu.apps[num][0].substr(0,7);
  }

  init();
})();
