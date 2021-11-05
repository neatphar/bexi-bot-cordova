cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-speechrecognition.SpeechRecognition",
      "file": "plugins/cordova-plugin-speechrecognition/www/speechRecognition.js",
      "pluginId": "cordova-plugin-speechrecognition",
      "merges": [
        "window.plugins.speechRecognition"
      ]
    },
    {
      "id": "cordova-plugin-tts.tts",
      "file": "plugins/cordova-plugin-tts/www/tts.js",
      "pluginId": "cordova-plugin-tts",
      "clobbers": [
        "TTS"
      ]
    },
    {
      "id": "cordova-sms-plugin.Sms",
      "file": "plugins/cordova-sms-plugin/www/sms.js",
      "pluginId": "cordova-sms-plugin",
      "clobbers": [
        "window.sms"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-speechrecognition": "1.1.2",
    "cordova-plugin-tts": "0.2.3",
    "cordova-plugin-whitelist": "1.3.5",
    "cordova-sms-plugin": "1.0.1"
  };
});