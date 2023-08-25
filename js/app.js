let m;
let words_to_say;
let selectedTime = 60;
let timeFireInterval;
var timerInterval;
// Get the text area and speak button elements
let textArea = document.getElementById("text");
let speakButton = document.getElementById("speak-button");
let justSpeakButton = document.getElementById("just-speak-button");
let rowingAssistantActive = false;

let cbConnecting = function() {
    document.querySelector('#connect').innerText = 'Connecting';
    document.querySelector('#connect').disabled = true;
    document.querySelector('#monitor-information').textContent = 'Please wait...';
};

let cbConnected = function() {
    document.querySelector('#connect').innerText = 'Disconnect';
    document.querySelector('#connect').disabled = false;

    m.getMonitorInformation()
        .then(monitorInformation => {
            let mi = document.querySelector('#monitor-information');
            mi.textContent = 'FW: ' + monitorInformation.firmwareRevision + ' | ' +
                'HW: ' + monitorInformation.hardwareRevision + ' | ' +
                'MNF: '+ monitorInformation.manufacturerName + ' | ' +
                'SN: ' + monitorInformation.serialNumber;
        })
        .catch(error => {
            document.querySelector('#monitor-information').textContent = error;
        });
};

let cbDisconnected = function() {
    document.querySelector('#connect').innerText = 'Connect';
    document.querySelector('#connect').disabled = false;
    document.querySelector('#monitor-information').textContent = '';
};

let cbMessage = function(m) {
    let div = document.getElementById(m.type);
    if (!div) {
        div = document.createElement('div');
        div.id = m.type;
        document.querySelector('#notifications').appendChild(div);
    }

    /* iterate data elements and create / update value */
    for (let k in m.data) {
        if (m.data.hasOwnProperty(k)) {
            let selector = '#' + m.type + ' span.' + k;
            let s = document.querySelector(selector);
            if (!s) {
                let p = document.createElement('div');      /* one block per item */

                let desc = document.createElement('span');
                desc.className = 'element';
                desc.textContent = pm5fields[k].label;

                s = document.createElement('span');         /* create item */
                s.className = 'value ' + k;

                p.appendChild(desc);                        /* key name */
                p.appendChild(s);                           /* data element */
                div.appendChild(p);                         /* append block to container */

                p.addEventListener('click', function(e) {
                    toggleClass(this, 'highlight');
                });
            }
            s.textContent = pm5fields[k].printable(m.data[k]);
        }
    }
};

document.addEventListener('DOMContentLoaded', function(e) {
    const timeButtons = document.querySelectorAll('input[name="time"]');
    speakButton = document.getElementById("speak-button");
    justSpeakButton = document.getElementById("just-speak-button");
    
    Array.prototype.forEach.call(timeButtons, function(btn) {
    btn.addEventListener('change', function(){
        selectedTime = this.value;
        clearInterval(timeFireInterval);
        clearInterval(timerInterval);
        document.getElementById("time-to-speak").innerHTML = "";
        rowingAssistantActive = false;
        setRowAssistantInactive();

        });
    });

    justSpeakButton.addEventListener("click", function() {
        utteranceVoice();
        });

    // Add an event listener to the speak button
    speakButton.addEventListener("click", function() {
        if (!rowingAssistantActive) {
            startTimerStatus();
            setRowAssistantActive()
            voiceInterval();
        } else {
            setRowAssistantInactive();
        }
    });

    m = new PM5(cbConnecting,
        cbConnected,
        cbDisconnected,
        cbMessage);


    document.querySelector('#connect').addEventListener('click', function() {
        if (!navigator.bluetooth) {
            alert('Web Bluetooth is not supported! You need a browser and ' +
                'platform that supports Web Bluetooth to use this application.');
        }

        if (m.connected()) {
            m.doDisconnect();
        } else {
            m.doConnect();
        }
    });

    document.querySelector('#toggle-instructions').addEventListener('click', function() {
        let e = document.querySelector('#instruction-text');
        let button_text = 'Show instructions';

        toggleClass(e, 'hidden');
        if (!e.classList.contains('hidden')) {
            button_text = 'Hide instructions';
        }

        document.querySelector('#toggle-instructions').innerText = button_text;
    });
});

let setRowAssistantInactive = function() {
    button_text = 'Start Row Assistant';
    let element = document.querySelector('#speak-button');
    element.innerText = button_text;
    element.classList.remove("active-assistant-button");
    element.classList.add("speak-button");
    rowingAssistantActive = false;
    clearInterval(timeFireInterval);
    clearInterval(timerInterval);
    document.getElementById("time-to-speak").innerHTML = "";
    document.getElementById("progressbar-inner").style.width="0%";
};

let voiceInterval = function() {
    timeFireInterval = setInterval(() => {
        // Set the text and voice of the utterance
        startTimerStatus();
        utteranceVoice();
        }, selectedTime * 1000);
    };

let utteranceVoice = function() {
    let divs = document.querySelectorAll("#multiplexed-information [class*='highlight']")
    divs.forEach(element => {

        let utterance = new SpeechSynthesisUtterance(element.textContent);
        utterance.rate = .8;
        // utterance.voice = window.speechSynthesis.getVoices()[0];

        // Speak the utterance
        window.speechSynthesis.speak(utterance);
    });
};

let startTimerStatus = function() {
        clearInterval(timerInterval);
        timeToSpeak = new Date().getTime() + (selectedTime * 1000);
        timerInterval = setInterval(function() {
            var now = new Date().getTime();
            // get the percent complete
            
            
            var distance = timeToSpeak - now;
            var seconds = Math.floor(distance / 1000);
            var percentComplete = (seconds / selectedTime) * 100;
            var percentCompleteString = percentComplete + "%";
            document.getElementById("progressbar-inner").style.width=percentCompleteString;
            // document.getElementById("time-to-speak").innerHTML = seconds + "s ";
        }, 1000);
    };

let setRowAssistantActive = function() {
    button_text = 'Row Assistant Active';
    let element = document.querySelector('#speak-button');
    element.innerText = button_text;
    element.classList.remove("speak-button");
    element.classList.add("active-assistant-button");
    rowingAssistantActive = true;
};