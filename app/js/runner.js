var temp = require('temp');
var path = require('path');
var fs = require('fs');
temp.track();

var Runner = (function () {
  var my = {};
  var filePath = '';

  function runFile() {
    return "kidscode.rb";
  }

  function runRuby() {
    setRunButtonToStop();
    my.process = cp.spawn('ruby',  [filePath]);
    my.running = true;
    my.process.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    my.process.on('close', function (res) {
      my.running = false;
      temp.cleanup();
      console.log('child process exited with code ' + res);
      setStopButtonToRun();
    });
  };

  function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  };
  my.running = false;
  my.process = null;

  my.run = function (code) {
    my.saveCode(runFile(), code);
  };

  my.stop = function () {
    if(my.process != null) {
      my.process.kill('SIGHUP');
    }
    my.running = false;
  };

  my.saveCode = function (fileName, code) {
    temp.open(fileName, function(err, info) {
      filePath = info.path;
      ensureDirectoryExistence(filePath);
      fs.writeFile(info.path, my.addRequiresToCode(code), null, function() {
        runRuby();
      });

      if (err) {
        console.log("Write failed: " + err);
      } else {
        console.log ("Write completed.");
      };
    });
  };

  my.addRequiresToCode = function (code) {
    newCode = "# -*- coding: utf-8 -*-\n";
    newRequire = "require '" + process.cwd() + "/lib/kidsruby" + "'\n";
    newCode += newRequire;
    newCode += code;
    return newCode;
  };

  my.write = function (data) {
    my.process.stdin.write(data);
  }

  return my;
}());
