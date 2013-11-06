  var info = {
    poke: 3,
    width: 1,
    height: 1,
    path: "widget.html",
    "v2": {
      "resize": false,
      "min_height": 1,
      "max_height": 1,
      "min_width": 1,
      "max_width": 1
    },
    "v3": {
      "multi_placement": true
    }
  };

  chrome.extension.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke") {
      chrome.extension.sendMessage(
        sender.id, {
        head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
        body: info,
      });
    }
  });

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log(sender);
    if (request.action === "getQuote") {
      $.ajax({
        type: "POST",
        url: 'https://quote.cnbc.com/quote-html-webservice/quote.htm',
        data: {
          symbols: request.symbols.join('|'),
          symbolType: 'symbol',
          requestMethod: 'quick',
          exthrs: 1,
          fund: 1,
          entitlment: 0,
          extendedMask: 1,
          partnerId: 2,
          output: 'json',
          noform: 1
        },
        success: function(data) {
          if (data.QuickQuoteResult && data.QuickQuoteResult.QuickQuote) {
            if (Array.isArray(data.QuickQuoteResult.QuickQuote)) {
              sendResponse({
                data: data.QuickQuoteResult.QuickQuote
              });
            } else {
              var ret = [];
              ret[0] = data.QuickQuoteResult.QuickQuote;
              sendResponse({
                data: ret
              });
            }
          }
        }
      });
    }
    return (true);
  });