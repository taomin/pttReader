function FBReader (FB) {
	this.FB = FB;

	//this.accessToken = null;
	//this.userID = null;
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
		    	console.log('Welcome!  Fetching your information.... ');
		    	
		     	FB.api('/me', function(response) {
		       		console.log('Good to see you, ' + response.name + '.');
		       		_userName = response.name;

		    	});

		    	FB.api('/me/home', function(response){
		    		debugger;

		    	});
		   	} else {
		     	console.log('User cancelled login or did not fully authorize.');
		   	}
		},{scope: 'user_activities,user_interests,user_likes,user_status,friends_activities,friends_status,publish_actions,read_stream,offline_access'});
	};
})();


	//start doing other things...
  	/**
  	 * get ptt data from yql

	var yqlurl = 'http://query.yahooapis.com/v1/public/yql?q=use%20%22store%3A%2F%2FFmNpgmPDX9VzBzjdurhPfs%22%20as%20ptt%3B%20%20select%20data.items%20from%20ptt%20where%20category%3D%221%22%20and%20api_key%3D\'b7ece6539c8eab818f2ee92fe18fac6f\'%20&format=json&jsonCompat=new';


	$.get(yqlurl, function(data){

		console.log('data received', data);
	});

	*/