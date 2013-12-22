
/* jshint debug: true, expr: true */

;(function($){

  /* Constants & defaults. */ 
  var DATA_COLOR    = 'data-ab-color';
  var DATA_PARENT   = 'data-ab-parent';
  var EVENT_CF      = 'ab-color-found';

  var DEFAULTS      = {
    selector:   'img[data-adaptive-background="1"]',
    parent:     null,
  };

  /* Our main function declaration. */ 
  $.adaptiveBackground = {
    run: function( options ){
      var opts = $.extend({}, DEFAULTS, options);

      /* Loop over each element, waiting for it to load  
         then finding its color, and triggering the 
         color found event when color has been found.
      */ 
      $( opts.selector ).each(function(index, el){
        var $this = $(this);

        /* Small helper function which applies colors, attrs, and triggers events. */
        var handleColors = function(){
          RGBaster.colors($this[0], function(colors){
            $this.attr(DATA_COLOR, colors.dominant);
            $this.trigger(EVENT_CF, { color: colors.dominant, palette: colors.palette });
          }, 20);
        };

        /* Subscribe to our color-found event. */
        $this.on( EVENT_CF, function(ev, data){
          var $parent;
          if ( $this.attr( DATA_PARENT ) ){
            $parent = $this.parents( $this.attr( DATA_PARENT ) );
          } 
          else if (opts.parent) {
            $parent = $( opts.parent );
          }
          else {
            $parent = $this.parent();
          }

          $parent.css({ backgroundColor: data.color });
        });

        /* Handle the colors. */ 
        handleColors();

      });
    },
  };

})(jQuery);