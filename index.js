(function() {
  "use strict";
  var render = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "layout-grid-container layout-grid", attrs: { "id": "layout-grid-frame" }, on: { "mousedown": _vm.preventSelect } }, _vm._l(_vm.content.layoutgridstructure, function(itemstructure) {
      return _c("div", { staticClass: "layout-grid-item", style: { gridColumnStart: itemstructure.grid_column_start, gridRowStart: itemstructure.grid_row_start, gridColumnEnd: "span " + itemstructure.grid_column_end, gridRowEnd: "span " + itemstructure.grid_row_end }, on: { "mousedown": _vm.preventSelect, "mouseup": _vm.savePosition } }, [_c("k-blocks", { ref: "blocks", refInFor: true, attrs: { "value": itemstructure.layoutgridblocks, "fieldsets": _vm.field("layoutgridblocksforfieldsets").fieldsets, "endpoints": _vm.endpoints, "group": "layout" }, on: { "input": function($event) {
        return _vm.$emit("update", $event);
      } } }), _c("div", { staticClass: "layout-grid-item-drag-handle" }, [_vm._v(":::")]), _c("div", { staticClass: "layout-grid-item-resize-handle layout-grid-item-resize-handle-w", attrs: { "data-resize": "w" } }), _c("div", { staticClass: "layout-grid-item-resize-handle layout-grid-item-resize-handle-e", attrs: { "data-resize": "e" } }), _c("div", { staticClass: "layout-grid-item-resize-handle layout-grid-item-resize-handle-n", attrs: { "data-resize": "n" } }), _c("div", { staticClass: "layout-grid-item-resize-handle layout-grid-item-resize-handle-s", attrs: { "data-resize": "s" } })], 1);
    }), 0);
  };
  var staticRenderFns = [];
  render._withStripped = true;
  var LayoutGrid_vue_vue_type_style_index_0_lang = "";
  function normalizeComponent(scriptExports, render2, staticRenderFns2, functionalTemplate, injectStyles, scopeId, moduleIdentifier, shadowMode) {
    var options = typeof scriptExports === "function" ? scriptExports.options : scriptExports;
    if (render2) {
      options.render = render2;
      options.staticRenderFns = staticRenderFns2;
      options._compiled = true;
    }
    if (functionalTemplate) {
      options.functional = true;
    }
    if (scopeId) {
      options._scopeId = "data-v-" + scopeId;
    }
    var hook;
    if (moduleIdentifier) {
      hook = function(context) {
        context = context || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
        if (!context && typeof __VUE_SSR_CONTEXT__ !== "undefined") {
          context = __VUE_SSR_CONTEXT__;
        }
        if (injectStyles) {
          injectStyles.call(this, context);
        }
        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      };
      options._ssrRegister = hook;
    } else if (injectStyles) {
      hook = shadowMode ? function() {
        injectStyles.call(this, (options.functional ? this.parent : this).$root.$options.shadowRoot);
      } : injectStyles;
    }
    if (hook) {
      if (options.functional) {
        options._injectStyles = hook;
        var originalRender = options.render;
        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }
    return {
      exports: scriptExports,
      options
    };
  }
  const __vue2_script = {
    props: {
      blocks: Array,
      endpoints: Object,
      disabled: Boolean
    },
    data() {
      return {
        gridarea: "1 / 1 / span 3 / span 3",
        color: "red"
      };
    },
    methods: {
      preventSelect(event) {
        if (event.detail > 1) {
          event.preventDefault();
        }
      },
      savePosition(event) {
        console.log("save position");
        console.log(this.$el.children);
        for (let i = 0; i < this.$el.children.length; i++) {
          let group = this.$el.children[i];
          console.log(group.dataset.gridColumnStart);
        }
      },
      debug() {
        console.log("this", this);
      }
    },
    mounted() {
      this.debug();
    }
  };
  window.onload = function() {
    setTimeout(function() {
      new LayoutGridPlugin({
        itemSelector: ".layout-grid-item",
        cols: 12,
        rows: 12
      });
    }, 2e3);
  };
  class LayoutGridPlugin {
    constructor(options) {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeDirection = null;
      this.grid = {
        DOM: document.getElementById("layout-grid-frame"),
        nbCols: 12,
        nbRows: 12,
        colsStartsX: [],
        colsEndsX: [],
        rowsStartsY: [],
        rowsEndsY: []
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
        itemSelector: ".layout-grid-item",
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
      let colsWidths = this.getStyleProperty(this.grid.DOM, "grid-template-columns");
      let columnGap = parseInt(this.getStyleProperty(this.grid.DOM, "column-gap"));
      this.grid.colsStartsX.push(0);
      this.grid.colsEndsX.push(0);
      let colIndex = 1;
      colsWidths.split(" ").forEach(function(colWidth) {
        colWidth = parseInt(colWidth);
        _this.grid.colsStartsX.push((colWidth + columnGap) * colIndex);
        _this.grid.colsEndsX.push(colWidth * colIndex + columnGap * (colIndex - 1));
        colIndex++;
      });
      this.grid.colsStartsX.splice(-1, 1);
      this.grid.colsEndsX.shift();
      let rowsHeights = this.getStyleProperty(this.grid.DOM, "grid-template-rows");
      let rowGap = parseInt(this.getStyleProperty(this.grid.DOM, "row-gap"));
      this.grid.rowsStartsY.push(0);
      this.grid.rowsEndsY.push(0);
      let rowIndex = 1;
      rowsHeights.split(" ").forEach(function(rowHeight) {
        rowHeight = parseInt(rowHeight);
        _this.grid.rowsStartsY.push((rowHeight + rowGap) * rowIndex);
        _this.grid.rowsEndsY.push(rowHeight * rowIndex + rowGap * (rowIndex - 1));
        rowIndex++;
      });
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
      this.grid.colsStartsX.forEach(function(colStartX, i) {
        if (i <= _this.grid.nbCols - _this.item.columnSpan) {
          if (dragPositionX >= colStartX - 2 && dragPositionX < _this.grid.colsStartsX[i + 1] - 2) {
            _this.item.columnStart = i + 1;
            _this.item.DOM.style.gridColumnStart = _this.item.columnStart;
          }
        }
      });
      this.grid.rowsStartsY.forEach(function(rowStartY, i) {
        if (dragPositionY >= rowStartY - 2 && dragPositionY < _this.grid.rowsStartsY[i + 1] - 2) {
          _this.item.rowStart = i + 1;
          _this.item.DOM.style.gridRowStart = _this.item.rowStart;
        }
      });
      this.getItemStyles();
    }
    checkResize() {
      var _this = this;
      this.getItemStyles();
      this.item.origin.x - this.mouse.delta.x;
      this.item.origin.y - this.mouse.delta.y;
      if (this.resizeDirection == "e") {
        this.grid.colsEndsX.every(function(colEndX, i) {
          if (_this.mouse.current.x < colEndX + _this.grid.gap && i + 2 > _this.item.columnStart) {
            _this.item.columnSpan = i + 2 - _this.item.columnStart;
            _this.item.DOM.style.gridColumnEnd = "span " + _this.item.columnSpan;
            return false;
          } else {
            return true;
          }
        });
      }
      if (this.resizeDirection == "w") {
        this.grid.colsEndsX.every(function(colEndX, i) {
          if (_this.mouse.current.x < colEndX) {
            _this.item.columnStart = Math.min(i + 1, _this.itemBeforeTransformations.columnSpan + _this.itemBeforeTransformations.columnStart - 1);
            _this.item.DOM.style.gridColumnStart = _this.item.columnStart;
            _this.item.columnSpan = _this.itemBeforeTransformations.columnSpan + (_this.itemBeforeTransformations.columnStart - _this.item.columnStart);
            _this.item.DOM.style.gridColumnEnd = "span " + _this.item.columnSpan;
            return false;
          } else {
            return true;
          }
        });
      }
      if (this.resizeDirection == "s") {
        this.grid.rowsEndsY.every(function(rowEndY, i) {
          if (_this.mouse.current.y <= rowEndY) {
            _this.item.rowSpan = i + 1 - _this.item.rowStart;
            _this.item.DOM.style.gridRowEnd = "span " + _this.item.rowSpan;
            return false;
          } else {
            return true;
          }
        });
      }
      if (this.resizeDirection == "n") {
        this.grid.rowsEndsY.every(function(rowEndY, i) {
          if (_this.mouse.current.y < rowEndY) {
            _this.item.rowStart = Math.min(i + 1, _this.itemBeforeTransformations.rowSpan + _this.itemBeforeTransformations.rowStart - 1);
            _this.item.DOM.style.gridRowStart = _this.item.rowStart;
            _this.item.rowSpan = _this.itemBeforeTransformations.rowSpan + (_this.itemBeforeTransformations.rowStart - _this.item.rowStart);
            _this.item.DOM.style.gridRowEnd = "span " + _this.item.rowSpan;
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
      this.item.columnStart = parseInt(this.getStyleProperty(this.item.DOM, "grid-column-start"));
      this.item.columnSpan = parseInt(this.getStyleProperty(this.item.DOM, "grid-column-end").replace("span ", ""));
      this.item.rowStart = parseInt(this.getStyleProperty(this.item.DOM, "grid-row-start"));
      this.item.rowSpan = parseInt(this.getStyleProperty(this.item.DOM, "grid-row-end").replace("span ", ""));
      this.item.DOM.setAttribute("data-grid-column-start", this.item.columnStart);
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
      layoutGridItems.forEach((layoutGridItem) => {
        var _layoutGridItem = layoutGridItem;
        layoutGridItem.querySelectorAll(".layout-grid-item-drag-handle").forEach((layoutGridItemDragHandle) => {
          layoutGridItemDragHandle.addEventListener("mousedown", function(e) {
            _this.triggerDragItem(_layoutGridItem, e);
          });
        });
        layoutGridItem.querySelectorAll(".layout-grid-item-resize-handle").forEach((layoutGridItemDragHandle) => {
          layoutGridItemDragHandle.addEventListener("mousedown", function(e) {
            _this.triggerResizeItem(_layoutGridItem, e, this.getAttribute("data-resize"));
          });
        });
      });
      document.addEventListener("mousemove", function(e) {
        _this.triggerMouseMove(e);
      });
      document.addEventListener("mouseup", function(e) {
        _this.triggerMouseUp(e);
      });
      window.addEventListener("resize", function(e) {
        _this.updateMouse(e);
        _this.getAllLimits();
      });
    }
  }
  const __cssModules = {};
  var __component__ = /* @__PURE__ */ normalizeComponent(__vue2_script, render, staticRenderFns, false, __vue2_injectStyles, null, null, null);
  function __vue2_injectStyles(context) {
    for (let o in __cssModules) {
      this[o] = __cssModules[o];
    }
  }
  __component__.options.__file = "src/components/LayoutGrid.vue";
  var LayoutGrid = /* @__PURE__ */ function() {
    return __component__.exports;
  }();
  window.panel.plugin("kevinvennitti/layoutgrid", {
    blocks: {
      layoutgrid: LayoutGrid
    },
    components: {
      "k-structure-field-preview": {
        props: {
          value: String,
          column: Object,
          field: Object
        },
        computed: {
          text: function() {
            var result = [];
            var fields = ["layoutgridtitle"];
            this.value.forEach((entry) => fields.some((field) => {
              var value = entry[field] || null;
              if (value) {
                result.push(value);
                return true;
              }
            }));
            if (result.length) {
              return result.join(", ");
            }
            return "\u2026";
          }
        },
        template: '<p class="k-structure-table-text">{{ text }}</p>'
      },
      "k-structure-field-for-layoutgrid": {
        props: {
          value: String,
          column: Object,
          field: Object
        },
        computed: {
          text: function() {
            var self = this;
            self.layouts = [];
            var result = [];
            var fields = ["layoutgridblocks"];
            this.value.forEach((entry) => fields.some((field) => {
              var value = entry[field] || null;
              if (value) {
                console.log("value", value);
                let clone = document.createElement("div");
                clone.innerHTML = "HEY";
                self.layouts.push(clone);
                result.push(value);
                return true;
              }
            }));
            if (result.length) {
              return result.join(" - ");
            }
            return "\u2026";
          }
        },
        mounted: function() {
          this.$nextTick(function() {
            this.layouts.forEach((entry) => {
              document.getElementById("k-structure-wrapper").appendChild(entry);
            });
          });
        },
        template: '<p id="k-structure-wrapper">{{ text }}</p>'
      }
    }
  });
})();
