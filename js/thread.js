var functions = []; // fake variable to prevent IDE showing errors

function workerBody() {
  self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
      case 'execute':
        if (!functions[data.fName]) {
          self.postMessage({
            cmd: 'reject',
            reason: 'There is no such function: ' + data.fName,
            id: data.id
          });
        } else {
          try {
            var retValue = functions[data.fName].apply(this, data.arguments);

            self.postMessage({
              cmd: 'resolve',
              value: retValue,
              id: data.id
            });
          } catch(e) {
            self.postMessage({
              cmd: 'reject',
              reason: 'Error inside function: ' + e.toString(),
              id: data.id
            });
          }
        }
        break;
      case 'stop':
        self.close();
        break;
    }
  }, false);
}

var workerText = workerBody.toString().match(/function[^{]+\{([\s\S]*)}$/)[1];


class WorkerExecutor {
  constructor(options) {
    var functions = options.functions || [],
      scripts = options.scripts || [],
      functionsLength = functions.length,
      functionsAsString = 'var functions = {',
      scriptsLength = scripts.length,
      scriptsAsString = 'importScripts(',
      newWorkerText = '';

    if (scriptsLength) {
      _.each(scripts, function(src, i) {
        scriptsAsString += '\'' + src + '\'' + ((i + 1 === scriptsLength) ? ');' : ',');
      });
      newWorkerText += scriptsAsString;
    }

    newWorkerText += workerText;

    if (functionsLength) {
      _.each(functions, function(f, i) {
        functionsAsString += f.name + ': ' + f.toString() + ((i + 1 === functionsLength) ? '};' : ',');
      });
      newWorkerText += functionsAsString;
    }

    this.blob = new Blob([newWorkerText], {type: 'text/javascript'});
    this.query = [];
  }

  ensureWorker() {
    if (!this.worker) {
      this.worker = new window.Worker(window.URL.createObjectURL(this.blob));
      this.worker.onmessage = (e) => {
        var data = e.data;
        switch (data.cmd) {
          case 'resolve':
            this.query[data.id].resolve(data.value, data.data);
            break;
          case 'reject':
            this.query[data.id].reject(data.reason, data.data);
            break;
        }
      }
    }
  }

  execute(name, ...rest) {
    this.ensureWorker();
    var result = new $.Deferred();
    var id = this.query.push(result) - 1;
    this.worker.postMessage({
      cmd: 'execute',
      fName: name,
      arguments: rest,
      id: id
    });
    return result;
  }

  destroy() {
    if (this.worker) {
      this.worker.postMessage({
        cmd: 'stop'
      });
    }
    if (this.query.length) {
      _.each(this.query, (deferred) => {
        deferred.reject();
      });
    }
  }

}





