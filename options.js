// Saves Bing Maps key to chrome.storage
function save_options() {
  let bing_maps_key = document.getElementById('bing_maps_key').value;
  chrome.storage.local.set({
    bingMapsKey: bing_maps_key
  }, () => {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
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
document.getElementById('save').addEventListener('click', save_options);
