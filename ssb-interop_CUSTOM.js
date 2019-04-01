/*----- CUSTOM CSS FOR SLACK -----*/
window.toggleDarkMode = function (darkMode) {
  // Get the webviews
  let webviews = document.querySelectorAll(".TeamView webview");

  if (darkMode) {
    // Fetch our CSS in parallel ahead of time
    const cssPath = 'https://raw.githubusercontent.com/jokklan/custom-slack-theme/master/custom.css';
    let cssPromise = fetch(cssPath).then(response => response.text());

    // Insert a style tag into the wrapper view
    cssPromise.then(css => {
      let s = document.createElement('style');
      s.id = 'slack-custom-css-main';
      s.type = 'text/css';
      s.innerHTML = css;
      document.head.appendChild(s);
    });

    // Wait for each webview to load
    webviews.forEach(webview => {
      webview.addEventListener('ipc-message', message => {
        if (message.channel == 'didFinishLoading')
          // Finally add the CSS into the webview
          cssPromise.then(css => {
            let script = `
                      let s = document.createElement('style');
                      s.type = 'text/css';
                      s.id = 'slack-custom-css';
                      s.innerHTML = \`${css}\`;
                      document.head.appendChild(s);
                      `
            webview.executeJavaScript(script);
          })
      });
    });
  } else {
    // Remove the style tag from the wrapper view
    let s = document.getElementById('slack-custom-css-main');
    document.head.removeChild(s);

    webviews.forEach(webview => {
      // Remove the styling again
      var script = `
                let s = document.getElementById('slack-custom-css');
                document.head.removeChild(s);
                `
      webview.executeJavaScript(script);
    })
  }
}

// First make sure the wrapper app is loaded
document.addEventListener("DOMContentLoaded", function () {
  const { remote: { systemPreferences } } = require('electron');

  window.toggleDarkMode(systemPreferences.isDarkMode());

  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    function theThemeHasChanged() {
      window.toggleDarkMode(systemPreferences.isDarkMode());
    }
  )
});
