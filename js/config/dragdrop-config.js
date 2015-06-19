/* jQuery UI Sortable/Droppable configuration */

config.jqueryui = {
  sortable: {
    handle: '.title',
    items: '> li'
  },
  droppable: {
    hoverClass: 'hovered'
  },
  dropTarget: $('#delete')
};
