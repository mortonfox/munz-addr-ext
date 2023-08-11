// jshint strict: true, esversion: 8

function init() {
  'use strict';

  // Check if we are on a munzee page.
  let loc = window.location.href;
  console.log(loc);
  if (!/munzee.com\/m\/\w+\/\d+/.test(loc)) return;

  let mappage = loc.replace(/(munzee.com\/m\/\w+\/\d+).*$/, '$1/map/');
  console.log(mappage);

  let iframe = document.createElement("iframe");
  // iframe.style.display = "none";
  iframe.src = mappage;
  document.body.appendChild(iframe);

  function waitForSite() {
    let targetelem = iframe.contentWindow.document.getElementById('munzee-holder');
    if (targetelem !== null) {
      clearInterval(waitForSiteTimer);
      console.log(targetelem);

      let coords = [];
      for (let node of targetelem.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          let str = node.textContent.trim();
          let m = str.match(/^(-?\d+\.\d+)$/);
          if (m) {
            coords.push(parseFloat(m[1]));
          }
        }
      }
      console.log(coords);

    }
  }
  // Wait for site to finish loading before inserting button.
  let waitForSiteTimer = setInterval(waitForSite, 100);

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

  addText(`${lat.toFixed(5)},${lon.toFixed(5)}`);

  function degmin(coord) {
    const deg = Math.trunc(coord);
    const min = Math.trunc((coord % 1) * 60 * 1000) / 1000;
    return `${deg} ${min.toFixed(3)}`;
  }

  addText(`${lat >= 0 ? 'N' : 'S'} ${degmin(Math.abs(lat))} ${lon >= 0 ? 'E' : 'W'} ${degmin(Math.abs(lon))}`);

  // Display message for 1 second and then remove it.
  function flashResult(color, message) {
    const status = document.getElementById('copy_status');
    status.style.color = color;
    status.textContent = message;
    setTimeout(() => { status.textContent = ''; }, 1000);
  }

  // Create a button that copies the addr string to the clipboard.
  function copyButton(addr) {
    const btn = document.createElement('button');
    btn.name = btn.id = 'copy_addr';
    btn.style.cssText = 'background-color: #fff; color: #E82A24; font-weight: 700; border: solid #E82A24; padding: 6px 10px; cursor: pointer';
    btn.appendChild(document.createTextNode('Copy Addr'));
    btn.addEventListener('mouseenter',
      () => {
        btn.style.color = '#fff';
        btn.style.backgroundColor = '#E82A24';
      }
    );
    btn.addEventListener('mouseleave',
      () => {
        btn.style.color = '#E82A24';
        btn.style.backgroundColor = '#fff';
      }
    );
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
    return btn;
  }

  // Get Bing Maps API key from local storage.
  function getKey() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('bingMapsKey', result => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result.bingMapsKey);
      });
    });
  }

  (async () => {
    try {
      const key = await getKey();
      const url = `https://dev.virtualearth.net/REST/v1/Locations/${latstr},${lonstr}?key=${key}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Status = ${resp.status} ${resp.statusText}`);

        const jsonobj = await resp.json();

        const addr = jsonobj.resourceSets[0].resources[0].name;
        if (addr === undefined) return;

        addText(addr);

        const span = document.createElement('span');
        span.appendChild(copyButton(addr));
        span.appendChild(document.createElement('br'));
        const status = document.createElement('span');
        status.id = status.name = 'copy_status';
        span.appendChild(status);
        addElem(span);
      }
      catch (err) {
        addText(`Bing Maps API fetch error: ${err.message}`);
      }
    }
    catch (err) {
      addText(`Failed to get Bing Maps API key from browser local storage: ${err.message}`);
    }
  })();
}

init();

// -- The End --
