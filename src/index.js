import LayoutGrid from "./components/LayoutGrid.vue";

window.panel.plugin("kevinvennitti/layoutgrid", {
  blocks: {
    layoutgrid: LayoutGrid
  },
  components: {
    'k-structure-field-preview': {
      props: {
        value: String,
        column: Object,
        field: Object
      },
      computed: {
        text: function() {
          var result = [];
          var fields = ['layoutgridtitle'];

          this.value.forEach(entry => fields.some(field => {
            var value = entry[field] || null;

            if (value) {
              result.push(value);
              return true;
            }
          }));

          if (result.length) {
            return result.join(', ');
          }

          return '…';
        }
      },
      template: '<p class="k-structure-table-text">{{ text }}</p>',
    },

    'k-structure-field-for-layoutgrid': {

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
          var fields = ['layoutgridblocks'];

          //console.log(this.value);

          this.value.forEach(entry => fields.some(field => {
            var value = entry[field] || null;

            if (value) {
              console.log('value', value);

              let clone = document.createElement('div');
              clone.innerHTML = "HEY";
              self.layouts.push(clone);

              result.push(value);
              return true;
            }
          }));

          if (result.length) {
            return result.join(' - ');
          }

          return '…';
        }
      },
      mounted : function() {
        this.$nextTick(function () {
          this.layouts.forEach(entry => {
            document.getElementById('k-structure-wrapper').appendChild(entry);
          });
        })
      },
      template: '<p id="k-structure-wrapper">{{ text }}</p>',
    }
/*
    'k-structure-field-layout': {
      props: {
        value: String,
        column: Object,
        field: Object
      },
      computed: {
        text: function() {
          var result = [];
          var fields = ['layoutgridlayouts'];

          console.log({this.value});

          this.value.forEach(entry => fields.some(field => {
            var value = entry[field] || null;

            console.log({value});

            if (value) {

              return  "blue";

              return createElement(
                // {String | Object | Function}
                // Un nom de balise HTML, des options de composant, ou une fonction
                // asynchrone retournant l'un des deux. Requis.
                'div', {
                  'attrs': {
                    id: "yo",
                  },
                  'domProps': {
                    innerHTML: "HEY"
                  }
                }
              );

              result.push(value);
              return true;
            }
          }));

        }
      },
      template: "{{ text }}"
      // template: `<k-layout-field
      //   :value="content.grid"
      //   v-bind="grid"
      //   :label="content.title"
      //   @input="update"
      // />`
    }
  }
  */
  },
});
