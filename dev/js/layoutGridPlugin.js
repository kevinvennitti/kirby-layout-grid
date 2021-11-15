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

    console.log(this.grid);
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
