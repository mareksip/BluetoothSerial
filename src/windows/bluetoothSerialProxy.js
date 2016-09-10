var cordova = require('cordova');
var bluetoothSerialName = "bluetoothSerial";
var bluetoothSerial = {
    list: function(successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, bluetoothSerialName, "list", []);
    },
    connect: function(args, successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, bluetoothSerialName, "connect", [args]);
    },
    read: function(successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, bluetoothSerialName, "read", []);
    },
    write: function(args, successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, bluetoothSerialName, "write", [args]);
    },
    disconnect: function(successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, bluetoothSerialName, "disconnect", []);
    }
  }
  //require("cordova/exec/proxy").add("bluetoothSerial", module.exports);
module.exports = bluetoothSerial;
