import "./App.scss";
import { FaArrowUp, FaArrowDown, FaPlay, FaPause } from "react-icons/fa";
import { FaRotate } from "react-icons/fa6";
import { useEffect, useState } from "react";
import classNames from "classnames";

function App() {
  return (
    <div className="App">
      <Clock />
    </div>
  );
}

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel,
  };
};

function Clock() {
  const defaultBreakTime = 5;
  const defaultSessionTime = 25;

  const [breakTime, setBreakTime] = useState(defaultBreakTime);
  const [sessionTime, setSessionTime] = useState(defaultSessionTime);

  const [started, setStarted] = useState(false);

  const [activeClock, setActiveClock] = useState("S");

  const [reset, setReset] = useState(0);

  return (
    <div className="clock">
      <div className="title">25 + 5 Clock</div>
      <div className="time-setters">
        <TimeSetter
          type="break"
          disabled={started}
          label="Break Length"
          time={breakTime}
          setter={setBreakTime}
        />
        <TimeSetter
          type="session"
          disabled={started}
          label="Session Length"
          time={sessionTime}
          setter={setSessionTime}
        />
      </div>
      <Display
        {...{
          started,
          activeClock,
          setActiveClock,
          breakTime,
          sessionTime,
          reset,
        }}
      />
      <Controls {...{ setStarted, onReset: handleReset }} />
    </div>
  );

  function handleReset() {
    setBreakTime(defaultBreakTime);
    setSessionTime(defaultSessionTime);
    setActiveClock("S");
    setReset(reset + 1);
    setStarted(false);
    document.getElementById("beep").pause();
    document.getElementById("beep").currentTime = 0;
  }
}

function TimeSetter({ type, label, time, setter, disabled }) {
  const labelId = type + "-label";
  const decId = type + "-decrement";
  const incId = type + "-increment";
  const lengthId = type + "-length";
  return (
    <div className="time-setter">
      <div id={labelId} className="label">
        {label}
      </div>
      <button id={decId} className="arrows" onClick={decrement}>
        <FaArrowDown />
      </button>
      <span id={lengthId}>{time}</span>
      <button id={incId} className="arrows" onClick={increment}>
        <FaArrowUp />
      </button>
    </div>
  );
  function decrement() {
    if (disabled) return;
    if (time > 1) {
      setter(time - 1);
    }
  }

  function increment() {
    if (disabled) return;
    if (time < 60) {
      setter(time + 1);
    }
  }
}

function Display({
  started,
  activeClock,
  setActiveClock,
  sessionTime,
  breakTime,
  reset,
}) {
  const [timer, setTimer] = useState(
    (activeClock === "S" ? sessionTime : breakTime) * 60
  );

  useEffect(() => {
    if (started) {
      const interval = accurateInterval(countDown, 1000);
      return function cleanup() {
        interval.cancel();
      };
    }
  }, [started]);

  useEffect(() => {
    setTimer(sessionTime * 60);
  }, [sessionTime]);

  useEffect(() => {
    setTimer((activeClock === "S" ? sessionTime : breakTime) * 60);
  }, [activeClock]);

  return (
    <div className={classNames("display", { imminent: timer < 60 })}>
      <div id="timer-label">{activeClock === "S" ? "Session" : "Break"}</div>
      <div id="time-left" className="time-left">
        {clockify()}
      </div>
      <audio
        id="beep"
        preload="auto"
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
    </div>
  );

  function countDown() {
    setTimer((prevTimer) => {
      if (prevTimer > 0) {
        return prevTimer - 1;
      } else if (prevTimer === 0) {
        setActiveClock((ac) => (ac === "S" ? "B" : "S"));
        document.getElementById("beep").play();
        return prevTimer;
      } else {
        throw Error(`Timer ${prevTimer} shouldn't happen`);
      }
    });
  }

  function clockify() {
    const secondsInMinutes = 60;

    let minutes = Math.floor(timer / secondsInMinutes);
    let seconds = timer - minutes * secondsInMinutes;

    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
    return minutes + ":" + seconds;
  }
}

function Controls({ setStarted, onReset }) {
  return (
    <div className="controls">
      <button id="start_stop" className="start-stop" onClick={handleStartStop}>
        <FaPlay />
        <FaPause />
      </button>

      <button id="reset" className="reset" onClick={onReset}>
        <FaRotate />
      </button>
    </div>
  );

  function handleStartStop() {
    setStarted((started) => !started);
  }
}
export default App;
