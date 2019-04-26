// jshint strict: true, esversion: 8

function init() {
  'use strict';

  const loctext = document.getElementById('locationtext');
  if (loctext === null) {
    return;
  }

  const latstr = loctext.getAttribute('data-latitude');
  const lonstr = loctext.getAttribute('data-longitude');

  const lat = parseFloat(latstr);
  const lon = parseFloat(lonstr);

  function truncFloat(f) {
    return Math.trunc(f * 100000) / 100000;
  }

  function addElem(str) {
    const elem = document.createElement('div');
    elem.style.textAlign = 'center';
    elem.textContent = str;
    loctext.parentNode.insertBefore(elem, loctext);
  }

  const dec_coords = `${truncFloat(lat)},${truncFloat(lon)}`;
  addElem(dec_coords);

  function degmin(coord) {
    const deg = Math.trunc(coord);
    const min = Math.trunc((coord % 1) * 60 * 1000) / 1000;
    return `${deg} ${min}`;
  }

  const degmin_coords = `${lat >= 0 ? 'N' : 'S'} ${degmin(Math.abs(lat))} ${lon >= 0 ? 'E' : 'W'} ${degmin(Math.abs(lon))}`;
  addElem(degmin_coords);

  chrome.storage.local.get(['bingMapsKey'], async result => {
    const key = result.bingMapsKey;
    const url = `https://dev.virtualearth.net/REST/v1/Locations/${latstr},${lonstr}?key=${key}`;

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

      addElem(addr);
    }
    catch (err) {
      console.log(`Fetch error: ${err.message}`);
    }
  });
}

init();

// -- The End --
