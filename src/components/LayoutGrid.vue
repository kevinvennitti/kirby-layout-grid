<template>
  <div id="layout-grid-frame" class="layout-grid-container layout-grid" @mousedown="preventSelect">
<!--
    <k-form
     ref="form"
     :autofocus="true"
     :fields="fieldset.tabs.content.fields"
     :value="$helper.clone(content)"
     @input="$emit('update', $event)"

   />
   -->
    <div
    v-for="itemstructure in content.layoutgridstructure"
    class="layout-grid-item"
    @mousedown="preventSelect"
    @mouseup="savePosition"
    :style="{ gridColumnStart: itemstructure.grid_column_start, gridRowStart: itemstructure.grid_row_start,  gridColumnEnd: 'span '+itemstructure.grid_column_end,  gridRowEnd: 'span '+itemstructure.grid_row_end }">
      <!-- <div style="color:green;font-size:10px;">{{ itemstructure }}</div> -->


      <k-blocks
        ref="blocks"
        :value="itemstructure.layoutgridblocks"
        :fieldsets="field('layoutgridblocksforfieldsets').fieldsets"
        :endpoints="endpoints"
        @input="$emit('update', $event)"
        group="layout"
      />
      <div class="layout-grid-item-drag-handle">:::</div>
      <div class="layout-grid-item-resize-handle layout-grid-item-resize-handle-w" data-resize="w"></div>
      <div class="layout-grid-item-resize-handle layout-grid-item-resize-handle-e" data-resize="e"></div>
      <div class="layout-grid-item-resize-handle layout-grid-item-resize-handle-n" data-resize="n"></div>
      <div class="layout-grid-item-resize-handle layout-grid-item-resize-handle-s" data-resize="s"></div>


    </div>
  </div>
</template>

<script>
  //  @dblclick.native.stop
export default {

  props: {
    blocks: Array,
    /*
    endpoints: {
      field: "pages/page-test/fields/layoutgridblocksforfieldsets",
      model: "pages/page-test",
      section: "pages/page-test/sections/main-col-0-fields"
    },
    */
    endpoints: Object,
  //  fieldsets: Object,
    disabled: Boolean,
  },

  data() {
    return {
      gridarea: "1 / 1 / span 3 / span 3",
      color: 'red',
    }
  },

  methods: {
    /*
    gridArea() {
      return this.grid_column_start+" / "+this.grid_row_start+" / "+this.grid_column_end+" / "+this.grid_row_end;
    },
    */
    preventSelect (event) {
      if (event.detail > 1) {
        event.preventDefault()
      }
    },
    savePosition(event){
      console.log('save position');
      console.log(this.$el.children);
      for (let i = 0; i < this.$el.children.length; i++) {
        let group = this.$el.children[i];
        console.log(group.dataset.gridColumnStart);
      }
    },
    debug()  {
      console.log('this', this);
    }
/*
    endpoints() {
      console.log({
        field: this.endpoints.field + "+" + name,
        section: this.endpoints.section,
        model: this.endpoints.model
      });

      return {
        field: this.endpoints.field + "+" + name,
        section: this.endpoints.section,
        model: this.endpoints.model
      };
    },
*/
},
/*
computed: {
  fieldsets() {
    return {
      text: {
        disabled: false,
        icon: "text",
        label: null,
        name: "Text",
        preview: "text",
        tabs: {
          content: {
            fields: {
              text: {
                autofocus: false,
                disabled: false,
                endpoints:{
                  field: "pages/page-test/fields/textcontent/fieldsets/text/fields/text",
                  model: "pages/page-test",
                  section: "pages/page-test/sections/main-col-0-fields"
                },
                inline: false,
                label: "Text",
                marks: true,
                name: "text",
                nodes: false,
                placeholder: "Text …",
                required: false,
                saveable: true,
                section: undefined,
                signature: "bf6c20f68b82a4526c67ff3b775056dc",
                strict: true,
                translate: true,
                type: "writer",
                value: "",
                width: "1/1"
              }
            }
          }
        },
        translate: true,
        type: "text",
        unset: false,
        wysiwyg: true
      }
    };
  },
},*/

mounted() {
  this.debug()
}
};

let layoutGridPlugin;

window.onload = function(){
  setTimeout(function(){
    layoutGridPlugin = new LayoutGridPlugin({
      itemSelector: '.layout-grid-item',
      cols: 12,
      rows: 12,
    });
  },2000); // TODO
}


class LayoutGridPlugin {
  constructor(options) {
    this.isDragging = false;
    this.isResizing = false;

    this.resizeDirection = null;

    this.grid = {
      DOM: document.getElementById('layout-grid-frame'),
      nbCols: 12,
      nbRows: 12,
      colsStartsX: [],
      colsEndsX: [],
      rowsStartsY: [],
      rowsEndsY: [],
    };

    this.mouse = {
      origin: {
        x: null,
        y: null
      },
      current: {
        x: null,
        y: null
      },
      delta: {
        x: null,
        y: null
      }
    };

    this.item = {
      DOM: null,
      origin: {
        x: null,
        y: null
      },
      columnStart: null,
      columnSpan: null,
      rowStart: null,
      rowSpan: null
    };

    this.itemBeforeTransformations = null;

    this.init(options);
  }

  init(options) {
    const defaults = {
      itemSelector: '.layout-grid-item',
      cols: 12,
      rows: 12,
      gap: 16
    };

    let params = Object.assign({}, defaults, options);

    this.params = {};
    this.params.itemSelector = params.itemSelector;

    this.grid.nbCols = params.cols;
    this.grid.nbRows = params.rows;
    this.grid.gap = params.gap;

    this.getAllLimits();
    this.initEvents();
  }

  getAllLimits() {
    let _this = this;

    this.grid.colsStartsX = [];
    this.grid.colsEndsX = [];
    this.grid.rowsStartsY = [];
    this.grid.rowsEndsY = [];

    // Get all cols lines

    let colsWidths = this.getStyleProperty(this.grid.DOM, 'grid-template-columns');
    let columnGap = parseInt(this.getStyleProperty(this.grid.DOM, 'column-gap'));

    this.grid.colsStartsX.push(0);
    this.grid.colsEndsX.push(0);

    let colIndex = 1;

    colsWidths.split(' ').forEach(function(colWidth) {
      colWidth = parseInt(colWidth);
      _this.grid.colsStartsX.push((colWidth + columnGap) * colIndex);
      _this.grid.colsEndsX.push((colWidth * colIndex) + (columnGap * (colIndex - 1)));
      colIndex++;
    })

    this.grid.colsStartsX.splice(-1, 1);
    this.grid.colsEndsX.shift();

    /* --- */

    // Get all rows lines

    let rowsHeights = this.getStyleProperty(this.grid.DOM, 'grid-template-rows');
    let rowGap = parseInt(this.getStyleProperty(this.grid.DOM, 'row-gap'));

    this.grid.rowsStartsY.push(0);
    this.grid.rowsEndsY.push(0);

    let rowIndex = 1;

    rowsHeights.split(' ').forEach(function(rowHeight) {
      rowHeight = parseInt(rowHeight);
      _this.grid.rowsStartsY.push((rowHeight + rowGap) * rowIndex);
      _this.grid.rowsEndsY.push((rowHeight * rowIndex) + (rowGap * (rowIndex - 1)));
      rowIndex++;
    })

    this.grid.rowsStartsY.splice(-1, 1);
    this.grid.rowsEndsY.shift();
  }

  triggerDragItem(item, e) {
    this.setMouseOrigin(e);
    this.updateMouse(e);

    this.setItem(item);
    this.setDragOn();
  }

  triggerMouseMove(e) {
    this.updateMouse(e);

    if (this.isDragging) {
      this.checkDrag();
    }

    if (this.isResizing) {
      this.checkResize();
    }
  }

  checkDrag() {
    var _this = this;

    this.getItemStyles();

    let dragPositionX = this.item.origin.x - this.mouse.delta.x;
    let dragPositionY = this.item.origin.y - this.mouse.delta.y;

    // check x position
    this.grid.colsStartsX.forEach(function(colStartX, i) {
      if (i <= _this.grid.nbCols - _this.item.columnSpan) {
        if (dragPositionX >= colStartX - 2
         && dragPositionX < _this.grid.colsStartsX[i+1] - 2) { // tolerance: 2 pixels
          _this.item.columnStart = i + 1;
          _this.item.DOM.style.gridColumnStart = _this.item.columnStart;
        }
      }
    });

    // check y position
    this.grid.rowsStartsY.forEach(function(rowStartY, i) {
      if (dragPositionY >= rowStartY - 2
       && dragPositionY < _this.grid.rowsStartsY[i+1] - 2) { // tolerance: 2 pixels
        _this.item.rowStart = i + 1;
        _this.item.DOM.style.gridRowStart = _this.item.rowStart;
      }
    });

    this.getItemStyles();
  }

  checkResize() {
    var _this = this;

    this.getItemStyles();

    let dragPositionX = this.item.origin.x - this.mouse.delta.x;
    let dragPositionY = this.item.origin.y - this.mouse.delta.y;

    if (this.resizeDirection == 'e') {
      // check x position to east
      this.grid.colsEndsX.every(function(colEndX, i) {
        if (_this.mouse.current.x < (colEndX + _this.grid.gap)
          && i + 2 > _this.item.columnStart) {
          _this.item.columnSpan = i + 2 - _this.item.columnStart;
          _this.item.DOM.style.gridColumnEnd = 'span ' + _this.item.columnSpan;
          return false;
        } else {
          return true;
        }
      });
    }

    if (this.resizeDirection == 'w') {
      // check x position to west
      this.grid.colsEndsX.every(function(colEndX, i) {
        if (_this.mouse.current.x < colEndX) {
          _this.item.columnStart = Math.min(i + 1, _this.itemBeforeTransformations.columnSpan + _this.itemBeforeTransformations.columnStart - 1);
          _this.item.DOM.style.gridColumnStart = _this.item.columnStart;

          _this.item.columnSpan = _this.itemBeforeTransformations.columnSpan + (_this.itemBeforeTransformations.columnStart - _this.item.columnStart);
          _this.item.DOM.style.gridColumnEnd = 'span ' + _this.item.columnSpan;

          return false;
        } else {
          return true;
        }
      });
    }

    if (this.resizeDirection == 's') {
      // check y position to south
      this.grid.rowsEndsY.every(function(rowEndY, i) {
        if (_this.mouse.current.y <= rowEndY) {
          _this.item.rowSpan = i + 1 - _this.item.rowStart;
          _this.item.DOM.style.gridRowEnd = 'span ' + _this.item.rowSpan;
          return false;
        } else {
          return true;
        }
      });
    }

    if (this.resizeDirection == 'n') {
      // check y position to north
      this.grid.rowsEndsY.every(function(rowEndY, i) {
        if (_this.mouse.current.y < rowEndY) {
          _this.item.rowStart = Math.min(i + 1, _this.itemBeforeTransformations.rowSpan + _this.itemBeforeTransformations.rowStart - 1);
          _this.item.DOM.style.gridRowStart = _this.item.rowStart;

          _this.item.rowSpan = _this.itemBeforeTransformations.rowSpan + (_this.itemBeforeTransformations.rowStart - _this.item.rowStart);
          _this.item.DOM.style.gridRowEnd = 'span ' + _this.item.rowSpan;

          return false;
        } else {
          return true;
        }
      });
    }

    this.getItemStyles();
  }

  triggerMouseUp(e) {
    if (this.isDragging) {
      this.setDragOff();
    }

    if (this.isResizing) {
      this.setResizeOff();
    }
  }

  setDragOn() {
    this.isDragging = true;
  }

  setDragOff() {
    this.resetMouse();
    this.unsetItem();
    this.isDragging = false;
  }

  setResizeOn(resizeDirection) {
    this.isResizing = true;
    this.resizeDirection = resizeDirection;
    this.itemBeforeTransformations = JSON.parse(JSON.stringify(this.item));
  }

  setResizeOff() {
    this.resetMouse();
    this.unsetItem();
    this.isResizing = false;
    this.resizeDirection = null;
  }

  setItem(item) {
    this.item.DOM = item;
    this.item.origin.x = this.item.DOM.getBoundingClientRect().left - this.grid.DOM.getBoundingClientRect().left;
    this.item.origin.y = this.item.DOM.getBoundingClientRect().top - this.grid.DOM.getBoundingClientRect().top;

    this.getItemStyles();
  }

  getItemStyles() {
    this.item.columnStart = parseInt(this.getStyleProperty(this.item.DOM, 'grid-column-start'));
    this.item.columnSpan = parseInt(this.getStyleProperty(this.item.DOM, 'grid-column-end').replace('span ',''));
    this.item.rowStart = parseInt(this.getStyleProperty(this.item.DOM, 'grid-row-start'));
    this.item.rowSpan = parseInt(this.getStyleProperty(this.item.DOM, 'grid-row-end').replace('span ',''));

    this.item.DOM.setAttribute('data-grid-column-start', this.item.columnStart);
  }

  unsetItem() {
    this.item.DOM = null;
  }

  updateMouse(e) {
    this.mouse.current.x = e.pageX - this.grid.DOM.getBoundingClientRect().left;
    this.mouse.current.y = e.pageY - this.grid.DOM.getBoundingClientRect().top;

    this.mouse.delta.x = this.mouse.origin.x - this.mouse.current.x;
    this.mouse.delta.y = this.mouse.origin.y - this.mouse.current.y;
  }

  setMouseOrigin(e) {
    this.mouse.origin.x = e.pageX - this.grid.DOM.getBoundingClientRect().left;
    this.mouse.origin.y = e.pageY - this.grid.DOM.getBoundingClientRect().top;
  }

  resetMouse() {
    this.mouse.origin.x = null;
    this.mouse.origin.y = null;
    this.mouse.current.x = null;
    this.mouse.current.y = null;
    this.mouse.delta.x = null;
    this.mouse.delta.y = null;
  }

  triggerResizeItem(item, e, resizeDirection) {
    this.setMouseOrigin(e);
    this.updateMouse(e);

    this.setItem(item);
    this.setResizeOn(resizeDirection);
  }

  getStyleProperty(dom, property) {
    return window.getComputedStyle(dom, null).getPropertyValue(property);
  }

  initEvents() {
    var _this = this;

    let layoutGridItems = document.querySelectorAll(this.params.itemSelector);

    layoutGridItems.forEach(layoutGridItem => {
      var _layoutGridItem = layoutGridItem;

      layoutGridItem.querySelectorAll('.layout-grid-item-drag-handle').forEach(layoutGridItemDragHandle => {
        layoutGridItemDragHandle.addEventListener('mousedown', function(e) {
          _this.triggerDragItem(_layoutGridItem, e);
        });
      });

      layoutGridItem.querySelectorAll('.layout-grid-item-resize-handle').forEach(layoutGridItemDragHandle => {
        layoutGridItemDragHandle.addEventListener('mousedown', function(e) {
          _this.triggerResizeItem(_layoutGridItem, e, this.getAttribute('data-resize'));
        });
      });
    });

    document.addEventListener('mousemove', function(e){
      _this.triggerMouseMove(e);
    });

    document.addEventListener('mouseup', function(e){
      _this.triggerMouseUp(e);
    });

    window.addEventListener('resize', function(e){
      _this.updateMouse(e);
      _this.getAllLimits();
    });
  }
}

</script>

<style type="text/css">
  /*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}main{display:block}h1{font-size:2em;margin:.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}template{display:none}[hidden]{display:none}

  #layout-grid-container {
    margin:0 auto;
    position:relative;
  }

  .layout-grid {
    width:100%;
    display: grid;
    grid-auto-columns: 50px;
    grid-auto-rows: 50px;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(120, 50px);
    gap: 16px;
  }

  .layout-grid-item {
    position:relative;
    border:solid 2px blue;
    grid-area: 2 / 2 / span 3 / span 6;
  }

  .layout-grid-item-resize-handle {
    position:absolute;
    background:rgba(0,255,0,.8);
    user-select: none;
  }

  .layout-grid-item-resize-handle-e,
  .layout-grid-item-resize-handle-w {
    width:8px;
    top:0;
    bottom:0;
  }

  .layout-grid-item-resize-handle-e {
    right:-8px;
    cursor:e-resize;
  }

  .layout-grid-item-resize-handle-w {
    left:-8px;
    cursor:w-resize;
  }

  .layout-grid-item-resize-handle-n,
  .layout-grid-item-resize-handle-s {
    height:8px;
    left:0;
    right:0;
  }

  .layout-grid-item-resize-handle-n {
    top:-8px;
    cursor:n-resize;
  }

  .layout-grid-item-resize-handle-s {
    bottom:-8px;
    cursor:s-resize;
  }

  .layout-grid-item-drag-handle {
    position:absolute;
    top:0;
    left:0;
    width:40px;
    height:40px;
    background:rgba(255,255,0,.8);
    cursor:move;
    user-select: none;
  }

  #item1 {
    /* line Y / line X / height / width */
    grid-area: 1 / 5 / span 4 / span 3;
    background:rgba(0,0,255,.5);
  }

  #item2 {
    grid-area: 2 / 2 / span 3 / span 6;
    background:rgba(255,0,0,.5);
  }

</style>
