# P2P File Sharing

A real-time peer-to-peer (P2P) file sharing application built with **WebRTC** and **WebSockets**. This project allows users to share files directly between browsers without relying on a centralized server for file transfer. The signaling server is only used to establish the initial connection.

---

## Features

- 📂 Share files directly between peers (no middle server storing data).
- ⚡ Real-time connection using WebRTC.
- 🔄 Bi-directional file transfer (send and receive).
- 📡 WebSocket signaling for peer discovery and connection setup.
- 📱 Works across devices and browsers that support WebRTC.
- 🔒 Secure connection with DTLS/SRTP encryption (default in WebRTC).

---

## Tech Stack

- **Frontend:** javascript, Html 
- **Signaling Server:** Node.js + WebSocket
- **P2P Connection:** WebRTC DataChannels


---

## How It Works

1. **Signaling:**  
   The signaling server (WebSockets) exchanges SDP offers/answers and ICE candidates between peers.  

2. **Peer Connection:**  
   Once signaling is complete, peers establish a direct WebRTC connection.  

3. **File Transfer:**  
   Files are split into chunks and sent via WebRTC DataChannels.  

4. **Reassembly:**  
   The receiving peer reassembles the chunks into the original file.  

---





