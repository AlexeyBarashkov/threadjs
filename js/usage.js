var workerExecutor = new WorkerExecutor({
  scripts: [
    location.origin + '/underscore.js'
  ],
  functions: [
    function sum() {
      var sum = 0;
      for (var i = 0; i < arguments.length; i++) {
        sum += arguments[i];
      }
      return sum;
    },
    function sin(x) {
      return Math.sin(x);
    },
    function errorFunction() {
      var a = {};
      a.abc();
    },
    function externalLibraryUsage(arr) {
      return _.map(arr, function(item) {
        return item+1;
      });
    }
  ]
});


workerExecutor.execute('sum', 1, 2, 3).done(function(result) {
  console.log('Sum function result: ' + result + '; arguments were: [1,2,3]');
});

workerExecutor.execute('sin', 0).done(function(result) {
  console.log('Sin function result: ' + result + '; arguments were: [0]');
});

workerExecutor.execute('errorFunction').fail(function(reason) {
  console.log('ErrorFunction rejects Deferred with reason: "' + reason + '"');
});

workerExecutor.execute('externalLibraryUsage', [1,2,3]).done(function(result) {
  console.log('externalLibraryUsage function result: ' + result + '; arguments were: [ [1,2,3] ]');
});



