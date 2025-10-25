import { Button } from "@heroui/react";
import "./App.css";
import NavigationBar from "./components/Navbar";
import { Mic, Voicemail } from "lucide-react";
import { useEffect, useRef } from "react";
import io from 'socket.io-client';

function App() {

  const localvideoRef = useRef(null);
  const remoteVideoRef  = useRef(null);
  const peerConnection  = useRef(null);
   const socketRef = useRef();

  useEffect(() => {
  socketRef.current = io('/');

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      localvideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection();

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          socketRef.current.emit('sendCandidate', event.candidate);
        }
      };

      peerConnection.current.ontrack = event => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      // Create and send offer when connected
      socketRef.current.on('connect', async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socketRef.current.emit('sendOffer', offer);
      });

      socketRef.current.on('receiveOffer', async (offer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socketRef.current.emit('sendAnswer', answer);
      });

      socketRef.current.on('receiveAnswer', async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socketRef.current.on('receiveCandidate', async (candidate) => {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      });
    })
    .catch(error => console.error('Error accessing media devices:', error));
}, []);


  return (
    <div className="min-h-screen flex flex-col w-full">
  <NavigationBar />
  <div className="flex-1 flex justify-center items-center">
    <Button
      className="bg-linear-to-tr size-10 rounded-3xl from-pink-500 to-yellow-500 text-white shadow-lg"
      radius="full"
      size="lg"

     onPress={InputAudio}
    >
      <Mic className="w-5 h-5 ms-2.5" />
    </Button>

   <div>
      <video ref={localvideoRef} autoPlay muted style={{width: '45%', marginRight: '10px'}} />
      <video className="mt-14" ref={remoteVideoRef} autoPlay style={{width: '45%'}} />
    </div>
  </div>
</div>

  );
}

async function InputAudio() {
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    return stream
  } catch (error) {
     console.error("Error accessing microphone:", error);
  }
}

export default App;
