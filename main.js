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

    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.log(`Fetch failed. xhr.status = ${xhr.status}`);
        return;
      }

      let obj = JSON.parse(xhr.responseText);

      let addr = obj.resourceSets[0].resources[0].name;
      if (addr === undefined) {
        return;
      }

      let addr_elem = document.createElement('div');
      addr_elem.setAttribute('align', 'center');
      addr_elem.appendChild(document.createTextNode(addr));
      loctext.parentNode.insertBefore(addr_elem, loctext);
    }

    xhr.send();
  });
}

init();

// -- The End --
