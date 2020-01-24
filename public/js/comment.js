// 쟝고 감정 분석 서버 URL (full, binary 모드에서 사용)
var EmotionalAnalysisServiceURL       = "https://emotionanalysisservice.ga/changer/comment";
var EmotionalAnalysisServiceReportURL = "https://emotionanalysisservice.ga/changer/report";

var API = `http://localhost:8000`;

var params = {
  blogID   : getParameterByName('blogID'),
  pageID  : getParameterByName('pageID'),
  evMode  : getParameterByName('mode')
}

// reportCommentID, reportCommentContent를 갖고 있는 객체
var reportComment;

const log = (logContent) => { console.log("Log from evCommentService : " + logContent); };

window.onload = function(){
  containerLoad();
}

// 코드 양, 중복을 없애기 위해 사용
function ajaxRequest(type, url, dataArr, success, error){
  $.ajax({ type: type, url : url, data: dataArr, success : success, error: error });
}

function containerLoad(){
  $('#EV-Container').show();
  onHeightChange();
}

// B, I, U, S 등 편집기의 각 버튼이 클릭 되었을 때의 이벤트 처리를
// 모두 담당하는 함수
function editButtonClicked(clickedButton){

  selectedText = $('#CommentArea').html();

  switch (clickedButton) {
    case "EV-Buttons-B":
      $('#CommentArea').html("&ltb&gt" + selectedText + "&lt/b&gt");
      break;
    case "EV-Buttons-I":
      $('#CommentArea').html("&lti&gt" + selectedText + "&lt/i&gt");
      break;
    case "EV-Buttons-U":
      $('#CommentArea').html("&ltu&gt" + selectedText + "&lt/u&gt");
      break;
    case "EV-Buttons-S":
      $('#CommentArea').html("&lts&gt" + selectedText + "&lt/s&gt");
      break;
    case "EV-Buttons-CommentSubmit":
      if(verifyComment() == true){
        postComment();
      }
      break;
  }
}

// 클릭되거나, 텍스트가 입력되면 placeholder를 숨김
function textAreaClicked(){
  $('#CommentArea').focus();
  $('#Textarea-placeholder').hide();
}

// 댓글이 안전한 형식인지 검사하는 함수.
function verifyComment(){
  if($('#CommentArea').html() == ''){
    return false;
  }
  return true;
}

// 제출 버튼을 클릭해 댓글을 달 때 실행되는 함수
function postComment(){

  // 로그인 되어 있지 않은 경우 우선 로그인을 권유하는 알림을 띄운다
  // if(connectedUserID == '' && !($('#recommendLoginAlert').is(":visible"))){
  //   $('#recommendLoginAlert').show();
  //   onHeightChange();
  //   return;
  // }

  const commentContent = $('#CommentArea').html();

  let arg = {
      commentContent        : commentContent,
      blogID                : params.blogID,
      pageID                : params.pageID,
  };

  switch (params.evMode) {

    case "full":
    case "binary":
    case "none":

      // 감정 분석 서비스를 받고, 성공한 경우 댓글 관리 서비스에 데이터를 넘겨준다
      // data는 감정분석 결과 값 (긍정 ~ 부정 정도에 따라, -50 ~ 50으로 가정함)
      ajaxRequest("POST", EmotionalAnalysisServiceURL, { commentContent : commentContent },
        // Success
        (score)=>{
            arg.emotionalAnalysisValue = (parseInt(score));
            ajaxRequest("POST", `${API}/Comment/Add`, arg, () => { location.reload(); });
        },
        // Error
        ()=>{ log ("EmotionalAnalysisServiceURL 접속에 실패했습니다"); }
      );

      break;

    case "debug":

      ajaxRequest("POST", `${API}/Comment/Add`, arg, () => { location.reload(); });
      break;

    default:
      // 디폴트 값은 full이지만, 예외처리는 넣어놓았다
      log("Error:: mode value is one of 'full, binary, none'");
      throw new Error("Assert failed: mode value is one of 'full, binary, none, debug'");
      break;
  }
}

// id는 현재 쓰이지 않음
function reportButtonClicked(id, content, isPositive){

  reportComment.reportCommentContent  = content;
  // isPositive엔, 긍정인 경우 부정 값(0)을, 부정인 경우 긍정 값(1)을 넣어 놓는다.
  reportComment.isPositive            = (isPositive > 0) ? "0" : "1";

  let reverse = (isPositive > 0) ? "부정" : "긍정";

  $('#ReportCommentContent').html('"' + content + '"' + " 다음 댓글을 " + reverse + "으로 평가하시겠습니까?");
}

function reportComment(){

  let { reportCommentContent, isPositive } = reportComment;

  let arg = {
    CommentContent  : reportCommentContent,
    IsPositive      : isPositive
  };

  ajaxRequest("POST", EmotionalAnalysisServiceReportURL, arg);

}

function deleteComment(id){

  let arg = {
    // id 중 숫자만 추출
    CommentID : id.replace(/[^0-9]/g,""),
    blogID     : params.blogID,
    pageID    : params.pageID
  };

  ajaxRequest("POST", `${API}/Comment/Delete`, arg,
    ()=>{ location.reload(); }
  );

}

// 클릭되거나, 텍스트가 입력되면 placeholder를 숨김

$('#CommentArea').click(function(){
  textAreaClicked();
});

// 높이가 변하면 부모 프레임에 높이를 전달
function onHeightChange(){
  window.parent.postMessage({ height: document.body.scrollHeight }, '*');
}

// get 방식 파라미터 값을 가져오는 함수
// http://naminsik.com/blog/3070 참고
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// 커서를 마지막 위치로 이동시킴
// 지금 당장은 필요 없지만 댓글에 이미지를 포함시키는 기능을 추가한다면 필요해질 것
// https://stackoverflow.com/questions/4609405/set-focus-after-last-character-in-text-box
function focusCampo(id){
    var inputField = document.getElementById(id);
    if (inputField != null && inputField.value.length != 0){
        if (inputField.createTextRange){
            var FieldRange = inputField.createTextRange();
            FieldRange.moveStart('character',inputField.value.length);
            FieldRange.collapse();
            FieldRange.select();
        }else if (inputField.selectionStart || inputField.selectionStart == '0') {
            var elemLen = inputField.value.length;
            inputField.selectionStart = elemLen;
            inputField.selectionEnd = elemLen;
            inputField.focus();
        }
    }else{
        inputField.focus();
    }
}

// editComment가 editMode를 클로징 하기 위해 만든 Wrapper 함수.
function editCommentWrap(){

  let editMode = {
    isEditMode : false,
    commentBuffer : "",
    editCommentContentID : ""
  };

  return function(id, submitButton){
    if(editMode.isEditMode){
      $('#' + editMode.editCommentContentID).removeAttr('contenteditable');
      $('#' + editMode.editCommentContentID).removeClass('editArea');
      $('#' + editMode.editCommentContentID).html(editMode.commentBuffer);
      $('#' + editMode.editCommentContentID).nextAll('.sendCommentUpdateButton').hide();

      if(id == editMode.editCommentContentID) {
        editMode.isEditMode = false;
        onHeightChange();
        return;
      }
    }

    editMode.isEditMode = true;
    editMode.editCommentContentID = id;
    editMode.commentBuffer = $('#' + id).html();
    submitButton.show();
    $('#' + id).attr('contenteditable', 'PLAINTEXT-ONLY');
    $('#' + id).addClass('editArea');
    onHeightChange();

  }
}

const editComment = editCommentWrap();

// 수정 버튼을 클릭하면 댓글 내용을 수정하기 위한 조치를 한 후, 제출 버튼 (이미지)을 추가한다.
// 그 상태에서 제출 버튼을 클릭하면, sendCommentUpdateMessage 가 실행되어 Ajax로 EditComment.php 내 코드를 실행해
// DB 에서 해당 레코드 Comment Content를 수정한다
function sendCommentUpdateMessage(contentID){

  let arg = {
      CommentID       : contentID.replace(/[^0-9]/g,""),
      blogID           : params.blogID,
      pageID          : params.pageID,
      commentContent  : $('#' + contentID).html()
  };

  switch (params.evMode) {

    case "full":
    case "binary":
    case "none":
      // 감정 분석 서비스를 받고, 성공한 경우 댓글 관리 서비스에 데이터를 넘겨준다
      ajaxRequest("POST", EmotionalAnalysisServiceURL, { commentContent : arg.commentContent },
        (score) => {
          arg.emotionalAnalysisValue = (parseInt(score));
          ajaxRequest("POST", `${API}/Comment/Edit`, arg,
            // Success
            ()=>{ location.reload(); },
            // Fail
            ()=>{ log("EmotionalAnalysisServiceURL 접속에 실패했습니다"); }
          );
        }
      );
      break;

    case "debug":
      ajaxRequest("POST", `${API}/Comment/Edit`, arg,
        ()=>{ location.reload(); }
      );
      break;

    default:
      log("Error:: mode value is one of 'full, binary, none'");
      break;
  }
}

function login() {

  let arg = {
    ID: $('#ID').val(),
    PW: $('#PW').val()
  }

  ajaxRequest("POST", `${API}/Comment/Login`, arg, 
    () => { location.reload(); }, (err) => { log(err); })
}