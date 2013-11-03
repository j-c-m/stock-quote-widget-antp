$(function() {
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

    var guid = get_guid();

    if (guid == 'default') {
        $('body').append('<p>There are currently no default options for this widget, each widget instance must be configured individually.</p>');
        $('body').append('<p><ul><li>Unlock the grid by clicking on the padlock on the left toolbar.</li><li>Configure each widget by mousing over the tile and clicking the green configure gear.</li></ul></p>');
        return;
    }

    var instance = JSON.parse(localStorage.getItem(guid));

    $optionsform = $('<form></form>');
    $optionsform.append('Symbols: <input size="60" type="text" id="symbols" /><br/>');
    $optionsform.append('<button id="savesymbols">Save</button>');

    $('#options').append($optionsform);
    $('#symbols').val(instance.symbols.join(" "));
    $('#savesymbols').click(function(e) {
        var symbols = $('#symbols').val().split(' ');
        if (symbols.length > 9) {
            symbols = symbols.slice(0, 9);
            $('#error').html('*maximum 9 stock symbols per tile*')
            $('#symbols').val(symbols.join(" "));
        } else {
            $('#error').html('');
        }

        instance.symbols = symbols;
        instance.lastUpdate = 0;
        localStorage.setItem(guid, JSON.stringify(instance));


        /* store symbol list in chrome sync storage online */
        var syncobj = {};
        syncobj[guid] = JSON.stringify(instance.symbols);
        chrome.storage.sync.set(syncobj, function() {});
    });
});