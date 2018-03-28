import React from 'react';

export function getFormattedCode(getCode) {
    return (
        <div className="code-container">
            <div>
                <h6>JavaScript</h6>
                <pre>
                    <code className="language-jsx">
                        {getCode()}
                    </code>
                </pre>
            </div>
        </div>
    );
}

/**
 * Highlights text that matches matchItem
 * Adapted from AngularUI Bootstrap Typeahead
 * See https://github.com/angular-ui/bootstrap/blob/master/src/typeahead/typeahead.js#L669
 */
export function highlight(matchItem, query) {
    function escapeRegexp(queryToEscape) {
        // Regex: capture the whole query string and replace it with the string that will be used to match
        // the results, for example if the capture is "a" the result will be \a
        return ('' + queryToEscape).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    //https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
    function createMarkup(html) {
        return { __html: html };
    };

    // Replaces the capture string with a the same string inside of a "<span>" tag
    if (query && matchItem) {
        var wrapped = ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<span class="search-text-highlight">$&</span>');

        return createMarkup(wrapped);
    }

    return createMarkup(matchItem);
}
