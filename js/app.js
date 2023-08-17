let m;
let words_to_say;

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
                    let utterance = new SpeechSynthesisUtterance();

                    // get span element
                    // Set the text and voice of the utterance
                    console.log(pm5fields[k].printable(m.data[k]));
                    utterance.text = pm5fields[k].printable(m.data[k]) ;
                    //set speech Synthesis voice speed 
                    utterance.rate = 0.75;
                    utterance.voice = window.speechSynthesis.getVoices()[0];
                    // Speak the utterance
                    window.speechSynthesis.speak(utterance);
                });
            }
            s.textContent = pm5fields[k].printable(m.data[k]);
        }
    }
};

document.addEventListener('DOMContentLoaded', function(e) {


// Get the text area and speak button elements
let textArea = document.getElementById("text");
let speakButton = document.getElementById("speak-button");

// Add an event listener to the speak button
speakButton.addEventListener("click", function() {
    // Get the text from the text area
    let text = textArea.value;
  
    // Create a new SpeechSynthesisUtterance object
    let utterance = new SpeechSynthesisUtterance();
    utterance.rate = .8;
  
    // Set the text and voice of the utterance
    utterance.text = text;
    utterance.voice = window.speechSynthesis.getVoices()[0];
  
    // Speak the utterance
    window.speechSynthesis.speak(utterance);
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
