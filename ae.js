/**
 * @file ae.js
 * @author Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
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
    this.players = new AstroEmpires.Player(this);
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
 * @param string data
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
        throw 'url is not of the correct pattern: ' + url;
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
        // Account settingts: Skin and language.
        this.ajax('http://' + this.user.server + '/account.aspx?view=display', 'GET');
        // Account settings:
        this.ajax('http://' + this.user.server + '/account.aspx', 'GET');
        // Guild messages: General.
        this.ajax('http://' + this.user.server + '/board.aspx', 'GET');
        // Private messages: Inbox.
        this.ajax('http://' + this.user.server + '/messages.aspx', 'GET');
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
