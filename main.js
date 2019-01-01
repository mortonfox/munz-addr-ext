function init() {
  let loctext = document.getElementById('locationtext');
  if (loctext !== null) {
    let lat = loctext.getAttribute('data-latitude');
    let lon = loctext.getAttribute('data-longitude');

    chrome.storage.local.get(['bingMapsKey'], result => {
      let key = result.bingMapsKey;

      let xhr = new XMLHttpRequest();
      xhr.open('GET', `https://dev.virtualearth.net/REST/v1/Locations/${lat},${lon}?key=${key}`, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          let obj = JSON.parse(xhr.responseText);

          let addr = obj.resourceSets[0].resources[0].name;
          if (addr !== undefined) {
            let addr_elem = document.createElement('div');
            addr_elem.setAttribute('align', 'center');
            addr_elem.appendChild(document.createTextNode(addr));
            loctext.parentNode.insertBefore(addr_elem, loctext);
          }
        }
      }
      xhr.send();
    });
  }
}

init();

// -- The End --
