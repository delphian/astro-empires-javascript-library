
AstroEmpires.Skin.BlueNova2_new = {
    /**
     * Publish callback for url_account_display.
     *
     * Determine if we are using the BlueNova skin and set ae object if we are.
     */
    setSkin: function(data, messageType, ae) {
        var skin = false;
        // Get the current value of the skin drop down.
        skin = AstroEmpires.regex(/<select name='skin'.*?>.*?<option value='([^']*)' selected='selected'>.*?<\/select>/i, data.data, 1, ae.user.skin);
        skin = (skin.length == 0) ? 'BlueNova2_new' : skin;
        ae.user.skin = skin;
    },
    /**
     * Publish callback for skin_BlueNova2_new_account_display.
     *
     * Set the language used.
     */
    setLanguage: function(data, messageType, ae) {
        ae.user.language = AstroEmpires.regex(/<select name='language'.*?>.*?<option value='([^']*)' selected='selected'>.*?<\/select>/i, data.data, 1, ae.user.langauge);
    },
    /**
     * Publish callback for skin_BlueNova2_new_account.
     *
     * Capture the credits, income, fleetSize, technology, level and rank.
     */
    account: function(data, messageType, ae) {
        ae.stats.credits = AstroEmpires.regex(/<a id='credits'.*?([0-9,]+).*?<\/a>/ig, data.data, 1, ae.stats.credits);
        ae.stats.income = AstroEmpires.regex(/<td>[\s]*<b>Empire Income<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig, data.data, 1, ae.stats.income);
        ae.stats.fleetSize = AstroEmpires.regex(/<td>[\s]*<b>Fleet Size<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig, data.data, 1, ae.stats.fleetSize);
        ae.stats.technology = AstroEmpires.regex(/<td>[\s]*<b>Technology<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig, data.data, 1, ae.stats.technology);
        ae.stats.level = AstroEmpires.regex(/<td>[\s]*<b>Level<\/b>[\s]*<\/td>[\s]*<td>([0-9\.]+)[^(]+\([^0-9]+([0-9]+)\)/ig, data.data, 1, ae.stats.level);
        ae.stats.rank = AstroEmpires.regex(/<td>[\s]*<b>Level<\/b>[\s]*<\/td>[\s]*<td>([0-9\.]+)[^(]+\([^0-9]+([0-9]+)\)/ig, data.data, 2, ae.stats.rank);        
    },
    /**
     * Publish callback for skin_BlueNova2_new_board.
     *
     * Capture all messages on the first page of the board. Record the messages
     * on the ae object.
     */
    board: function(data, messageType, ae) {
        var message, 
            pattern = /<tr class='(unread|read)'>.*?<\/tr><tr>.*?<\/tr>/gi;
        while(message = AstroEmpires.regex(pattern, data.data, 0, false)) {
            var match;
            if (match = /<tr class='(unread|read)'>.*?quote=([0-9]+).*?<\/tr><tr><td.*?>(.*?)<\/td><\/tr>/i.exec(message)) {
                if (!ae.msgExists(match[2])) {
                    ae.msgAdd(match[2], {
                        id: match[2],
                        message: match[3]
                    });
                }
            }
        }
    }
}

// Register our callbacks.
ae.subscribe('url_account_display', AstroEmpires.Skin.BlueNova2_new.setSkin);
ae.subscribe('skin_BlueNova2_new_account_display', AstroEmpires.Skin.BlueNova2_new.setLanguage);
ae.subscribe('skin_BlueNova2_new_account', AstroEmpires.Skin.BlueNova2_new.account);
ae.subscribe('skin_BlueNova2_new_board', AstroEmpires.Skin.BlueNova2_new.board);
