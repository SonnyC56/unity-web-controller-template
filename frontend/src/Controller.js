import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import useWebSocket from "react-use-websocket";
import { Joystick } from "react-joystick-component";
import { useParams } from "react-router-dom";
import "./App.css";
import MoveStick from "./images/Move_Stick.png";
import LookStick from "./images/Look_Stick.png";
import MoveArrows from "./images/Move_Arrows-BG.png";
import LookEyeBG from "./images/Look_Eye-BG.png";
import ExitImage from "./images/Exit_Button.png";
import Logo from "./images/LW-InteractIVE_BLK-BG_LOGO.png";
const USER_WS_URL = "ws://IP-ADDRESS/api/user";

function Controller() {
  const [hasControl, setHasControl] = useState(false);
  const [waitingForUnityClient, setWaitingForUnityClient] = useState(false); // New state variable for waiting for unity client
  const [isDone, setIsDone] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [turnTime, setTurnTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // New state variable for remaining time
  const { name } = useParams();
  console.log("app rendered");
  const didMount = useRef(false);

  const { sendJsonMessage } = useWebSocket(USER_WS_URL, {
    onOpen: () => {
      if (!didMount.current) {
        // Send a message to the server to indicate that this is a web client
        sendJsonMessage({ type: "join", name: name });
        console.log("join message sent");
        didMount.current = true;
      }
    },

    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log("recieving data ", data);
      if (data.type === "control") {
        console.log("This client has been granted control of the camera");
        setHasControl(true);
        setQueuePosition(0);
        if (!hasControl) {
          setTurnTime(data.turnTime); // Set the turn time to 480 seconds (480000 milliseconds)
          setRemainingTime(data.turnTime); // Set the remaining time to 480 seconds or 8 minutes
        }
      } else if (data.type === "queue") {
        // Update the total number of clients and the position of this client in the queue
        setQueueLength(data.controlQueueLength);
        setQueuePosition(data.position);
      } else if (data.type === "done") {
        // The current client is done controlling the camera
        setHasControl(false);
        setIsDone(true);
        setQueuePosition(0);
        setTurnTime(0);
        setRemainingTime(0); // Reset the remaining time
      } else if (data.type ==="waitingOnUnity"){
        setWaitingForUnityClient(true);
      } else if (data.type === "unityConnected"){
        setWaitingForUnityClient(false);
      }
    },
  });

  useEffect(() => {
    let timer;
    if (hasControl && turnTime > 0) {
      timer = setTimeout(() => {
        handleDone();
      }, turnTime);
      // Update the remaining time every second
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1000);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasControl, turnTime]);

  const handleMove = (data) => {
    if (hasControl) {
      sendJsonMessage(data);
    }
  };
  const handleRotate = (data) => {
    if (hasControl) {
      data.type = "rotate";
      sendJsonMessage(data);
    }
  };
  const handleDone = () => {
    if (hasControl) {
      setHasControl(false);
      sendJsonMessage({ type: "done" });
      setIsDone(true);
      setRemainingTime(0); // Reset the remaining time
    }
  };


  const LogoImage = styled.img`
  width: 200px;
  height: 100px;
  position: relative;
  margin-left: 40%;
  `;

 const ExitImageStyled = styled.img`
 width: 20%;
 height: 20%;
 `;

  if (!isDone) {
    if(waitingForUnityClient){
      return (
        <div className="App">
        <header className="App-header">
         <h2>Light Work Interactive is not currently running. Please check <a href="https://www.lightwork.org/light-work-uvp-interact/" style={{color: "white"}}>lightwork.org</a> for exhibition times.</h2>
          <LogoImage src={Logo} alt="Logo"/>
        </header>
      </div>
      )
    } else {
    return (
      <div className="App">
        <header className="App-header">
          {hasControl ? (
            <div className="MainContainer">
              <div className="Timer">
                {remainingTime > 0 ? (
                  <p>
                 {Math.floor(remainingTime / 60000)}:{""}
                 {Math.floor((remainingTime % 60000) / 1000)} 
                  </p>
                ) : (
                  <p>Time's up!</p>
                )}
              </div>
              <div className="Joystick">
                <div>
             
                  <Joystick
                    size={100}
                    baseColor="red"
                    stickColor="blue"
                    stickImage={MoveStick}
                    baseImage={MoveArrows}
                    move={handleMove}
                  />
                </div>
                <div>
                
                  <Joystick
                    size={100}
                    baseColor="green"
                    stickImage={LookStick}
                    baseImage={LookEyeBG}
                    stickColor="orange"
                    move={handleRotate}
                  />
                </div>
              </div>

              <ExitImageStyled src={ExitImage} alt="Logo" onClick={handleDone}/>

      
            </div>
          ) : (
            <p>
              {queuePosition
                ? `Waiting for control. Position in queue: ${
                    queuePosition + 1
                  } / ${queueLength}`
                : "Waiting for control..."}
            </p>
          )}
          <LogoImage src={Logo} alt="Logo"/>
        </header>

      </div>
    );
   }
  } else {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Thanks for interacting!</h1>
          <button onClick={() => window.location.href = 'https://www.lightwork.org/light-work-uvp-interact/'}>Learn More</button>
          <LogoImage src={Logo} alt="Logo"/>
        </header>
      </div>
    );
  }
}

export default Controller;
