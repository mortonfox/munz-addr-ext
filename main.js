function init() {
  let loctext = document.getElementById('locationtext');
  if (loctext === null) {
    return;
  }

  let lat = loctext.getAttribute('data-latitude');
  let lon = loctext.getAttribute('data-longitude');

  chrome.storage.local.get(['bingMapsKey'], result => {
    let key = result.bingMapsKey;
    let url = `https://dev.virtualearth.net/REST/v1/Locations/${lat},${lon}?key=${key}`;

    fetch(url)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Status = ${resp.status} ${resp.statusText}`);
        }
        return resp.json();
      })
      .then(jsonobj => {
        let addr = jsonobj.resourceSets[0].resources[0].name;
        if (addr === undefined) {
          return;
        }

        let addr_elem = document.createElement('div');
        addr_elem.style.textAlign = 'center';
        addr_elem.textContent = addr;
        loctext.parentNode.insertBefore(addr_elem, loctext);
      })
      .catch(err => {
        console.log(`Fetch error: ${err.message}`);
      });
  });
}

init();

// -- The End --
