// var evCommentServiceURL = "https://evcommentservice.ga";
var evCommentServiceURL = "http://localhost:8000";

// success시, iframe 태그를 부모 창에 전송함.
// 성공한 경우에 한정해, 다시 VisitorCounter.php에 데이터를 전송해 방문 수를 체크함
(async function(){

  let {evMode, blogOwner, pageIdentifier, siteURL, pageTitle} = $JekyllParams;

  // evMode는 기본값으로 full을 갖는다.
  if(evMode == null) evMode = 'full';
  // 나머지 인자들은 기본값을 가질 수 없으므로, 해당 인자로 전송된 값이 없다면 서버로 전송하지 않는다.
  if(blogOwner == null || pageIdentifier == null || siteURL == null || pageTitle == null) return;

  $.ajax({
    crossOrigin: true,
    type: "GET",
    url: evCommentServiceURL + "/Comment/URL-Verification",
    data: {
      userID: blogOwner,
      pageID: pageIdentifier,
      url: siteURL,
      mode: evMode,
      title: pageTitle
    },
    dataType: "HTML",

    success: function(response) {
      $("#EV-Start").append(response);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Ajax 수신에 실패했습니다!" + jqXHR.responseText);
    }
  });
})().then(() =>{

});

window.addEventListener('message', function(e) {
  if(e.origin == evCommentServiceURL){
    document.getElementById('EV-Iframe').height = e.data.height;
  }
});