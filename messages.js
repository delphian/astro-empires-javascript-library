/**
 * @file messages.js
 * @author  Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 1.0
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Store and traverse messages.
 *
 * @details Insert message handling in the AstroEmpires object. Third party
 * should use this object to insert and traverse existing messages. A new
 * instance of this object should be used for different message types such
 * as private mail or general guild messages.
 *
 * @see https://github.com/delphian/astro-empires-javascript-library
 */

/**
 * @class AstroEmpires.Msg
 *
 * @brief Keeps track of messages, both private mail and guild messages.
 */
AstroEmpires.Msg = function() {
    Observable.call(this);
    // Hold all the messages.
    this.messages = {};
    // Individual message properties.
    this.id = null;
    this.message = null;
    this.playerName = null;
    this.playerId = null;
    this.time = null;
    this.read = null;
};
/**
 * Make the messages observable.
 */
AstroEmpires.Msg.prototype = new Observable();
/**
 * Determine if a message identifier already exists or not.
 *
 * @param int msgId
 *   The unique message identifier.
 *
 * @return bool
 *   true if the message already exists, false otherwise.
 */
AstroEmpires.Msg.prototype.exists = function(msgId) {
    var exists = false;
    if (typeof(this.messages[msgId]) != 'undefined') {
        exists = true;
    }
    return exists;
};
/**
 * Make the requested message the current message.
 *
 * @return AstroEmpires.Msg|false
 *   AstroEmpires.Msg on success, false on not found.
 */
AstroEmpires.Msg.prototype.get = function(msgId) {
    if (this.exists(msgId)) {
        this.id = this.messages[msgId].id;
        this.message = this.messages[msgId].message;
        this.playerName = this.messages[msgId].playerName;
        this.playerId = this.messages[msgId].playerId;
        this.time = this.messages[msgId].time;
        this.read = this.messages[msgId].read;
        return this;
    }
    return false;
};
/**
 * Add a message to the message log.
 *
 * @param int msgId
 *   The unique message identifier. If this message already exists then it
 *   will be overwritten.
 * @param object message
 *   The message object consisting of:
 *     'id': The message id.
 *     'time': Unix timestamp.
 *     'playerId': Unique player identifier.
 *     'playerName': Player name.
 *     'message': Contents of the actual message.
 *     'read': read|unread describes if the message has already been read.
 *
 * @return AstroEmpires.Msg|false
 *   Updated AstroEmpires.Msg on success, false on failure to set.
 */
AstroEmpires.Msg.prototype.set = function(msgId, message) {
    var success = false;
    var alter = this.publish({msgId: msgId, message: message}, 'msg_add_pre', this);
    if (msgId && (typeof(message) != 'undefined')) {
        this.messages[msgId] = {
            id: message.id,
            time: message.time,
            playerId: message.playerId,
            playerName: message.playerName,
            message: message.message,
            read: message.read
        };
        success = true;
    }
    return (success) ? this.get(msgId) : false;
};
/**
 * Get the first message.
 *
 * @return AstroEmpires.Msg|false
 *   Updated AstroEmpires.Msg on success, false on no messages exit.
 */
AstroEmpires.Msg.prototype.getFirst = function() {
    var msg = false,
        time = false;
    // Iterate through all messages, looking for the message with the first
    // timestamp.
    for(var index in this.messages) {
        if (!msg || (this.messages[index].time < msg.time)) {
            msg = this.messages[index];
        }
    }
    return (msg) ? this.get(msg.id) : false;
};
/**
 * Get the most recent message.
 *
 * @return AstroEmpires.Msg|false
 *   Updated AstroEmpires.Msg on success, false on no messages exit.
 */
AstroEmpires.Msg.prototype.getLast = function() {
    var msg = false,
        time = false;
    // Iterate through all messages, looking for the message with the last
    // timestamp.
    for(var index in this.messages) {
        if (!msg || (this.messages[index].time > msg.time)) {
            msg = this.messages[index];
        }
    }
    return (msg) ? this.get(msg.id) : false;
};
/**
 * Get the next message.
 *
 * @return AstroEmpires.Msg|false
 *   Updated AstroEmpires.Msg on success, false on end of list.
 */
AstroEmpires.Msg.prototype.getNext = function() {
    var msg = false;
    if (this.time) {
        // Iterate through all messages, looking for the timestamp
        // immediately following the current.
        for(var index in this.messages) {
            if ((this.messages[index].time >= this.time) && (index != this.id) && (!msg || (this.messages[index].time <= msg.time))) {
                msg = this.messages[index];
            }
        }
    }
    return (msg) ? this.get(msg.id) : false;
};
/**
 * Get the previous message.
 *
 * @return AstroEmpires.Msg|false
 *   Updated AstroEmpires.Msg on success, false on end of list.
 */
AstroEmpires.Msg.prototype.getPrev = function() {
    var msg = false;
    if (this.time) {
        // Iterate through all messages, looking for the timestamp
        // immediately following the current.
        for(var index in this.messages) {
            if ((this.messages[index].time <= this.time) && (index != this.id) && (!msg || (this.messages[index].time >= msg.time))) {
                msg = this.messages[index];
            }
        }
    }
    return (msg) ? this.get(msg.id) : false;
};
