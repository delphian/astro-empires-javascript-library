
/**
 * @file
 * @author  Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 1.0
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Communicate with astro empires web site.
 *
 * @details Astro Empires object will take care of requesting data, parsing the
 * response and storing the data.
 *
 * @see https://github.com/delphian/astro-empires-javascript-library
 */

// Name space.
var AstroEmpires = {
    // All languages should namespace themselves here.
    Language: {},
    // All skins should namespace themselves here.
    Skin: {},
    /**
     * Simplify pulling values out of a regular expression into a single line.
     *
     * @param string $pattern
     *   The regular expression pattern.
     * @param string subject
     *   The subject source to search for pattern in.
     * @param int index
     *   The matching index value to return.
     * @param mixed default
     *   A default value to return if match is not found.
     *
     * @return string|bool
     *   The matched value or false on failure.
     */
    regex: function(pattern, subject, index, value) {
        var match;
        if (match = pattern.exec(subject)) {
            value = match[index];
        }
        return value;
    }
};


/**
 * @class AstroEmpires.AE
 *
 * @brief Request data from astro empires, parse by skin, and store results.
 *
 * @details Although this object will request information from astro empires,
 *   the information is meaningless and will not be stored unless first parsed
 *   by a skin handler (located in the skin subdirectory). Because this is
 *   basically a glorified screen scraper, the regular expressions used to
 *   parse out information are skin specific.
 *
 *   Sequence of operation:
 *     1. A page request is made.
 *     2. Any registered skins are given the opportunity to parse the results.
 *     3. A skin parses the results and stores them in the AE object.
 *
 *   The AE object utilizes the observer design pattern. Skins may register
 *   themselves to be called for specific messages. Every ajax request will
 *   publish a url_[page_url] message, during parsing a skin specific
 *   message will be published for the given url.
 *
 * @param string server
 *   The url of the server. Do not prefix the protocol.
 * @param string email
 *   Login email address.
 * @param string pass
 *   Login password.
 * @param object options
 *   (optional) Instantiate AE with values in statistics or messages.
 */
AstroEmpires.AE = function(server, email, pass, options) {
    Observable.call(this);
    // User credentials.
    this.user = {
        server: server,
        email: email,
        pass: pass,
        // The skin is set by a skin observer. Later this value will be used
        // to publish skin specific messages.
        skin: false,
        language: false
    };
    // Statistics to be retrieved from AE website.
    this.stats = {
        // credits: options['credits'],
        // income: options['income'],
        // fleetSize: options['fleetSize'],
        // technology: options['technology'],
        // level: options['level'],
        // rank: options['rank'],
    };
    this.msgs = {
        guild: new AstroEmpires.Msg(),
        mail: new AstroEmpires.Msg()
    };
    // Attatch any skin parsers. A skin parser javascript file should be
    // included after the AstroEmpires object. The skin parser object should
    // directly insert itself into AstroEmpires.Skin.SKIN_NAME and at least
    // provide a 'register' callback function.
    for(index in AstroEmpires.Skin) {
        if (typeof(AstroEmpires.Skin[index].register) != 'undefined') {
            AstroEmpires.Skin[index].register(this);
        }
    }
};
/**
 * Make ae observable.
 */
AstroEmpires.AE.prototype = new Observable();
/**
 * Send and receive ajax requests.
 *
 * @param string url
 *   The fully formed url to access.
 * @param string type
 *   Type of access (POST, GET).
 * @params string
 *   Name value pairs just as during a GET request.
 */
AstroEmpires.AE.prototype.ajax = function(url, type, params) {
    var alter = this.publish({url: url, type: type, params: params}, 'ajax', this);
    var xhr = new XMLHttpRequest();
    thisAEO = this;
    xhr.onreadystatechange = function () {
        if (this.readyState == this.DONE) {
            // Everything went 'ok'.
            if (this.status == 200) {
                // Check if we have been asked to login.
                if (this.responseText.match(/<title>Login.*?<\/title>/i)) {
                    // Login.
                    thisAEO.login();
                    // Now try getting data again.
                    thisAEO.getData(url);
                }
                // We have not been asked to login, this should be the
                // requested page.
                else {
                    thisAEO.processData(url, this.responseText);
                }
            }
            // A response header other than 200 (ok) was returned. Remember
            // redirects are transparantly handled by XMLHttpRequest().
            else {
                console.log('Failed to open ' + url);
            }
        }
    },
    xhr.open(type, url, true);
    // No post parameters exist, this may be a simple GET.
    if (null === params) {
        xhr.send();
    }
    else {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
};
/**
 *
 * Examine the results of an ajax request.
 *
 * Uses regular expressions to scrape values out of the html response.
 *
 * @param string url
 *   The url that generated this response.
 * @param string response
 *   The response itself containing html.
 */
AstroEmpires.AE.prototype.processData = function (url, data) {
    // Pull out page name and view mode, if any, from the url.
    var page = '';
    var view = '';
    if (match = /.*\/([^\.]+)\.aspx(.+view=([a-z]+))?/i.exec(url)) {
        page = '_' + match[1];
        view = match[3] ? '_' + match[3] : '';
        // Call any observers that do not care about skin.
        var results = this.publish({data: data, url: url}, 'url' + page + view, this);
        if (this.user.skin) {
            // Call observers that do care about skin.
            this.publish({data: data, url: url}, 'skin_' + this.user.skin + page + view, this);
        }
    }
    else {
        throw exception()
    }
};
/**
 * Relogin to the website.
 */
AstroEmpires.AE.prototype.login = function() {
    var params = "email=" + this.user.email +
        "&pass=" + this.user.pass +
        "&navigator=Netscape" +
        "&hostname=" + this.user.server +
        "&javascript=false" +
        "&post_back=false";
    this.ajax('http://' + this.user.server + '/login.aspx', 'POST', params);
};
/**
 * Retrieve all pages to be parsed and examined.
 *
 * @param string url
 *   When specified only request this url.
 */
AstroEmpires.AE.prototype.getData = function(url) {
    if (url) {
        // Only poll a single page for information. Normally if a previous
        // request was rejected do to invalid login, after sending
        // credentials a re-poll of the original request is required.
        this.ajax(url, 'GET');
    }
    else {
        // @todo transfer is asynchronus. Ensure we get language and skin first.
        this.ajax('http://' + this.user.server + '/account.aspx?view=display', 'GET');
        this.ajax('http://' + this.user.server + '/account.aspx', 'GET');
        this.ajax('http://' + this.user.server + '/board.aspx', 'GET');
    }
};
/**
 * Sets the user.language
 *
 * @param int language
 *   An AstroEmpires.Languages constant.
 *
 * @return bool
 *   true on success, false on failure to set.
 */
AstroEmpires.AE.prototype.setUserLanguage = function(language) {
    this.user.language = language;
    return true;
},
/**
 * Getes the user.language property value.
 *
 * @return mixed
 *   The value of the user.language property.
 */
AstroEmpires.AE.prototype.getUserLanguage = function(language) {
    return this.user.language;
};
/**
 * Sets the user.skin
 *
 * @param string skin
 *   Name of the skin.
 *
 * @return bool
 *   true on success, false on failure to set.
 */
AstroEmpires.AE.prototype.setUserSkin = function(skin) {
    this.user.skin = skin;
    return true;
};
/**
 * Getes the user.skin property value.
 *
 * @return mixed
 *   The value of the user.language property.
 */
AstroEmpires.AE.prototype.getUserSkin = function(skin) {
    return this.user.skin;
};


/**
 * @class AstroEmpires.Msg
 *
 * @brief Keeps track of messages, both private mail and guild messages.
 */
AstroEmpires.Msg = function() {
    Observable.call(this);
    // Hold all the messages.
    this.messages = {},
    // Individual message properties.
    this.id = null,
    this.message = null,
    this.playerName = null,
    this.playerId = null,
    this.time = null,
    this.read = null
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
        this.id = this.messages[msgId].id,
        this.message = this.messages[msgId].message,
        this.playerName = this.messages[msgId].playerName,
        this.playerId = this.messages[msgId].playerId,
        this.time = this.messages[msgId].time,
        this.read = this.messages[msgId].read
        return this;
    }
    return false;
}
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
        }
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
    for(index in this.messages) {
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
    for(index in this.messages) {
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
        for(index in this.messages) {
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
        for(index in this.messages) { 
            if ((this.messages[index].time <= this.time) && (index != this.id) && (!msg || (this.messages[index].time >= msg.time))) {
                msg = this.messages[index];
            }
        }
    }
    return (msg) ? this.get(msg.id) : false;
};
