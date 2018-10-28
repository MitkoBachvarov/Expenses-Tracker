let app = angular.module('expensesApp', ['ngRoute']);

// helper
let myHelpers = {
    //from http://stackoverflow.com/questions/2280104/
    dateObjToString: function(dateObj){
        let year, month, day;
        year = String(dateObj.getFullYear());
        month = String(dateObj.getMonth() + 1);
        if(month.length === 1){
            month = "0" + month;
        }
        day = String(dateObj.getDate());
        if(day.length === 1) {
            day = "0"+ day
        }
        return year + "-" + month + "-" + day;
    },
    stringToDateObj: function(string){
        return new Date(string.substring(0,4), string.substring(5,7)-1, string.substring(8,10));
    }
}

app.config(($routeProvider) =>{
    $routeProvider
        .when('/', {
            templateUrl: 'views/expenses.html',
            controller: 'ExpensesViewController'
        })
        .when('/expenses', {
            templateUrl: 'views/expenses.html',
            controller: 'ExpensesViewController'
        })
        .when('/expenses/new', {
            templateUrl: 'views/expenseForm.html',
            controller: 'ExpenseViewController'
        })
        .when('/expenses/edit/:id', {
            templateUrl: 'views/expenseForm.html',   // should lead to /expensesForm.html
            controller: 'ExpenseViewController'
        })
        .otherwise({
            redirectTo: '/'
        })
})


// SERVICE
// This service will take care of keeping track of the expenses and other operations
app.factory('Expenses',function($http){
    let service = {};

    service.entries = [];

    $http.get('data/get_all.json').               // could be a link where the JSON file is rendered
        then(function onSuccess(data){   // .success was deprecated. This is how it should work now
            // console.log(JSON.stringify(data.data));
            service.entries = data.data;
            console.log(data.data);

            angular.forEach(element => {
                element.date = myHelpers.stringToDateObj(element.date);
            });

        })

        service.getNewId = function(){
      if(service.newId){
          service.newId++;
          return service.newId;
      } else {
          let entryMaxId =  _.max(service.entries, function(entry){return entry.id});
          service.newId = entryMaxId.id+1;
          return service.newId;
      }
    }

    service.getById = function(id){
        return _.find(service.entries, function(entry){return entry.id == id;})
    }

    service.save = function(entry){

        let toUpdate = service.getById(entry.id);

        if(toUpdate){               // check if there was a change in the item and merge the clone in the item
            _.extend(toUpdate, entry); 
        } else {
            entry.id = service.getNewId();
            service.entries.push(entry);
        }
    }

    service.remove = function(entry){
        service.entries = _.reject(service.entries, function(element){  // ._reject will recieve a condition and will return a collection without the elements that satisfy the condition
            return element.id === entry.id; // the id is the same as the id of the entry
        })
    }

    return service;
})  


app.controller("HomeViewController", ['$scope', function($scope) {
    $scope.appTitle = 'Simple Expenses Tracker';
}])

app.controller("ExpensesViewController", ['$scope', 'Expenses', function($scope, Expenses) {
    $scope.expenses = Expenses.entries;

    $scope.remove = function(expense){
        Expenses.remove(expense);
    };

    $scope.$watch(function() {
        return Expenses.entries;
    }, function(entries){
        $scope.expenses = entries
    })
}]);

app.controller("ExpenseViewController", ['$scope', '$routeParams', '$location', 'Expenses', function($scope, $routeParams, $location, Expenses) {
   function ExpenseViewController($scope, $routeParams){
       $scope.paramValue = templateUrl('/expensesForm.html');
   }
   
   if (!$routeParams.id) {
       $scope.expense = {
          date: new Date()
       }
   } else {
       $scope.expense = _.clone(Expenses.getById($routeParams.id));  //clone the object so that it doesn't get automatically changed
   }

   $scope.save = function(){
       Expenses.save($scope.expense);
       $location.path('/');
   }
}])

app.filter('capitalize', () =>{
    return (input) => {
         return  (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : " ";
    }
})

app.directive('zvaExpense', function(){
    return {
        restrict: 'E',
        templateUrl: 'views/expense.html'
         //template: '<div> {{expense.description}} - {{expense.amount}}</div>'   
              // The idea of the template is to write custom HTML if needed
    }
})