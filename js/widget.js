function ShellCtrl($scope) {
  chrome.extension.sendMessage({speak: "talk!"}, function(response) {
    $scope.text = response.say;
    $scope.$apply();
  });
}
