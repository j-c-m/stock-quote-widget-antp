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
        $('body').text('There are currently no default options for this widget, configure each individually.');
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