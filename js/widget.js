$(function() {
  var refresh_ms = 1000 * 60;

  var rowclass = 'rowodd';

  var guid = get_guid();
  var instance = JSON.parse(localStorage.getItem(guid));

  if (!instance || instance === "" || localStorage.getItem(guid) === undefined) {
    instance = {};
  }

  /* get stored symbols out of google sync */
  chrome.storage.sync.get(guid, function(x) {
    var sync_symbols = JSON.parse(x[guid]);
    if (sync_symbols.toString() != instance.symbols.toString()) {
      instance.symbols = sync_symbols;
      instance.lastUpdate = 0;
      getQuotes(instance.symbols);
    }
  });

  if (!instance.symbols) {
    instance.symbols = ['.SPX', '.DJIA', '.IXIC'];
  }

  instance.symbols.forEach(function(symbol) {
    var rowstr = '<tr id="row' + symbol + '" class="' + rowclass + '">';
    rowstr += '<td align="left" id="symbol' + symbol + '">' + symbol + "</td>";
    rowstr += '<td align="right" id="last' + symbol + '"></td>';
    rowstr += '<td width="60px" align="right" id="change' + symbol + '"></td>';
    rowstr += '</tr>';
    $('#quotetablebody').append(rowstr);
    rowclass = rowclass == 'rowodd' ? 'roweven' : 'rowodd';
  });

  if (instance.quoteData) {
    updQuotes(instance.quoteData);
  }
  getQuotes(instance.symbols);

  function jqSelector(str) {
    return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
  }

  function get_guid() {
    try {
      if (window.location.hash) {
        return JSON.parse(decodeURIComponent(window.location.hash).substring(1)).id;
      } else {
        return "default";
      }
    } catch (e) {
      return "default";
    }
  }

  function getQuotes(symbols) {
    if (instance.lastUpdate && instance.lastUpdate >= new Date().getTime() - refresh_ms) {
      updQuotes(instance.quoteData);
      return;
    }
    chrome.extension.sendMessage({
      action: 'getQuote',
      symbols: symbols,
    }, function(response) {
      if (response && response.data) {
        instance.quoteData = response.data;
        instance.lastUpdate = new Date().getTime();
        localStorage.setItem(guid, JSON.stringify(instance));
        updQuotes(instance.quoteData);
      }
    });
  }

  function updQuotes(data, pct) {
    if (typeof pct === 'undefined') {
      pct = false;
    }

    data.forEach(function(quote) {
      $('#last' + jqSelector(quote.symbol)).html(quote.last);

      if (pct) {
        $('#change' + jqSelector(quote.symbol)).html(parseFloat(quote.change_pct).toFixed(2) + '%');
      } else {
        $('#change' + jqSelector(quote.symbol)).html(quote.change);
      }

      if (quote.change < 0) {
        $('#change' + jqSelector(quote.symbol)).addClass('red');
      } else {
        $('#change' + jqSelector(quote.symbol)).addClass('green');
      }

      $('#symbol' + jqSelector(quote.symbol)).click(function(e) {
        window.open('http://data.cnbc.com/quotes/' + quote.symbol, '_top');
      });

      $('#change' + jqSelector(quote.symbol)).click(function(e) {
        updQuotes(instance.quoteData, !pct);
      })

    });
  }

  setInterval(function() {
    getQuotes(instance.symbols);
  }, refresh_ms);

});