
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
    }
}

// Register our callbacks.
ae.subscribe('url_account_display', AstroEmpires.Skin.BlueNova2_new.setSkin);
ae.subscribe('skin_BlueNova2_new_account_display', AstroEmpires.Skin.BlueNova2_new.setLanguage);
ae.subscribe('skin_BlueNova2_new_account', AstroEmpires.Skin.BlueNova2_new.account);
