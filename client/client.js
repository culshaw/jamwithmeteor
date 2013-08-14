(function(Meteor) {
    var hasWebkitAudio = typeof(webkitAudioContext) === "function" || typeof(webkitAudioContext) === "object";

    if(!hasWebkitAudio) return false;

    var context = new webkitAudioContext();

    if(!context) return false;


    Deps.autorun(function () {
        Meteor.subscribe("locations");        
    });

    Meteor.call('takeSample', {}, function(err, result) {
        if(!err)
            console.log(result);

            if(result.id != 0) {
                Session.set('sample', result.id);

                bufferLoader = new BufferLoader(
                    context,
                    [
                        result.path+'kick.wav',
                        result.path+'snare.wav',
                        result.path+'hihat.wav'
                    ],
                    finishedLoading
                );

                bufferLoader.load();
            } else {
                // Render correct HTML?
                $('body').append(Template.instrumentGuitar());

                oscillator = new OscilatorCreator(context);
            }
    })

    function OscilatorCreator(context) {
        this.oscillator = context.createOscillator(); // Create bass guitar
        this.gainNode = context.createGainNode(); // Create boost pedal
        this.biQuad = context.createBiquadFilter();
        this.context = context;

        this.oscillator.connect(this.gainNode); // Connect bass guitar to boost pedal
        this.gainNode.connect(this.context.destination); // Connect boost pedal to amplifier

        this.oscillator.connect(this.biQuad);
        this.biQuad.connect(this.context.destination)

        this.biQuad.type = 3;
        this.biQuad.frequency.value = 120;
        this.biQuad.Q.value = 0;
        this.biQuad.gain.value = 0;

        this.gainNode.gain.value = 0.3; // Set boost pedal to 30 percent volume
        this.oscillator.noteOn(0); // Play bass guitar instantly

        node = this;
        document.getElementById('oscillator').addEventListener('touchmove', function(ev) { node.onInteract(ev, node); });
    }

    OscilatorCreator.prototype.onInteract = function(ev, node) {
        touch0 = Math.atan2(ev.touches[0].clientX, ev.touches[0].clientY)*100;
        //touch1 = Math.atan2(ev.touches[1].clientX, ev.touches[1].clientY);

        //console.log(touch0);
        console.log(node);

        //oscillator.type = parseInt(touch0); // Square wave
        //console.log(node.biQuad.frequency.value);
        node.oscillator.frequency.value = parseInt(touch0)
        //node.biQuad.frequency.value = parseInt(touch0)
        //node.oscillator.frequency.value = 100; // frequency in hertz
    };

    function BufferLoader(context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
    }

    BufferLoader.prototype.loadBuffer = function(url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var loader = this;

        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function(error) {
                console.error('decodeAudioData error', error);
                }
            );
        }
        request.onerror = function() {
            alert('BufferLoader: XHR error');
        }

        request.send();
    }

    BufferLoader.prototype.load = function() {
        for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
    }

    function finishedLoading(bufferList) {
        // Create two sources and play them both together.
        var source1 = context.createBufferSource();
        var source2 = context.createBufferSource();
        
        var kick = bufferList[0],
            snare = bufferList[1],
            hihat = bufferList[2];
        
        document.addEventListener('keypress', function(ev) {
            switch (ev.charCode) {
                case 97:
                    playSound(kick, context.currentTime+0.100)
                break;
                case 115:
                    playSound(snare, context.currentTime+0.100)
                break;
                case 100:
                    playSound(hihat, context.currentTime+0.100)
                break;
            }           
        })

        document.getElementById('kick').addEventListener('touchstart', function() { playSound(kick, context.currentTime+0.100) }, false);
        document.getElementById('snare').addEventListener('touchstart', function() { playSound(snare, context.currentTime+0.100) }, false);
        var startTime = context.currentTime + 0.100;
        var tempo = 100; // BPM (beats per minute)
        var eighthNoteTime = (60 / tempo) / 2;

        for (var bar = 0; bar < 2; bar++) {
          var time = startTime + bar * 8 * eighthNoteTime;
          // Play the bass (kick) drum on beats 1, 5
          playSound(kick, time);
          playSound(kick, time + 4 * eighthNoteTime);

          // Play the snare drum on beats 3, 7
          playSound(snare, time + 2 * eighthNoteTime);
          playSound(snare, time + 6 * eighthNoteTime);

          // Play the hi-hat every eighth note.
          for (var i = 0; i < 8; ++i) {
            playSound(hihat, time + i * eighthNoteTime);
          }
        }
    }

    function playSound(buffer, time) {
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.start = source.noteOn;
        source.connect(context.destination);
        source.start(time);
    }

    

})(Meteor);