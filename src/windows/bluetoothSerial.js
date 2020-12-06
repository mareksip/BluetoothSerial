var rfcomm = Windows.Devices.Bluetooth.Rfcomm;
var sockets = Windows.Networking.Sockets;
var streams = Windows.Storage.Streams;
var deviceInfo = Windows.Devices.Enumeration.DeviceInformation;

var cordova = require('cordova');

var connService;
var connSocket;
var connWriter;
var connReader;
var connDevice;

module.exports = {

  list: function (successCallback, errorCallback) {

    setTimeout(function () {
      try {
        var selector =
          rfcomm.RfcommDeviceService.getDeviceSelector(
            rfcomm.RfcommServiceId.serialPort);
        var parsedDevices = [];

        deviceInfo.findAllAsync(selector, null).then(function (devices) {
          if (devices.length > 0) {

            for (var i = 0; i < devices.length; i++) {
              parsedDevices.push({
                id: devices[i].id,
                name: devices[i].id
                /*temporarily replaced by id untill Microsoft solves problem with incorrect names
                http://stackoverflow.com/questions/42734859/deviceinformation-findallasync-deviceinformation-returns-incorrect-name-property
                */
              })
            }
            successCallback(parsedDevices);
          } else {
            errorCallback("No devices found.");
          }

        }, function (error) {
          errorCallback({
            error: "list",
            message: error.message
          });
        });
      } catch (ex) {
        errorCallback(ex);
      }
    }, 0);
  },
  connect: function (args, successCallback, errorCallback) {
    setTimeout(function () {
      try {
        var mac = args;
        rfcomm.RfcommDeviceService.fromIdAsync(mac).then(
          function (service) {
            if (service === null) {
              errorCallback("Access to the device is denied because the application was not granted access");
            }

            connService = service;

            if (connSocket) {
              successCallback(true);
            }
            else {
              connService.getSdpRawAttributesAsync().then(
                function (attributes) {
                  connSocket = new sockets.StreamSocket();
                  setTimeout(function () {
                    connSocket.connectAsync(
                      connService.connectionHostName,
                      connService.connectionServiceName).then(function () {
                        connWriter = new streams.DataWriter(connSocket.outputStream);
                        connReader = new streams.DataReader(connSocket.inputStream);
                        successCallback(true);
                      }, function (error) {
                        errorCallback("Failed to connect to device, with error: " + error);
                      });
                  }, 100);
                },
                function (error) {
                  errorCallback("Failed to retrieve SDP attributes, with error: " + error);
                });
            }
            /*
                        return connService;
 
                    }, function (error) {
                        errorCallback("Failed to connect to device, with error: " + error);
                    }).then(function () {
                        connSocket = new sockets.StreamSocket();
                        return connSocket.connectAsync(
                            connService.connectionHostName,
                            connService.connectionServiceName,
                            sockets.SocketProtectionLevel.plainSocket);
                    }).then(function () {
                        connWriter = new streams.DataWriter(connSocket.outputStream);
 
                        connReader = new streams.DataReader(connSocket.inputStream);
                        successCallback(true);
                    });
                 */

          })

      } catch (ex) {
        errorCallback(ex)
      }
    }, 0);
  },
  read: function (successCallback, errorCallback) {
    if (args.length != 1) {
      errorCallback('invalid arguments, please specify number of bytes to read');
      return;
    }

    if (this.dataReader == null) {
      errorCallback('Not connected');
      return;
    }

    var numBytes = args[0];

    setTimeout(function () {
      me.dataReader.loadAsync(numBytes).then(function () {
        var array = new Array(numBytes);
        me.dataReader.readBytes(array)
        return array;
      }).done(successCallback, errorCallback);
    }, 0);

  },
  write: function (args, successCallback, errorCallback) {
    setTimeout(function () {
      try {
        var input = args;
        if (connWriter == null) {
          fail("No device connected");
          return;
        }

        var bytes = [];

        if (input.length == undefined) {
          input = String.fromCharCode.apply(null, new Uint8Array(input));

        }
        if (input.length != undefined) {
          for (var i = 0; i < input.length; ++i) {
            bytes.push(input.charCodeAt(i));
          }
        }

        connWriter.writeBytes(bytes);

        connWriter.storeAsync().then(function () {
          // success sending message

        }, function (error) {
          errorCallback("Failed to send the message to the device, error: " + error);
        }).done(successCallback, errorCallback);
      } catch (error) {
        errorCallback("Sending message failed with error: " + error);
      }
    }, 0);
  },
  disconnect: function (successCallback, errorCallback) {
    setTimeout(function () {
      try {
        if (connWriter) {
          connWriter.detachStream();
          connWriter = null;
        }
        if (connService) {
          connService.close();
          connService = null;
        }
        if (connSocket) {
          connSocket.close();
          connSocket = null;
        }
        successCallback(true);
      } catch (ex) {
        errorCallback(ex);
      }
    }, 0);
  },
  isConnected: function (successCallback, errorCallback) {
    setTimeout(function () {
      try {
        if (connWriter === null) {
          //no device connected
          successCallback(false);
        } else {
          errorCallback(true);
        }
      } catch (ex) {
        errorCallback(false);
      }

    }, 0);
  },
  fail: function (message) {
    console.log(message);
  }
};

require("cordova/exec/proxy").add("bluetoothSerial", module.exports);
    //module.exports = bluetoothSerial;
