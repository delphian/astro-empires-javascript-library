
/**
 * @file
 * @author  Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * @version 0.1
 *
 * @copyright Copyright (c) 2013 Bryan Hazelbaker <bryan.hazelbaker@gmail.com>
 * Released under the MIT license. Read the entire license located in the
 * project root or at http://opensource.org/licenses/mit-license.php
 *
 * @brief Translate words into english.
 *
 * @details The skin parsers may need access to language specific words.
 *
 * @see https://github.com/delphian/astro-empires-javascript-library
 */

AstroEmpires.Language.english = function(word) {
    switch(word) {
        case 'credits':
            return 'credits';
            break;
    }
};
