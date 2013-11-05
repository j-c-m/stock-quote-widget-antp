$(function() {
  var refresh_ms = 1000 * 60;

  var rowclass = 'rowodd';

  var guid = get_guid();
  var instance = JSON.parse(localStorage.getItem(guid));

  if (!instance || instance === "" || localStorage.getItem(guid) === undefined) {
    instance = {};
  }

  if (!instance.symbols) {
    instance.symbols = ['.SPX', '.DJIA', '.IXIC'];
  }

  quoteTable(instance.symbols);

  /* get stored symbols out of google sync */
  chrome.storage.sync.get(guid, function(x) {
    var sync_symbols = JSON.parse(x[guid]);
    if (sync_symbols.toString() != instance.symbols.toString()) {
      instance.symbols = sync_symbols;
      instance.lastUpdate = 0;
      quoteTable(instance.symbols);
      getQuotes(instance.symbols);
    }
  });

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes[guid]) {
      var sync_symbols = JSON.parse(changes[guid].newValue);
      if (sync_symbols.toString() != instance.symbols.toString()) {
        instance.symbols = sync_symbols;
        instance.lastUpdate = 0;
        quoteTable(instance.symbols);
        getQuotes(instance.symbols);
      }
    }
  });

  if (instance.quoteData) {
    updQuotes(instance.quoteData);
  }
  getQuotes(instance.symbols);

  function quoteTable(symbols) {
    $('#quotetablebody').empty();
    symbols.forEach(function(symbol) {
      var rowstr = '<tr id="row' + symbol + '" class="' + rowclass + '">';
      rowstr += '<td class="symbol" align="left" id="symbol' + symbol + '">' + symbol + "</td>";
      rowstr += '<td class="last" align="right" id="last' + symbol + '"></td>';
      rowstr += '<td class="change" align="right" id="change' + symbol + '"></td>';
      rowstr += '</tr>';
      $('#quotetablebody').append(rowstr);
      rowclass = rowclass == 'rowodd' ? 'roweven' : 'rowodd';
    });
  }

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
    if (instance.lastUpdate && instance.lastUpdate > new Date().getTime() - refresh_ms) {
      refreshTimer();
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
        refreshTimer();
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
        if (Math.abs(parseFloat(quote.change_pct)) > 10) {
          $('#change' + jqSelector(quote.symbol)).html(parseFloat(quote.change_pct).toFixed(1) + '%');
        } else {
          $('#change' + jqSelector(quote.symbol)).html(parseFloat(quote.change_pct).toFixed(2) + '%');
        }
      } else {
        $('#change' + jqSelector(quote.symbol)).html(parseFloat(quote.change).toFixed(2));
      }

      if (quote.change < 0) {
        $('#change' + jqSelector(quote.symbol)).toggleClass('green', false);
        $('#change' + jqSelector(quote.symbol)).toggleClass('red', true);
      } else {
        $('#change' + jqSelector(quote.symbol)).toggleClass('green', true);
        $('#change' + jqSelector(quote.symbol)).toggleClass('red', false);
      }

      if (quote.shortName.length > 7) {
        $('#symbol' + jqSelector(quote.symbol)).html('<a target="_top" href="http://data.cnbc.com/quotes/' + quote.symbol + '">' + quote.symbol + '</a>');
      } else {
        $('#symbol' + jqSelector(quote.symbol)).html('<a target="_top" href="http://data.cnbc.com/quotes/' + quote.symbol + '">' + quote.shortName + '</a>');
      }


      $('#change' + jqSelector(quote.symbol)).off('click');
      $('#change' + jqSelector(quote.symbol)).click(function(e) {
        updQuotes(instance.quoteData, !pct);
      });

    });
  }

  function refreshTimer() {
    setTimeout(function() {
      getQuotes(instance.symbols);
    }, refresh_ms);
  }
});