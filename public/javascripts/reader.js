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
    FB.login(function(response) {
      if (response.authResponse) {
        _accessToken = response.authResponse.accessToken;
        _userID = response.authResponse.userID;
          console.log('Welcome!  Now we are able to fetch your information.... ');
          
          // FB.api('/me', function(response) {
          //   console.log('Good to see you, ' + response.name + '.');
          //   _userName = response.name;
          // });
                
          // FB.api('/me/home', function(response){
          //   //do something
          // });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
    },{scope: 'user_activities,user_interests,user_likes,user_status,friends_activities,friends_status,publish_actions,read_stream,offline_access'});
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
