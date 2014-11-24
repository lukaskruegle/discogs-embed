(function($){
 
  var discogs, defaultOptions, __bind;
 
  __bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments);
    };
  };
 
  // Plugin default options.
  defaultOptions = {
    api: {
      baseUrl: 'https://api.discogs.com'
    },
    ui: {
      collapseThreshold: 10
    }
  };
  
  defaultDiscogsOptions = {
    releaseType: 'releases',
    id: 1990898
  };
 
  discogs = (function(options) {
 
    function discogs(handler, options) {
      // plugin variables.      
      this.handler = handler;
      
      // Extend default options.
      $.extend(true, this, defaultOptions, options);
 
      // Bind methods.
      this.init = __bind(this.init, this);
      this.load = __bind(this.load, this);
      this.clear = __bind(this.clear, this);
      this.expand = __bind(this.expand, this);
      this.reload = __bind(this.reload, this);
      this._done = __bind(this._done, this);
      this._fail = __bind(this._fail, this);
      this._always = __bind(this._always, this);
      
      // Assign templates.
      this.templates = window.discogsEmbed.templates;
      
      Handlebars.registerHelper('discogsImage', function(image){
        return new Handlebars.SafeString(image.replace('https://api.discogs.com/images', 'http://s.pixogs.com/image'));
      });
      
      Handlebars.registerHelper('isCollapsed', function(tracklist, options) {
        return tracklist.length > defaultOptions.ui.collapseThreshold ? options.fn(this) : null;
      });
            
      Handlebars.registerHelper('isTrack', function(track, options) {
        return track.type_ == 'track' ? options.fn(this) : options.inverse(this);
      });
      
      // Load data handlers
      var _this = this;
      this._done = function(result, status, jqXHR){
        console.log(result.data);
        _this.handler.toggleClass('error', false).html(_this.templates.main({ data : result.data }));        
      }
      
      this._fail = function(){
        _this.handler.toggleClass('error', true).html(_this.templates.error({ id : _this.discogsData.id }));
      }
      
      this._always = function(){
        _this.handler.toggleClass('loading', false); 
      }
      
    };
    
    discogs.prototype.expand = function(event){
      event.preventDefault();
      var $discogsBody = this.$discogsBody || (this.$discogsBody = this.handler.find('.discogs-body'));
      $discogsBody.toggleClass('collapsed', !$discogsBody.is('.collapsed'));
    }    
    
    discogs.prototype.reload = function(event){
      event.preventDefault();
      this.load();
    }
    
    discogs.prototype.load = function(){
      this.handler.toggleClass('loading', true);
      return $.getJSON( this.api.baseUrl + '/' + this.discogsData.releaseType + '/' + this.discogsData.id + '?callback=?')
        .done(this._done)
        .fail(this._fail)
        .always(this._always);
    }
 
    // Main method.
    discogs.prototype.init = function() {
      var _this = this;      
      this.discogsData = $.extend(true, defaultDiscogsOptions, this.handler.data());
      this.handler.on('click', '.more', this.expand);
      this.handler.on('click', '.reload', this.reload);
      this.load();      
    };
 
    // Clear event listeners and time outs.
    discogs.prototype.clear = function() {
      this.handler.off('click');
    };
 
    return discogs;
  })();
 
  $.fn.discogs = function(options) {
    // Create a myPlugin instance if not available.
    if (!this.myPluginInstance) {
      this.myPluginInstance = new discogs(this, options || {});
    } else {
      this.myPluginInstance.update(options || {});
    }
 
    // Init plugin.
    this.myPluginInstance.init();
 
    // Display items (if hidden) and return jQuery object to maintain chainability.
    return this.show();
  };
})(jQuery);