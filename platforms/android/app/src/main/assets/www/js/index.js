document.addEventListener('deviceready', onDeviceReady, false);

class Queue {
    constructor() { this._items = []; }
    enqueue(item) { this._items.push(item); }
    dequeue()     { return this._items.shift(); }
    get size()    { return this._items.length; }
}

function process_outgoing(input){
    document.querySelectorAll(".rw-new-message")[0].value = input;
    document.querySelectorAll(".rw-send")[0].disabled = false;
    document.querySelectorAll(".rw-send")[0].click();
}

window.incoming_texts = new Queue();
window.speaking_now = false;

function process_incoming(){
    
    if(window.incoming_texts.size != 0 && window.speaking_now == false){
        window.speaking_now = true;
        var text = window.incoming_texts.dequeue();
        if(text == "local_weather"){

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "https://api.weatherapi.com/v1/current.json?key=245213406eb4421886b114336210608&aqi=no&q=" + window.IP, false);
            xmlHttp.send(null);
            var response = JSON.parse(xmlHttp.responseText);

            var city_name = response['location']['name'] + ", " + response['location']['country'];
            var weather_brief = response['current']['condition']['text'].toLowerCase();
            var temp =  response['current']['temp_c'];

            if(Date.now() % 2 == 0){
                text = `Weather in ${city_name} is ${weather_brief} at ${temp} degree celsius.`

            }else{
                text = `It is ${weather_brief} in ${city_name} at ${temp} degree celsius.`
            }
            setTimeout(() => {
                try {
                    document.getElementById("rw-messages").innerHTML = document.getElementById("rw-messages").innerHTML.replace("local_weather", text);                        
                } catch (error) {
                    
                }
            }, 1500);

        }else if(text.startsWith("set_timer")){

            var duration = parseInt(text.split(":")[1]);
            var old_text = text;

            setTimeout(() => {
                try {
                    document.getElementById("rw-messages").innerHTML = document.getElementById("rw-messages").innerHTML.replace(old_text, "I have set a timer for you. I'll tell you when it fires up.");    
                } catch (error) {
                }
            }, 1500);


            text = "I have set a timer for you. I'll tell you when it fires up.";

            
            setTimeout(function(){
                window.incoming_texts.enqueue("Your timer fires up now!");
            }, duration * 1000);
        
        }else if(text.startsWith("set_reminder")){
        
            var data = text.split(/:(.+)?/, 2)[1].split(",") // [0]: reminder name. [1]: reminder time.
            var old_text = text;

            setTimeout(() => {
                try {
                    document.getElementById("rw-messages").innerHTML = document.getElementById("rw-messages").innerHTML.replace(old_text, "I have set a reminder for you about " + data[0] +". I'll tell you when it fires up.");    
                } catch (error) {
                    
                }
            }, 1500);

            text = "I have set a reminder for you about " + data[0] +". I'll tell you when it fires up.";
            var target = Date.parse(data[1]);

            setTimeout(function(){
                window.incoming_texts.enqueue("It's time I reminded you about " + data[0] + ".");
            }, target - Date.now());
        
        }else if(text.startsWith("send_text")){

            var data = text.split(/:(.+)?/, 2)[1].split(",") // [0]: text. [1]: number.
            var old_text = text;
            sms_app.sendSms(data[1], data[0], function(message) {
                window.incoming_texts.enqueue("I sent the message successfully.");
                setTimeout(() => {
                    try {
                        document.getElementById("rw-messages").innerHTML = document.getElementById("rw-messages").innerHTML.replace(old_text, "I sent the message successfully.");    
                    } catch (error) {
                        
                    }
                }, 1500);
    
    
            }, function(error) {
                setTimeout(() => {
                    try {
                        document.getElementById("rw-messages").innerHTML = document.getElementById("rw-messages").innerHTML.replace(old_text, "There was an error sending the message.");    
                    } catch (error) {
                        
                    }
                }, 1500);
    

                window.incoming_texts.enqueue("There was an error sending the message.");
            });
            text = "";



        }
        window.plugins.speechRecognition.stopListening();
        TTS.speak({
            text: text,
            rate: 1.25,
        }, function () {
            window.speaking_now = false;
            if(window.incoming_texts.size == 0){
                startRecognition();
            }
        }, function (reason) {
            alert(reason);
        });
    }
}


function startRecognition(){
    window.plugins.speechRecognition.startListening(function(result){
        process_outgoing(result[0]);
    }, function(err){
        startRecognition();
    }, {
        language: "en-US",
        showPopup: false,
        
    });
}

var sms_app = {
    sendSms: function(number, message, success, error) {

        var options = {
            replaceLineBreaks: false,
            android: {
                intent: 'INTENT'  
            }
        };
        sms.send(number, message, options, success, error);
    },
    checkSMSPermission: function() {
        var success = function (hasPermission) { 
            if (hasPermission) {
            }
            else {
            }
        };
        var error = function (e) { alert('Something went wrong:' + e); };
        sms.hasPermission(success, error);
    },
    requestSMSPermission: function() {
        var success = function (hasPermission) { 
            if (!hasPermission) {
                sms.requestPermission(function() {
                    console.log('[OK] Permission accepted')
                }, function(error) {
                    console.info('[WARN] Permission not accepted')
                })
            }
        };
        var error = function (e) { alert('Something went wrong:' + e); };
        sms.hasPermission(success, error);
    }
};

function onDeviceReady() {
    sessionStorage.clear()
    localStorage.clear()
    window.plugins.speechRecognition.isRecognitionAvailable(function(available){
        if(!available){
            alert("Sorry, not available.");
        }
        window.plugins.speechRecognition.hasPermission(function (isGranted){
            if(isGranted){
            }else{
                window.plugins.speechRecognition.requestPermission(function (){
                }, function (err){
                    alert(err);
                });
            }
        }, function(err){
            alert(err);
        });
    }, function(err){
        alert(err);
    });
    sms_app.requestSMSPermission();
    window.WebChat.default(
        {
          customData: { language: "en" },
          socketUrl: "http://20.199.120.14:5005",
          socketPath: "/socket.io/",
          onSocketEvent: {
              'bot_uttered': function(data){
                  window.incoming_texts.enqueue(data['text'])
                },
          },
          embedded: true,
        },
        null
      );
    setInterval(process_incoming, 1);
}
