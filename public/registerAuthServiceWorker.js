if ('serviceWorker' in navigator) {
  // window.addEventListener('load', () => {
    navigator.serviceWorker.register('/authServiceWorker.js')
      .then(registration => {
        console.log('Registered auth service worker')

        // Need to reload the page so the current page can be loaded again with the authentication headers
        if (!navigator.serviceWorker.controller) {
          window.location.reload()
        }
      })
      .catch(error => {
        console.error('Failed to register auth service worker: ', error)
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // When the controller changes, reload the page
        window.location.reload();
      });
  // });
}