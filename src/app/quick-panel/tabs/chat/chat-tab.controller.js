(function ()
{
    'use strict';

    angular
        .module('app.quick-panel')
        .controller('ChatTabController', ChatTabController);

    /** @ngInject */
    function ChatTabController($timeout, chatservice, $scope, $rootScope)
    {
        
        var vm = this;

         

var connection = chatservice.getConnection();
connection.on("ReceiveMessage", (res) => {
    if(Number(vm.userNativeId) === Number(res.SenderId)){
      if(vm.chatActive){
        vm.messages.push(res);
        scrollToBottomOfChat(400);
     }
    }
    else {
      connection.invoke("OnDelivered", res.SenderId.toString(), res.Id.toString())
      if(vm.chatActive && (vm.ReceiverId == res.SenderId)){
         vm.messages.push(res);
         scrollToBottomOfChat(400);
         connection.invoke("OnSeen", res.SenderId.toString(), res.Id.toString())
      }
    }
   
    
})

connection.on("Seen", (msgId) => {
  if (vm.chatActive === true) {
    chatservice.MarkAsSeen(msgId);
  }
});
connection.on("MarkAsDelivered", (msgId) => {
  if (vm.chatActive === true) {
    chatservice.MarkAsDelivered(msgId);
  }
});



 //######################################################################3
        
      
  $rootScope.dialoguserid = -1;
 $rootScope.unseenMessagesObj = {};
 $scope.userNativeId = chatservice.senderNativeId();
  $scope.offlineUsers = [];
  $scope.recentLoginId = -1;

 $scope.userUnseenMessages = null;

 
   $rootScope.unseenMessagesObj = {};
   $scope.unseenMsg = $rootScope.unseenMessagesObj;

 $rootScope.$on("unseenMessagesObj", function (ev, args) {
   $rootScope.unseenMessagesObj = args;
   $scope.unseenMsg = $rootScope.unseenMessagesObj;
 

 });
 $rootScope.$on("offlineUsersObj", function (ev, args) {
  $scope.$applyAsync(
   $scope.offlineUsers = args.data);
 

 });

 $rootScope.$on("userGoingOffline", function (ev, args) {
  
   $scope.offlineUsers.push(args.data);

  
 });


 $rootScope.$on("onlinePple", function (ev, args) {
  $scope.$applyAsync(
   $scope.onlinePple = args.data);
  
   if ($scope.onlinePple.length > 0) {
     var defaultDate = new Date();
     var dummyDate = defaultDate.setDate(defaultDate.getDate()-1);
     
      for (let element = 0; element < $scope.onlinePple.length; element++) {
        
  
     if ($scope.unseenMsg != null || $scope.unseenMsg != undefined) {
      $scope.onlinePple[element]['Time']  = $scope.unseenMsg[$scope.onlinePple[element]['Id']] != undefined ? Date.now() : dummyDate;
     
     }
       if ($scope.userNativeId == $scope.onlinePple[element]['Id']) {
         
        $scope.onlinePple.splice(element, 1);
        element --;
     
    }
      }
      $scope.onlinePple.sort(function(a,b){
      
      
        return b.Time - a.Time;
      })
    
   }
//console.log($scope.onlinePple)
 });
 
 $scope.$on("recentLoginId", function (ev, args) {
   if ($scope.offlineUsers.length > 0) {
     
    for (let element = 0; element < $scope.offlineUsers.length; element++) {
      
      if (args.data == $scope.offlineUsers[element]['Id']) {
        
        $scope.offlineUsers.splice(element, 1);
     
    }
    }
     
  
   }
 });
 

 //################################################################################################
     
     
        // Data
        vm.messages = [];
        vm.chatActive = false;
        vm.replyMessage = '';
        vm.chatId = null;
        vm.ReceiverId = null;
        vm.pageIndex = 1;
        vm.pageSize = 15;
        vm.userNativeId = localStorage.getItem("nativeId");
        vm.isPreviousMessagesEmpty = false;
        $rootScope.searchInput = ''
        $rootScope.showStaffMemberSearchResult = false


        $scope.$on("newMessage", (ev, arg) => {
            if(vm.isPreviousMessagesEmpty === false){
             
              chatservice.getMessages(Number(vm.chatId), vm.pageIndex, vm.pageSize).then((data) => {   
                if(data.length != 0){
                  data.forEach((message) => {
                    vm.messages.unshift(message);
                  })
                  $timeout(function ()
                  {
                      scrollToLastFocusOfChat(0, arg.lastScrollHeight);        
                  }, 0);
                  vm.pageIndex = vm.pageIndex + 1;
               
                }
                else{
                
                  vm.isPreviousMessagesEmpty = true;
                }    
              })
            }
            
        })
      

        // Methods
        vm.searchStaffMembers = function(){
          $rootScope.showStaffMemberSearchResult = true
          if($rootScope.searchInput == '' || $rootScope.searchInput === null || angular.isUndefined($rootScope.searchInput)){
            $rootScope.showStaffMemberSearchResult = false
            return
          }
          chatservice.getStaffMemberBySearchText($rootScope.searchInput).then((data) => {
            vm.members = data
          })
        }
        vm.goBack = function(){
            vm.chatActive = !vm.chatActive;
            vm.pageIndex = 1;
            vm.chatId = null;
            vm.ReceiverId = null;
            $rootScope.dialoguserid = -1;
            vm.isPreviousMessagesEmpty = false;
        }
      $rootScope.closeChatBox = function(){
        if(vm.chatActive){
          vm.goBack();
        }
      };

       vm.toggleChat = function(contact)
        {
          $rootScope.searchInput = null;
          $rootScope.showStaffMemberSearchResult = false
            vm.name = contact.LastName + " " +  contact.OtherNames;
            vm.ReceiverId = contact.Id;
            chatservice.getChatInfo(Number(vm.ReceiverId)).then((data) => {
                vm.chatId = data.chatId;
                chatservice.getMessages(Number(vm.chatId), vm.pageIndex, vm.pageSize).then((data) => {
                    vm.messages= data.reverse();
                    scrollToBottomOfChat(0);
                    vm.pageIndex = vm.pageIndex + 1;
                })
            })
            vm.chatActive = !vm.chatActive;
      
            if ( vm.chatActive )
            {
               //################################################################################################
               $rootScope.dialoguserid = contact.Id;
        
              var  ReceiverId = contact.Id;
              $rootScope.unseenMessagesObj = $rootScope.unseenMessagesObj.hasOwnProperty(
                ReceiverId
              )
                ? RemoveReadMsg()
                : $rootScope.unseenMessagesObj;
      
              function RemoveReadMsg() {
                delete $rootScope.unseenMessagesObj[ReceiverId];
      
                return $rootScope.unseenMessagesObj;
              }
              $rootScope.$broadcast(
                "unseenMessagesObj",
                $rootScope.unseenMessagesObj
              );
       //################################################################################################
                vm.replyMessage = '';
            }
            
        }
       
                
        vm.reply = function reply()
        {
            if ( vm.replyMessage === '' )
            {
                return;
            }

            var MessageInfo = {
                receiverId: Number(vm.ReceiverId),
                textMessage: vm.replyMessage,
                chatId: Number(vm.chatId)
              };
              chatservice.SendMessage(
                MessageInfo.receiverId,
                MessageInfo.textMessage,
                MessageInfo.chatId
              );
        
            vm.replyMessage = '';
        }

        function scrollToBottomOfChat(speed)
        {
            var chatDialog = angular.element('#chat-dialog');
           
            $timeout(function ()
            {
                chatDialog.animate({
                    scrollTop: chatDialog[0].scrollHeight
                }, speed);
               
            }, 0);

        }

        function scrollToLastFocusOfChat(speed, lastScrollHeight){
          var chatDialog = angular.element('#chat-dialog');
          var scrollDiffernce = Number(chatDialog[0].scrollHeight) - Number(lastScrollHeight)
          var newScrollTop = Number(chatDialog[0].scrollTop) + scrollDiffernce  
          //chatDialog[0].scrollTop = Number(chatDialog[0].scrollTop) + scrollDiffernce   

          $timeout(function ()
            {
                chatDialog.animate({
                    scrollTop: newScrollTop
                }, speed);
               
            }, 0);
        }
    }

})();