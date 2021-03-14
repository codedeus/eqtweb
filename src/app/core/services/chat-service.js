(function () {
  "use strict";

  angular.module("app.core").factory("chatservice", chatService);
})();

chatService.$inject = [
  "$http",
  "$q",
  "baseApiUrl",
  "$window",
  "$rootScope",
  "HmisConstants",
  "$log"
];

function chatService($http, $q, baseApiUrl, $window, $rootScope,HmisConstants,$log) {
  var connection;
  var userLocation;
  
  if($window.localStorage.location == null || angular.isUndefined($window.localStorage.location))
  {
    userLocation = ""
  }
  else
  {
    var response = angular.toJson(angular.fromJson($window.localStorage.location).Name).toUpperCase();
    userLocation =  response.replace(/&/g, "AND");
  }

  var SignalRConnection = function () {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HmisConstants.SignalRUrl}/doctorsPharmcistChatHub?location=${userLocation}`, {
        accessTokenFactory: () =>
          angular.fromJson($window.localStorage.authToken)
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    connection.on("newMessage", (msgId) => {
     
     //################################################
     $rootScope.onlinePple.forEach((element, index, array) => {
      if (msgId.SenderId == element.Id) {
        element.Time = Date.now();
        const indexUser = $rootScope.onlinePple.indexOf(element);
        if (indexUser > -1) {
          let el = element;
          $rootScope.onlinePple.splice(indexUser, 1);
          $rootScope.onlinePple.unshift(el);
        }
      }
    });
    
     //#################################################
     
      if (msgId != null && $rootScope.openDia == false) {
        if ($rootScope.unseenMessagesObj.hasOwnProperty(msgId.SenderId)) {
          $rootScope.unseenMessagesObj[msgId.SenderId]['Count'] =
            $rootScope.unseenMessagesObj[msgId.SenderId]['Count'] + 1;
            $rootScope.unseenMessagesObj[msgId.SenderId]['Messages'][0]  = msgId.Messages;
        } else {
          $rootScope.unseenMessagesObj[msgId.SenderId] = {"Count": 1 , 'Messages' : [msgId.Messages] };
       
         
        }
        $rootScope.$broadcast(
          "unseenMessagesObj",
          $rootScope.unseenMessagesObj
        );
      }else{
        if (msgId != null && $rootScope.dialoguserid != msgId.SenderId && $rootScope.openDia == true) {
          if ($rootScope.unseenMessagesObj.hasOwnProperty(msgId.SenderId)) {
            $rootScope.unseenMessagesObj[msgId.SenderId]['Count'] =
              $rootScope.unseenMessagesObj[msgId.SenderId]['Count'] + 1;
              $rootScope.unseenMessagesObj[msgId.SenderId]['Messages'][0]  = msgId.Messages;
              
          } else {
            $rootScope.unseenMessagesObj[msgId.SenderId] =  {"Count": 1 , 'Messages' : [msgId.Messages] };
          
            
          }
          $rootScope.$broadcast(
            "unseenMessagesObj",
            $rootScope.unseenMessagesObj
          );
        }
      } 
      
    });

    connection.on("ReceiveUsers", (res) => {
      $rootScope.onlinePple = res;
      $rootScope.$broadcast("onlinePple", { data: res });
    });

    connection.on("OfflineUsers", (res) => {
      $rootScope.offlineUsersObj = res;
      $rootScope.$broadcast("offlineUsersObj", { data: res });
    });

    connection.on("UserGoingOffline", (res) => {
      $rootScope.userGoingOffline = res;
      $rootScope.$broadcast("userGoingOffline", { data: res });
    });

    connection.on("RecentLoginId", (res) => {
      $rootScope.recentLoginId = res;
      $rootScope.$broadcast("recentLoginId", { data: res });
    });

    connection.onclose(() => {
      //start()
    });
    //start();
    return connection;
  };

  var start = function(){
    $log.log('connecting.......');
    connection.start().then(() => {
      connection.invoke("SetSentMessagesToDelivered")  
    })
    .catch(() => {
      $window.setTimeout(() => {
         start()
      }, 60000)
    });
  }

  var SendMessage = function (receiverId, textMessage, chatId) {
      //######################################################################
  
  $rootScope.onlinePple.forEach((element, index, array) => {
    if (receiverId == element.Id) {
      element.Time = Date.now();
      const indexUser = $rootScope.onlinePple.indexOf(element);
      if (indexUser > -1) {
        let el = element;
        $rootScope.onlinePple.splice(indexUser, 1);
        $rootScope.onlinePple.unshift(el);
      }
    }
  });
 
  //#######################################################################
    connection
      .invoke("SendMessage", receiverId, textMessage, chatId)
      .catch(() => {
        //alert("Something went wrong, please contact the system support admin");
      });
  };

  var getConnection = function () {
   return connection;
  };

  var MarkAsDelivered = function(msgId){
    var deliveredIcon = $window.document.getElementById(
      "msg-senticon-2-" + msgId
    );
    deliveredIcon.style.visibility = "visible";
  }

  var MarkAsSeen = function(msgId){
    var deliveredIconFirst = $window.document.getElementById(
      "msg-senticon-1-" + msgId
    );
    var deliveredIconSecond = $window.document.getElementById(
      "msg-senticon-2-" + msgId
    );
    deliveredIconFirst.style.color = "#34B7F1";
    deliveredIconSecond.style.color = "#34B7F1";
  }

  var senderNativeId = function () {
    return $window.localStorage.nativeId;
  };

  var getUnseenMessages = function (NativeId) {
    var deferred = $q.defer();
    $http.get(baseApiUrl + `GetDocPharmInfo/Notification/${NativeId}`).then(
      function (result) {
        deferred.resolve(result.data);
      }
    );
    return deferred.promise;
  };
  
var getStaffMemberBySearchText = function(searchText){
  var deferred = $q.defer();
  $http.get(baseApiUrl + `GetDocPharmInfo/GetStaffMemberBySearchText/?searchText=${searchText}`).then(
    function (result) {
      deferred.resolve(result.data);
    }
  );
  return deferred.promise;

}
  var getChatInfo = function (ReceiverId) {
    var deferred = $q.defer();
    $http.get(baseApiUrl + `GetDocPharmInfo/Create-chat/${ReceiverId}`).then(
      function (result) {
        deferred.resolve(result.data);
      }
    );
    return deferred.promise;
  };

  var getMessages = function (chatId, pageIndex, pageSize) {
    var deferred = $q.defer();
    $http
      .get(
        baseApiUrl +
          `GetDocPharmInfo/get-messages/${pageIndex}/${pageSize}/${chatId}`
      )
      .then(
        function (result) {
          deferred.resolve(result.data);
        }
      );

    return deferred.promise;
  };

  return {
    SignalRConnection: SignalRConnection,
    SendMessage: SendMessage,
    getChatInfo: getChatInfo,
    getMessages: getMessages,
    getUnseenMessages: getUnseenMessages,
    senderNativeId: senderNativeId,
    getConnection:getConnection,
    MarkAsDelivered:MarkAsDelivered,
    MarkAsSeen:MarkAsSeen,
    getStaffMemberBySearchText:getStaffMemberBySearchText
  };
}
