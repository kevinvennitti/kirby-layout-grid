let layoutGridPlugin;

window.onload = function(){
  layoutGridPlugin = new LayoutGridPlugin({
    itemSelector: '.layout-grid-item',
    cols: 12,
    rows: 12,
  });
}
