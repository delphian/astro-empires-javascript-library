
/**
 * @file
 * Communicate with astro empires web site.
 *
 * Astro Empires object will take care of requesting data, parsing the
 * response and storing the data.
 *
 * @author Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 0.1
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
    },
    AE: function(server, email, pass) {
        Observable.call(this);
        // User credentials.
        this.user = {
            server: server,
            email: email,
            pass: pass,
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
        // Add our message types.
        this.typeAdd('get_credits');
    }
};
AstroEmpires.AE.prototype = Observable.prototype;
jQuery.extend(AstroEmpires.AE.prototype, {
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
    ajax: function(url, type, params) {
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
    },
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
    processData: function (url, data) {
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
    },
    /**
     * Relogin to the website.
     */
    login: function() {
        var params = "email=" + this.user.email +
            "&pass=" + this.user.pass +
            "&navigator=Netscape" +
            "&hostname=" + this.user.server +
            "&javascript=false" +
            "&post_back=false";
        this.ajax('http://' + this.user.server + '/login.aspx', 'POST', params);
    },
    /**
     * Retrieve all pages to be parsed and examined.
     *
     * @param string url
     *   When specified only request this url.
     */
    getData: function(url) {
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
    },
    /**
     * Sets the user.language
     *
     * @param int language
     *   An AstroEmpires.Languages constant.
     *
     * @return bool
     *   true on success, false on failure to set.
     */
    setUserLanguage: function(language) {
        this.user.language = language;
        return true;
    },
    /**
     * Getes the user.language property value.
     *
     * @return mixed
     *   The value of the user.language property.
     */
    getUserLanguage: function(language) {
        return this.user.language;
    },
    /**
     * Sets the user.skin
     *
     * @param string skin
     *   Name of the skin.
     *
     * @return bool
     *   true on success, false on failure to set.
     */
    setUserSkin: function(skin) {
        this.user.skin = skin;
        return true;
    },
    /**
     * Getes the user.skin property value.
     *
     * @return mixed
     *   The value of the user.language property.
     */
    getUserSkin: function(skin) {
        return this.user.skin;
    }
});
