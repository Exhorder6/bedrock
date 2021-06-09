/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var timeout;
    var requestComplete = false;

    function beginFirefoxDownload() {
        var directDownloadLink = document.getElementById('direct-download-link');
        var downloadURL;

        clearTimeout(timeout);

        if (requestComplete) {
            return;
        }
        requestComplete = true;

        // Only auto-start the download if a supported platform is detected.
        if (Mozilla.DownloadThanks.shouldAutoDownload(window.site.platform) && typeof Mozilla.Utils !== 'undefined') {
            downloadURL = Mozilla.DownloadThanks.getDownloadURL(window.site);

            if (downloadURL) {
                // Pull download link from the download button and add to the 'Try downloading again' link.
                // Make sure the 'Try downloading again' link is well formatted! (issue 9615)
                if (directDownloadLink && directDownloadLink.href) {
                    directDownloadLink.href = downloadURL;
                }

                // Start the platform-detected download a second after DOM ready event.
                // We don't rely on the window load event as we have third-party tracking pixels.
                Mozilla.Utils.onDocumentReady(function() {
                    setTimeout(function() {
                        window.location.href = downloadURL;
                    }, 1000);
                });
            }
        }
    }

    if (typeof Mozilla.StubAttribution !== 'undefined' &&
        Mozilla.StubAttribution.meetsRequirements() &&
        !Mozilla.StubAttribution.hasCookie()) {

        // Wait for GA to load so that we can pass along visit ID.
        Mozilla.StubAttribution.waitForGoogleAnalytics(function() {
            var data = Mozilla.StubAttribution.getAttributionData();

            if (data && Mozilla.StubAttribution.withinAttributionRate()) {
                Mozilla.StubAttribution.successCallback = Mozilla.StubAttribution.timeoutCallback = beginFirefoxDownload();
                timeout = setTimeout(beginFirefoxDownload, 5000);
                Mozilla.StubAttribution.requestAuthentication(data);
            } else {
                beginFirefoxDownload();
            }
        });
    } else {
        beginFirefoxDownload();
    }


    // Bug 1354334 - add a hint for test automation that page has loaded.
    document.getElementsByTagName('html')[0].classList.add('download-ready');

})();
