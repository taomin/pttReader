/**
 * Facebook Reader : interact with FB api, fetch your timeline updates from facebook 
 * @param Object FB : facebook javascript library instance
 */
function FBReader (FB) {
  this.FB = FB;
};

(function(){

  /**
   * Private property declaration
   */
  var _accessToken = null,
      _userID = null,
      _userName = null;

  /**
   * FB access initialization 
   * @return null
   */
  FBReader.prototype.init = function () {

    var self = this;
    // determine whether user is already logged in or not
    FB.getLoginStatus(function(response){
      if (response.status === 'connected') {
        // the user is logged in and has authenticated your
        // app
        self.onlogin(response);

      } else {
      
        // the user isn't logged in to Facebook, or not authenticated your app
        // Keep showing 'connect with facebook' button and subscribe to login event
        FB.Event.subscribe('auth.login', self.onlogin);
      }
    });
  };

  FBReader.prototype.onlogin = function(response) {
    _userID = response.authResponse.userID;
    _accessToken = response.authResponse.accessToken;

    /**
     * hide fb login button and start doing things
     */
    $('.fb-login-container').css('display','none');
    this.getTimeline();
  };

  /**
   * Fetch information from facebook timeline 
   */
  FBReader.prototype.getTimeline = function () {

    // FB.api('/me', function(response) {
    //   console.log('Good to see you, ' + response.name + '.');
    //   _userName = response.name;
    // });
          
    // FB.api('/me/home', function(response){
    //   //do something
    // });

  };
})();


  //start doing other things...
    /*
     * get ptt data from yql


    var api_key = '',
        yqlurl = 'http://query.yahooapis.com/v1/public/yql?q=use%20%22store%3A%2F%2FFmNpgmPDX9VzBzjdurhPfs%22%20as%20ptt%3B%20select%20*%20from%20ptt%20where%20api_key%3D"' + api_key + '"%20and%20category%3D%220%22%20&jsonCompat=new';

  $.get(yqlurl, function(data){

    console.log('data received', data);
  });

  */
