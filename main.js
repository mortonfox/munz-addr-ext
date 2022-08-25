// jshint strict: true, esversion: 8

function init() {
  'use strict';

  const loctext = document.getElementById('locationtext');
  if (loctext === null) return;

  const latstr = loctext.getAttribute('data-latitude');
  const lonstr = loctext.getAttribute('data-longitude');

  const lat = parseFloat(latstr);
  const lon = parseFloat(lonstr);

  function addElem(elem) {
    const el = document.createElement('div');
    el.style.textAlign = 'center';
    el.appendChild(elem);
    loctext.parentNode.insertBefore(el, loctext);
  }

  function addText(str) {
    addElem(document.createTextNode(str));
  }

  function flashResult(color, message) {
    const status = document.getElementById('copy_status');
    status.style.color = color;
    status.textContent = message;
    setTimeout(() => { status.textContent = ''; }, 1000);
  }

  addText(`${lat.toFixed(5)},${lon.toFixed(5)}`);

  function degmin(coord) {
    const deg = Math.trunc(coord);
    const min = Math.trunc((coord % 1) * 60 * 1000) / 1000;
    return `${deg} ${min.toFixed(3)}`;
  }

  addText(`${lat >= 0 ? 'N' : 'S'} ${degmin(Math.abs(lat))} ${lon >= 0 ? 'E' : 'W'} ${degmin(Math.abs(lon))}`);

  chrome.storage.local.get(['bingMapsKey'], async result => {
    const key = result.bingMapsKey;
    const url = `https://dev.virtualearth.net/REST/v1/Locations/${latstr},${lonstr}?key=${key}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Status = ${resp.status} ${resp.statusText}`);

      const jsonobj = await resp.json();

      const addr = jsonobj.resourceSets[0].resources[0].name;
      if (addr === undefined) return;

      addText(addr);

      let btn = document.createElement('button');
      btn.name = btn.id = 'copy_addr';
      btn.style.cssText = 'background-color: #E82A24; color: #fff; font-weight: 700; border: none; padding: 6px 10px; cursor: pointer';
      btn.appendChild(document.createTextNode('Copy Addr'));
      btn.addEventListener('click',
        async () => {
          try {
            await navigator.clipboard.writeText(addr);
            flashResult('green', 'Copied!');
          }
          catch (err) {
            flashResult('red', `Copy failed! ${err.message}`);
          }
        }
      );
      let span = document.createElement('span');
      span.appendChild(btn);
      span.appendChild(document.createElement('br'));
      let status = document.createElement('span');
      status.id = status.name = 'copy_status';
      span.appendChild(status);
      addElem(span);
    }
    catch (err) {
      addText(`Bing Maps API fetch error: ${err.message}`);
    }
  });
}

init();

// -- The End --
