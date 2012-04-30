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

    // Additional initialization code here

	var fbreader = new FBReader(FB);
	fbreader.init();
};

// Load the SDK Asynchronously
$('.fb-login').click(function(){
	var d=document, js, id = 'facebook-jssdk', ref = d.getElementsByTagName('head')[0];
 	if (d.getElementById(id)) {return;}
 	js = d.createElement('script'); js.id = id; js.async = true;
 	js.src = "//connect.facebook.net/en_US/all.js";
 	ref.parentNode.insertBefore(js, ref);
 	$('.fb-login-caption').css('display','none');
	});