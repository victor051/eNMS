/*
global
alertify: false
call: false
connectionParametersModal: false
createDevice: false
createLink: false
deleteAll: false
deviceAutomationModal: false
doc: false
map: false
partial: false
selectedObject: true
showModal: false
showTypeModal: false
switchLayer: false
*/

let viewMode = 'network';

/**
 * Display pools.
 */
function displayPools() { // eslint-disable-line no-unused-vars
  viewMode = 'site';
  
  deleteAll();
  call('/get_all/pool', function(pools) {
    for (let i = 0; i < pools.length; i++) {
      if (pools[i].device_longitude && pools[i].device_latitude) {
        createNode(pools[i], nodeType='pool')
      }
    }
  });
  $('.menu,#pool-filter,#network').hide();
  $('#map,.geo-menu,.rc-pool-menu').show();
  alertify.notify('Switch to Pool View');
}

/**
 * Display network.
 */
function displayNetwork() { // eslint-disable-line no-unused-vars
  viewMode = 'network';
  $('.menu,#network').hide();
  $('#pool-filter').change();
  $('#pool-filter').show();
  $('#map,.geo-menu').show();
}

/**
 * Enter pool.
 */
function enterPool(poolId) { // eslint-disable-line no-unused-vars
  viewMode = 'insite';
  $('#map,.menu').hide();
  $('#network,.insite-menu,rc-device-menu,rc-link-menu').show();
  call(`/inventory/pool_objects/${poolId}`, function(objects) {
    displayPool(objects.devices, objects.links);
  });
}

$('#pool-filter').on('change', function() {
  call(`/inventory/pool_objects/${this.value}`, function(objects) {
    deleteAll();
    objects.devices.map((d) => createNode(d, nodeType='device'));
    objects.links.map(createLink);
  });
});

const action = {
  'Export to Google Earth': partial(showModal, 'google-earth'),
  'Open Street Map': partial(switchLayer, 'osm'),
  'Google Maps': partial(switchLayer, 'gm'),
  'NASA': partial(switchLayer, 'nasa'),
  'Device properties': (d) => showTypeModal('device', d),
  'Link properties': (l) => showTypeModal('link', l),
  'Pool properties': (p) => showTypeModal('pool', p),
  'Connect': connectionParametersModal,
  'Automation': deviceAutomationModal,
  'Display pools': displayPools,
  'Display network': displayNetwork,
  'Enter pool': enterPool,
};

map.on('click', function(e) {
  selectedObject = null;
});

map.on('contextmenu', function() {
  if (!selectedObject) {
    $('.menu').hide();
    $(`.global-menu,.${viewMode}-menu`).show();
  }
});

$('.dropdown-submenu a.menu-submenu').on('click', function(e) {
  $(this).next('ul').toggle();
  e.stopPropagation();
  e.preventDefault();
});

$('body').contextMenu({
  menuSelector: '#contextMenu',
  menuSelected: function(invokedOn, selectedMenu) {
    const row = selectedMenu.text();
    action[row](selectedObject);
    selectedObject = null;
  },
});

$('#network').contextMenu({
  menuSelector: '#contextMenu',
  menuSelected: function(invokedOn, selectedMenu) {
    const row = selectedMenu.text();
    action[row](selected);
  },
});

(function() {
  doc('https://enms.readthedocs.io/en/latest/views/geographical_view.html');
  $('#network').hide();
  $('#pool-filter').change();
})();