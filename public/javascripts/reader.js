(function(){
	/**
	 * first of all, load facebook JS lib
	 */

	window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '177950445641724', // App ID
	      channelUrl : '//localhost:3000/files/channel.html', // Channel File
	      status     : true, // check login status
	      cookie     : true, // enable cookies to allow the server to access the session
	      xfbml      : true  // parse XFBML
	    });
	};

    // Additional initialization code here
    // 
    // Load the SDK Asynchronously
    (function(d){
    	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('head')[0];
     	if (d.getElementById(id)) {return;}
     	js = d.createElement('script'); js.id = id; js.async = true;
     	js.src = "//connect.facebook.net/en_US/all.js";
     	ref.parentNode.insertBefore(js, ref);
   	}(document));

  	//start doing other things...
  	/**
  	 * get ptt data from yql

	var yqlurl = 'http://query.yahooapis.com/v1/public/yql?q=use%20%22store%3A%2F%2FFmNpgmPDX9VzBzjdurhPfs%22%20as%20ptt%3B%20%20select%20data.items%20from%20ptt%20where%20category%3D%221%22%20and%20api_key%3D\'b7ece6539c8eab818f2ee92fe18fac6f\'%20&format=json&jsonCompat=new';


	$.get(yqlurl, function(data){

		console.log('data received', data);
	});

	*/

})();