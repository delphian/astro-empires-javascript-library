
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

var AEObject = function(server, email, pass) {
    Observable.call(this);
    //this.msg = new Observable();
    // User credentials.
    this.user = {
        server: server,
        email: email,
        pass: pass
    };
    // Statistics to be retrieved from AE website.
    this.aeStats = {
        // credits: options['credits'],
        // income: options['income'],
        // fleetSize: options['fleetSize'],
        // technology: options['technology'],
        // level: options['level'],
        // rank: options['rank'],
    };
    // Add our message types.
    this.typeAdd('get_credits');
};
AEObject.prototype = Observable.prototype;
jQuery.extend(AEObject.prototype, {
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
    ajaxRequest: function(url, type, params) {
        var xhr = new XMLHttpRequest();
        thisAEO = this;
        xhr.onreadystatechange = function () {
            if (this.readyState == this.DONE) {
                // Everything went 'ok'.
                if (this.status == 200) {
                    // Check if we have been asked to login.
                    if (this.responseText.match(/<title>Login.*?<\/title>/i)) {
                        // Login.
                        thisAEO.aeLogin();
                        // Now try getting data again.
                        thisAEO.aeGetData();
                    }
                    // We have not been asked to login, this should be the
                    // requested page.
                    else {
                        thisAEO.aeProcessResults(url, this.responseText);
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
    aeProcessResults: function (url, response) {
        if (credits = this.publish(response, 'get_credits', this)) {
            // Just accept the result from any random listener.
            this.aeStats.credits = credits[Object.keys(credits)[0]];
        }
        if ((income = /<td>[\s]*<b>Empire Income<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig.exec(response)) && (income.length > 0)) {
            this.aeStats.income = income[1];
        }
        if ((fleetSize = /<td>[\s]*<b>Fleet Size<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig.exec(response)) && (fleetSize.length > 0)) {
            this.aeStats.fleetSize = fleetSize[1];
        }
        if ((technology = /<td>[\s]*<b>Technology<\/b>[\s]*<\/td>[\s]*<td>([0-9,]+)/ig.exec(response)) && (technology.length > 0)) {
            this.aeStats.technology = technology[1];
        }
        if ((level = /<td>[\s]*<b>Level<\/b>[\s]*<\/td>[\s]*<td>([0-9\.]+)[^(]+\([^0-9]+([0-9]+)\)/ig.exec(response)) && (level.length > 0)) {
            this.aeStats.level = level[1];
            this.aeStats.rank = level[2];
        }
    },
    /**
     * Relogin to the website.
     */
    aeLogin: function() {
        var params = "email=" + this.user.email +
            "&pass=" + this.user.pass +
            "&navigator=Netscape" +
            "&hostname=" + this.user.server +
            "&javascript=false" +
            "&post_back=false";
        this.ajaxRequest('http://' + this.user.server + '/login.aspx', 'POST', params);
    },
    /**
     * Retrieve all pages to be parsed and examined.
     */
    aeGetData: function() {
        this.ajaxRequest('http://' + this.user.server + '/account.aspx', 'GET');
    }
});
