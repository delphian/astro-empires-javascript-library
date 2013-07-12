/**
 * @file player.js
 * @author Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Store and retrieve player information.
 *
 * @see https://github.com/delphian/astro-empires-javascript-library
 */

/**
 * @class AstroEmpires.Player
 *
 * @brief Keeps track of players.
 *
 * @param AstroEmpires.AE ae
 *   The instantiated ae object these players are associated with.
 */
AstroEmpires.Player = function(ae) {
    this.ae = ae;
    Observable.call(this);
    // All players.
    this.players = {};
    // Individual message properties.
    // (int) Unique player identifier.
    this.id = null;
    // (string) Player name;
    this.name = null;
    // (int) Guild identifier, if any.
    this.guild = null;
};
/**
 * Make the player observable.
 */
AstroEmpires.Player.prototype = new Observable();
/**
 * Determine if a player identifier already exists or not.
 *
 * @param int playerId
 *   The unique message identifier.
 *
 * @return bool
 *   true if the message already exists, false otherwise.
 */
AstroEmpires.Player.prototype.exists = function(playerId) {
    var exists = false;
    if (typeof(this.players[playerId]) != 'undefined') {
        exists = true;
    }
    return exists;
};
/**
 * Make the requested player the current player.
 *
 * @return AstroEmpires.Player|false
 *   AstroEmpires.Msg on success, false on not found.
 */
AstroEmpires.Player.prototype.get = function(playerId) {
    if (this.exists(playerId)) {
        this.id = this.players[playerId].id;
        this.name = this.players[playerId].name;
        this.guild = this.players[playerId].guild;
        return this;
    }
    return false;
};
/**
 * Add a player.
 *
 * @param object player
 *   The player object consisting of:
 *     'id': (int) The player id.
 *     'time': (int) Unix timestamp.
 *     'name': (string) Player name.
 *     'guild': (int) Guild identifier.
 *
 * @return AstroEmpires.Player|false
 *   Updated AstroEmpires.Player on success, false on failure to set.
 */
AstroEmpires.Player.prototype.set = function(player) {
    var success = false;
    this.publish(player, 'pre_set', this);
    if (typeof(player) != 'undefined' && player.id) {
        this.players[player.id] = {
            id: player.id,
            time: player.time,
            name: player.name,
            guild: player.guild
        };
        success = true;
        this.publish(player, 'post_set', this);
    }
    return (success) ? this.get(player.id) : false;
};
