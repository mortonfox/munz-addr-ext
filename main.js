function init() {
  const loctext = document.getElementById('locationtext');
  if (loctext === null) {
    return;
  }

  const lat = loctext.getAttribute('data-latitude');
  const lon = loctext.getAttribute('data-longitude');

  chrome.storage.local.get(['bingMapsKey'], async result => {
    const key = result.bingMapsKey;
    const url = `https://dev.virtualearth.net/REST/v1/Locations/${lat},${lon}?key=${key}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Status = ${resp.status} ${resp.statusText}`);
      }

      const jsonobj = await resp.json();

      const addr = jsonobj.resourceSets[0].resources[0].name;
      if (addr === undefined) {
        return;
      }

      const addr_elem = document.createElement('div');
      addr_elem.style.textAlign = 'center';
      addr_elem.textContent = addr;
      loctext.parentNode.insertBefore(addr_elem, loctext);
    }
    catch (err) {
      console.log(`Fetch error: ${err.message}`);
    }
  });
}

init();

// -- The End --
