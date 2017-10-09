var stick;
var pivot;
var ycoord;
var isDragging = false;
var springMotionInterval;
var counter = 0;
var lastCounter = 1;
var data = [];
var numDataPoints = 100;
var totalNumDataPoints = 0;
var graph;
var isPlaying = false;

function setup(playerDuration) {
    // create joystick
    //stick = $("#slider-vertical");
    //pivot = $("#pivot");
    ycoord = Number($("#amount")[0].value);
    //setStick(0);

    // make stick draggable.
    //$("#pivot-wrapper").on("mousedown", startDragging);
    //$("#pivot-wrapper").on("mousemove", drag);
    //$("#pivot-wrapper").on("mouseup", stopDragging);

    // instantiate data to null
    totalNumDataPoints = (playerDuration + 1) * 10;
    for (var i = 0; i <= totalNumDataPoints; i++) {
        data[i] = null;
    }
    data[totalNumDataPoints] = 0;

    // create graph to plot what's in data.
    graph = new Highcharts.Chart({
        "chart": {
            "renderTo": 'graph'
        },

        title: {
        text: 'Sense Making Curve'
        },

        "yAxis": {
            "min": -1,
            "max": 1
        },
        "xAxis": {
            "min": 0, //not working yet
        },
        legend: {
            enabled: false //disables "series 1" default labeling x axis
        },
        //create an x axis object here so it doesn't start at -100
        //put the label for the x axis of the graph here too
        "series": [{
            "data": data,
            "type": "spline",
            "connectNulls": false,
            "connectEnds": true,
            "turboThreshold": totalNumDataPoints + 1
        }]
    });

    // set up download button
    $("#download").on("click", download);


    // starts recording
    // in the future, consider setting the timeout so that the
    // rate of data collection coincides with the video's framerate.
    setInterval(record, 250);
    slider();
}

//sets the slider
function slider() {
    $('#slider-vertical').slider({
        //setting height to a pixel value doesn't work here
        orientation: "vertical",
        animate: "fast",
        range: "min",
        min: -1,
        max: 1,
        value: 0,
        step: .5,
        slide: function( event, ui ) {
            $( "#amount" ).val( ui.value );
            ycoord = Number(document.getElementById("amount").value);
            document.getElementById("demo").innerHTML = ycoord;
        }
    });
    $("#amount").val( $("#slider-vertical").slider("value"));

}

// sets the stick's position to the x and y (or to maxX and maxY)
function setStick(y) {

    if (y < 0) y = Math.ceil(y); else y = Math.floor(y);

    var width = stick.width();
    var height = stick.height();
    var parentWidth = pivot.width();
    var parentHeight = pivot.height();

    y = ycoord;

    //stick.css({"top": y});
}

// starts the dragging event for the stick
function startDragging(event) {
    if (YT.PlayerState.PLAYING) {
        isRecording = true;
    }

    // stops stick's spring motion
    //clearInterval(springMotionInterval);

    // enables dragging
    isDragging = true;

    // find position of stick relative to pivot and sets stick position to that.
    //var x = event.pageX - pivot.offset().left - pivot.width() / 2;
    var y = event.pageY - pivot.offset().top - pivot.height() / 2;
}

// set stick's position, if dragging event occurring.
function drag(event) {
    if (!YT.PlayerState.PLAYING) {
        isRecording = false;
    }

    if (isDragging) {
        //var x = event.pageX - pivot.offset().left - pivot.width() / 2;
        var y = event.pageY - pivot.offset().top - pivot.height() / 2;
        setStick(y);
    }
}

// downloads data in csv format.
function download() {
    var text = "";

    var data_length = graph.series[0].data.length;
    data = graph.series[0].data;

    for (var i = 0; i < data_length; i++) {
        text += data[i].x + "," + data[i].y;
        text += "\n";
    }

    document.getElementById("download").href = 'data:attachment/csv,'+ encodeURIComponent(text);
}

// records the position of the stick in the output file/variable.
function record() {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else {
        isPlaying = false;
    }

    // console.log(graph)
    // sets the counter to be at the current video frame. Ensures sync.
    lastCounter = counter;
    counter = Math.round(player.getCurrentTime() * 10);

    // only records if video is playing.
    if (!isPlaying) {
        var startIndex = counter - numDataPoints;
        graph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
        return;
    }

    //var x = stick.position().left + stick.width() / 2 - pivot.width() / 2;
    //var y = - stick.position().top - stick.height() / 2 + pivot.height() / 2;
    var y = ycoord;

    if (lastCounter < counter) {
        // clear data all from lastCounter up to counter.
        // important for scrubbing
        for (var i = lastCounter + 1; i < counter; i++) {
            var previous = data[lastCounter];
            var numSlots = counter - lastCounter;
            //this is calculating slope
            //var newY = (i - lastCounter)*(y - previous.y)/numSlots + previous.y;
            graph.series[0].data[i].update(y);
        }
    }

    graph.series[0].data[counter].update(y);
    // data[counter].y = y;

    // counter determines the extremes of the x axis to display.
    var startIndex = counter - numDataPoints;
    graph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
}
