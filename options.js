function flash_result(color, message) {
  const status = document.getElementById('status');
  status.style.color = color;
  status.textContent = message;
  setTimeout(() => { status.textContent = ''; }, 1000);
}

// Saves Bing Maps key to chrome.storage
function save_options(e) {
  const bing_maps_key = document.getElementById('bing_maps_key').value;

  const url = `https://dev.virtualearth.net/REST/v1/Locations/0,0?key=${bing_maps_key}`;

  (async () => {
    try {
      // Test the key.
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Status = ${resp.status} ${resp.statusText}`);
      }

      // Key was accepted by Bing Maps.
      chrome.storage.local.set({
        bingMapsKey: bing_maps_key
      }, () => {
        // Update status to let user know options were saved.
        flash_result('green', 'Options saved.');
      });
    }
    catch (err) {
      flash_result('red', `Invalid key or other Bing Maps error. ${err.message}`);
    }
  })();

  e.preventDefault();
}

// Restores Bing Maps key from chrome.storage
function restore_options() {
  chrome.storage.local.get({
    bingMapsKey: '' // default is an empty string
  }, items => {
    document.getElementById('bing_maps_key').value = items.bingMapsKey;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('munz_addr_options').addEventListener('submit', save_options);

// -- The End --
