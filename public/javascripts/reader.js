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
      _userName = null,
      _storylist = [];

  /**
   * FB access initialization
   * @return null
   */
  FBReader.prototype.init = function () {

    var self = this;

    $('.storylist').on('click', $.proxy(self.delegateStoryClick, self));

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
    var storyListHeight = $(window).height() - $('#left-pane header').height() - 40;
    $('.storylist').css('height', storyListHeight).css('overflow-y','scroll');
    this.getTimeline();
  };

  /**
   * Fetch information from facebook timeline
   */
  FBReader.prototype.getTimeline = function () {

    var self = this;

    FB.api('/me/home?limit=50', function(response) {
      console.log('fetching timeline.');
      var updates = [];

      if (response.data) {
        $.each(response.data, function(index, msg){
          if (msg.type == 'link' || msg.type == 'photo') {
            updates.push(msg);
          };
        });

        updates = self.sortFBUpdates(updates);
        $.merge(_storylist, updates);

        //update FE
        self.updateReader(updates);


        //store info in db


      }

    });

    // FB.api('/me/home', function(response){
    //   //do something
    // });

  };

  FBReader.prototype.sortFBUpdates = function (updates) {

    function sortFBByActions(msg1, msg2){
      var comment1 = (msg1.comments) ? parseInt(msg1.comments.count) : 0,
          comment2 = (msg2.comments) ? parseInt(msg2.comments.count) : 0,
          like1 = (msg1.likes) ? parseInt(msg1.likes.count) : 0,
          like2 = (msg2.likes) ? parseInt(msg2.likes.count) : 0;

      var diff = comment1 + like1 - comment2 - like2 ;


      if ( diff == 0 ){
        return 0;
      }
      return (diff > 0) ? -1: 1;
    }

    updates.sort(sortFBByActions);

    return updates;
  };

  FBReader.prototype.updateReader = function (updates) {

    $.each(updates, function (index, update) {

      var headline = update.name || update.message,
          author = update.from.name || update.caption,
          likeCount = update.likes.count,
          commentCount = (update.comments) ? update.comments.count : 0,
          headline = (headline.length > 50) ? headline.slice(0, 50) + '...' : headline, //simple truncation
          dom = '<li data-id="' + update.id + '" data-index="' + index + '">'
              + '<h2>' + headline + '</h2>'
              + '<span class="storylist-icon"><i class="like"></i>' + likeCount + '</span>'
              + '<span class="storylist-icon"><i class="comment"></i>' + commentCount + '</span>'
              + '<p><img class="source-icon icon" src="' + update.icon + '"></image></icon>' + author + '</p></li>';

      $('.storylist').append(dom);

    });


  };

  FBReader.prototype.delegateStoryClick = function (e) {
    e.preventDefault();
    var target = e.target,
        storyDom = $(target).closest('li')[0],
        storyIndex = storyDom.dataset.index,
        story = _storylist[storyIndex],
        src, iframeDom, iframeHeight, messageDom;

    switch (story.type){

      case 'photo':
        src = story.picture;
        break;
      case 'link':
      default:
        src = story.link;
        break;
    }

    // have to assign iframe width because container uses flexbox and would shrink when contaisns an iframe
    // iframeWidth = $('.storypane').width();
    iframeHeight = $(window).height() - $('#right-pane header').height() - 50;
    iframeDom = '<iframe width="100%" height="' + iframeHeight + 'px" src="' + src + '"></iframe>';
    messageDom = '<span class="truncate social-message">' + story.from.name + ' : ' + story.message + '</span>';

    $('.storypane').empty().append(iframeDom);
    $('.fb-action-container').removeClass('hide').empty().append(messageDom);
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
