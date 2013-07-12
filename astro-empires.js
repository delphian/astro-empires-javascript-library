/**
 * @file astro-empires.js
 * @author  Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 0.2.0
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Static object and namespace for all astro empires functionality.
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
