
/**
 * @file
 * @author  Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 1.0
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Register callbacks to parse astro empires blue nova skin.
 *
 * @details Parsing the astro empires site to retrieve information is skin
 * specific. This file will determine if the Blue Nova skin is being used,
 * and if so will handle all parsing for it.
 *
 * @see https://github.com/delphian/astro-empires-javascript-library
 */

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
            var time = AstroEmpires.regex(/<td.*?>([0-9]{1,2} [a-z]{3} [0-9]{4},.*?)<\/td>/i, message, 1, false);
            time = Date.parse(time.replace(/, /gi, ',').replace(/ /gi, '/').replace(/,/gi, ' '))/1000;
            var read = AstroEmpires.regex(/<tr class='(unread|read)'>/i, message, 1, false);
            var msgId = AstroEmpires.regex(/quote=([0-9]+)/i, message, 1, false);
            var text = AstroEmpires.regex(/<tr.*?><\/tr><tr><td.*?>(.*?)<\/td><\/tr>/i, message, 1, false);
            var playerId = AstroEmpires.regex(/player=([0-9]+)/i, message, 1, false);
            var playerName = AstroEmpires.regex(/<a href='profile.aspx\?player=[0-9]+'>(.*?)<\/a>/i, message, 1, false);
            if (!ae.msgs.guild.exists(msgId)) {
                ae.msgs.guild.set(msgId, {
                    id: msgId,
                    time: time,
                    playerId: playerId,
                    playerName: playerName,
                    message: text,
                    read: read
                });
            }
        }
    },
    /**
     * Publish callback for skin_BlueNova2_new_messages.
     *
     * Capture private messages.
     */
    messages: function(data, messageType, ae) {
        var message, 
            pattern = /<tr class='(unread|read)'>.*?<\/tr><tr>.*?<\/tr>/gi;
        while(message = AstroEmpires.regex(pattern, data.data, 0, false)) {
            var time = AstroEmpires.regex(/<td.*?>([0-9]{1,2} [a-z]{3} [0-9]{4},.*?)<\/td>/i, message, 1, false);
            time = Date.parse(time.replace(/, /gi, ',').replace(/ /gi, '/').replace(/,/gi, ' '))/1000;
            var read = AstroEmpires.regex(/<tr class='(unread|read)'>/i, message, 1, false);
            var msgId = AstroEmpires.regex(/reply=([0-9]+)/i, message, 1, false);
            var text = AstroEmpires.regex(/<tr.*?><\/tr><tr><td.*?>(.*?)<\/td><\/tr>/i, message, 1, false);
            var playerId = AstroEmpires.regex(/player=([0-9]+)/i, message, 1, false);
            var playerName = AstroEmpires.regex(/<a href='profile.aspx\?player=[0-9]+'>(.*?)<\/a>/i, message, 1, false);
            if (!ae.msgs.mail.exists(msgId)) {
                ae.msgs.mail.set(msgId, {
                    id: msgId,
                    time: time,
                    playerId: playerId,
                    playerName: playerName,
                    message: text,
                    read: read
                });
            }
        }
    },
    map: function(data, messageType, ae) {
        // Solar system. Record player information.
        $('div.map-system_content div.astro_container div.description a', data.data).each(function(index) {
            var player = {
                id: AstroEmpires.regex(/player=([0-9]+)/i, $(this).attr('href'), 1, null),
                name: AstroEmpires.regex(/(\[[^\]]*\][\s]+)?([a-z0-9 ]+)/i, $(this).html(), 2, null),
            };
            ae.players.set(player);
        });
    },
    /**
     * Player profile page.
     */
    profile: function(data, messageType, ae) {
        var player = {};
        var specs = $('td#profile_specs', data.data).html();
        var header = $('div.profile_header div.sbox_ctr span', data.data).html();
        player.id = AstroEmpires.regex(/player[^0-9]+([0-9]+)/i, specs, 1, null);
        player.guild = AstroEmpires.regex(/guild=([0-9]+)/i, specs, 1, null);
        player.level = AstroEmpires.regex(/level[^0-9\.]+([0-9\.]+)/i, specs, 1, null);
        player.rank = AstroEmpires.regex(/\(rank ([0-9]+)\)/i, specs, 1, null);
        player.economy = AstroEmpires.regex(/economy[^0-9]+([0-9,]+)/i, specs, 1, null);
        player.age = AstroEmpires.regex(/account age[^0-9]+([0-9]+)/i, specs, 1, null);
        player.name = AstroEmpires.regex(/(\[[^\]]*\][\s]*)?(.*)/i, header, 2, null);
        ae.players.set(player);
    },
    /**
     * Register to handle all messages if they exist.
     *
     * This function will be automatically called by the AstroEmpires.AE constructor.
     */
    register: function(ae) {
        ae.subscribe('url_account_display', AstroEmpires.Skin.BlueNova2_new.setSkin);
        ae.subscribe('url_map', AstroEmpires.Skin.BlueNova2_new.map);
        ae.subscribe('skin_BlueNova2_new_account_display', AstroEmpires.Skin.BlueNova2_new.setLanguage);
        ae.subscribe('skin_BlueNova2_new_account', AstroEmpires.Skin.BlueNova2_new.account);
        ae.subscribe('skin_BlueNova2_new_board', AstroEmpires.Skin.BlueNova2_new.board);
        ae.subscribe('skin_BlueNova2_new_messages', AstroEmpires.Skin.BlueNova2_new.messages);
        ae.subscribe('skin_BlueNova2_new_profile', AstroEmpires.Skin.BlueNova2_new.profile);
    }
}
