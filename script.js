// class P2PFileTransfer {
//   constructor() {
//     this.peerConnection = null;
//     this.dataChannel = null;
//     this.isConnected = false;
//     this.selectedFile = null;

//     // Transfer state
//     this.transferState = {
//       sending: false,
//       receiving: false,
//       filename: "",
//       filesize: 0,
//       transferred: 0,
//       startTime: 0,
//       chunks: [],
//     };

//     this.init();
//   }

//   init() {
//     this.setupEventListeners();
//     this.log(
//       "System ready - Choose to create offer or paste an offer to connect",
//       "info"
//     );
//   }

//   setupEventListeners() {
//     // Connection setup
//     document
//       .getElementById("createOffer")
//       .addEventListener("click", () => this.createOffer());
//     document
//       .getElementById("createAnswer")
//       .addEventListener("click", () => this.createAnswer());
//     document
//       .getElementById("processAnswer")
//       .addEventListener("click", () => this.processAnswer());

//     // Copy buttons
//     document
//       .getElementById("copyOffer")
//       .addEventListener("click", () => this.copyToClipboard("offerText"));
//     document
//       .getElementById("copyAnswer")
//       .addEventListener("click", () => this.copyToClipboard("answerOutput"));

//     // File handling
//     const fileInput = document.getElementById("fileInput");
//     const dropZone = document.getElementById("dropZone");

//     dropZone.addEventListener("click", () => fileInput.click());
//     fileInput.addEventListener("change", (e) =>
//       this.handleFileSelect(e.target.files[0])
//     );

//     // Drag and drop
//     dropZone.addEventListener("dragover", (e) => {
//       e.preventDefault();
//       dropZone.classList.add("border-blue-500", "bg-blue-50");
//     });

//     dropZone.addEventListener("dragleave", () => {
//       dropZone.classList.remove("border-blue-500", "bg-blue-50");
//     });

//     dropZone.addEventListener("drop", (e) => {
//       e.preventDefault();
//       dropZone.classList.remove("border-blue-500", "bg-blue-50");
//       const file = e.dataTransfer.files[0];
//       if (file) this.handleFileSelect(file);
//     });

//     document
//       .getElementById("sendFile")
//       .addEventListener("click", () => this.sendFile());
//   }

//   async createOffer() {
//     try {
//       this.log("Creating WebRTC connection...", "info");
//       this.updateConnectionStatus("Creating offer...");

//       this.peerConnection = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       });

//       // Create data channel
//       this.dataChannel = this.peerConnection.createDataChannel("fileTransfer", {
//         ordered: true,
//       });

//       this.setupDataChannel(this.dataChannel);
//       this.setupPeerConnection();

//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);

//       // Wait for ICE gathering to complete
//       await this.waitForIceGathering();

//       document.getElementById("offerText").value = JSON.stringify(
//         this.peerConnection.localDescription
//       );
//       document.getElementById("offerSection").classList.remove("hidden");
//       document.getElementById("answerSection").classList.remove("hidden");

//       this.log("Offer created! Share it with the receiver", "success");
//       this.updateConnectionStatus("Offer created - waiting for answer");
//     } catch (error) {
//       this.log(`Error creating offer: ${error.message}`, "error");
//       this.updateConnectionStatus("Failed to create offer");
//     }
//   }

//   async createAnswer() {
//     try {
//       const offerText = document.getElementById("offerInput").value.trim();
//       if (!offerText) {
//         alert("Please paste the offer first");
//         return;
//       }

//       this.log("Processing offer and creating answer...", "info");
//       this.updateConnectionStatus("Creating answer...");

//       const offer = JSON.parse(offerText);

//       this.peerConnection = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       });

//       this.setupPeerConnection();

//       // Handle incoming data channel
//       this.peerConnection.ondatachannel = (event) => {
//         this.dataChannel = event.channel;
//         this.setupDataChannel(this.dataChannel);
//       };

//       await this.peerConnection.setRemoteDescription(offer);
//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);

//       // Wait for ICE gathering to complete
//       await this.waitForIceGathering();

//       document.getElementById("answerOutput").value = JSON.stringify(
//         this.peerConnection.localDescription
//       );
//       document.getElementById("answerOutputSection").classList.remove("hidden");

//       this.log("Answer created! Share it with the sender", "success");
//       this.updateConnectionStatus("Answer created - waiting for connection");
//     } catch (error) {
//       this.log(`Error creating answer: ${error.message}`, "error");
//       this.updateConnectionStatus("Failed to create answer");
//     }
//   }

//   async processAnswer() {
//     try {
//       const answerText = document.getElementById("answerInput").value.trim();
//       if (!answerText) {
//         alert("Please paste the answer first");
//         return;
//       }

//       this.log("Processing answer...", "info");
//       this.updateConnectionStatus("Connecting...");

//       const answer = JSON.parse(answerText);
//       await this.peerConnection.setRemoteDescription(answer);

//       this.log("Answer processed - establishing connection...", "info");
//     } catch (error) {
//       this.log(`Error processing answer: ${error.message}`, "error");
//       this.updateConnectionStatus("Failed to process answer");
//     }
//   }

//   setupPeerConnection() {
//     this.peerConnection.oniceconnectionstatechange = () => {
//       this.log(
//         `ICE connection state: ${this.peerConnection.iceConnectionState}`,
//         "info"
//       );

//       if (
//         this.peerConnection.iceConnectionState === "connected" ||
//         this.peerConnection.iceConnectionState === "completed"
//       ) {
//         this.onConnectionEstablished();
//       } else if (this.peerConnection.iceConnectionState === "failed") {
//         this.log("Connection failed", "error");
//         this.updateConnectionStatus("Connection failed");
//       }
//     };

//     this.peerConnection.onconnectionstatechange = () => {
//       this.log(
//         `Connection state: ${this.peerConnection.connectionState}`,
//         "info"
//       );
//     };
//   }

//   setupDataChannel(channel) {
//     channel.onopen = () => {
//       this.log("Data channel opened - ready for file transfer!", "success");
//       this.isConnected = true;
//       document.getElementById("sendFile").disabled = false;
//     };

//     channel.onclose = () => {
//       this.log("Data channel closed", "info");
//       this.isConnected = false;
//       document.getElementById("sendFile").disabled = true;
//     };

//     channel.onmessage = (event) => {
//       this.handleIncomingData(event.data);
//     };

//     channel.onerror = (error) => {
//       this.log(`Data channel error: ${error}`, "error");
//     };
//   }

//   async waitForIceGathering() {
//     return new Promise((resolve) => {
//       if (this.peerConnection.iceGatheringState === "complete") {
//         resolve();
//       } else {
//         this.peerConnection.addEventListener("icegatheringstatechange", () => {
//           if (this.peerConnection.iceGatheringState === "complete") {
//             resolve();
//           }
//         });
//       }
//     });
//   }

//   onConnectionEstablished() {
//     this.log("🎉 Connection established successfully!", "success");
//     this.updateConnectionStatus("Connected");
//     document.getElementById("connectedStatus").classList.remove("hidden");
//   }

//   handleFileSelect(file) {
//     if (!file) return;

//     this.selectedFile = file;
//     const dropZone = document.getElementById("dropZone");
//     dropZone.innerHTML = `
//                     <div class="text-4xl mb-2">📄</div>
//                     <p class="text-gray-800 font-medium">${file.name}</p>
//                     <p class="text-sm text-gray-500">${this.formatFileSize(
//                       file.size
//                     )}</p>
//                     <p class="text-xs text-gray-400 mt-1">Ready to send</p>
//                 `;

//     document.getElementById("sendFile").disabled = !this.isConnected;
//     this.log(
//       `File selected: ${file.name} (${this.formatFileSize(file.size)})`,
//       "info"
//     );
//   }

//   async sendFile() {
//     if (!this.selectedFile || !this.isConnected || !this.dataChannel) {
//       this.log("Cannot send file - not connected or no file selected", "error");
//       return;
//     }

//     const file = this.selectedFile;
//     this.transferState = {
//       sending: true,
//       receiving: false,
//       filename: file.name,
//       filesize: file.size,
//       transferred: 0,
//       startTime: Date.now(),
//       chunks: [],
//     };

//     this.log(`Starting file transfer: ${file.name}`, "info");
//     this.showProgress(true);

//     // Send file metadata
//     const metadata = {
//       type: "file-start",
//       filename: file.name,
//       filesize: file.size,
//       filetype: file.type || "application/octet-stream",
//     };

//     this.dataChannel.send(JSON.stringify(metadata));

//     // Send file in chunks
//     const CHUNK_SIZE = 16384; // 16KB chunks
//     let offset = 0;

//     const sendNextChunk = async () => {
//       if (offset >= file.size) {
//         // File transfer complete
//         this.dataChannel.send(JSON.stringify({ type: "file-end" }));
//         this.transferState.sending = false;
//         this.hideProgress();
//         this.log("File transfer completed successfully!", "success");
//         return;
//       }

//       const chunk = file.slice(offset, offset + CHUNK_SIZE);
//       const arrayBuffer = await chunk.arrayBuffer();

//       try {
//         this.dataChannel.send(arrayBuffer);
//         offset += chunk.size;
//         this.transferState.transferred = offset;

//         this.updateProgress();

//         // Continue with next chunk
//         setTimeout(sendNextChunk, 1);
//       } catch (error) {
//         this.log(`Error sending chunk: ${error.message}`, "error");
//         this.transferState.sending = false;
//         this.hideProgress();
//       }
//     };

//     sendNextChunk();
//   }

//   handleIncomingData(data) {
//     if (typeof data === "string") {
//       // JSON message
//       try {
//         const message = JSON.parse(data);

//         if (message.type === "file-start") {
//           this.transferState = {
//             sending: false,
//             receiving: true,
//             filename: message.filename,
//             filesize: message.filesize,
//             filetype: message.filetype,
//             transferred: 0,
//             startTime: Date.now(),
//             chunks: [],
//           };

//           this.log(
//             `Receiving file: ${message.filename} (${this.formatFileSize(
//               message.filesize
//             )})`,
//             "info"
//           );
//           this.showProgress(true);
//         } else if (message.type === "file-end") {
//           this.completeFileReceive();
//         }
//       } catch (error) {
//         this.log(`Error parsing message: ${error.message}`, "error");
//       }
//     } else {
//       // Binary data (file chunk)
//       if (this.transferState.receiving) {
//         this.transferState.chunks.push(new Uint8Array(data));
//         this.transferState.transferred += data.byteLength;
//         this.updateProgress();
//       }
//     }
//   }

//   completeFileReceive() {
//     if (!this.transferState.receiving) return;

//     // Combine all chunks
//     const totalSize = this.transferState.chunks.reduce(
//       (sum, chunk) => sum + chunk.length,
//       0
//     );
//     const combinedArray = new Uint8Array(totalSize);
//     let offset = 0;

//     for (const chunk of this.transferState.chunks) {
//       combinedArray.set(chunk, offset);
//       offset += chunk.length;
//     }

//     // Create blob and download URL
//     const blob = new Blob([combinedArray], {
//       type: this.transferState.filetype,
//     });
//     const url = URL.createObjectURL(blob);

//     this.addReceivedFile(
//       this.transferState.filename,
//       this.transferState.filesize,
//       url
//     );

//     this.log(
//       `File received successfully: ${this.transferState.filename}`,
//       "success"
//     );
//     this.hideProgress();

//     // Reset state
//     this.transferState.receiving = false;
//   }

//   addReceivedFile(filename, filesize, downloadUrl) {
//     const container = document.getElementById("receivedFiles");

//     // Remove empty state
//     if (container.querySelector(".text-gray-500")) {
//       container.innerHTML = "";
//     }

//     const fileElement = document.createElement("div");
//     fileElement.className =
//       "flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4";
//     fileElement.innerHTML = `
//                     <div class="flex items-center gap-4">
//                         <div class="text-3xl">📄</div>
//                         <div>
//                             <div class="font-medium text-gray-800">${filename}</div>
//                             <div class="text-sm text-gray-600">${this.formatFileSize(
//                               filesize
//                             )}</div>
//                             <div class="text-xs text-green-600 font-medium">✅ Received</div>
//                         </div>
//                     </div>
//                     <a href="${downloadUrl}" download="${filename}" 
//                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
//                         💾 Download
//                     </a>
//                 `;

//     container.appendChild(fileElement);
//   }

//   showProgress(show) {
//     const progressDiv = document.getElementById("transferProgress");
//     if (show) {
//       progressDiv.classList.remove("hidden");
//     } else {
//       progressDiv.classList.add("hidden");
//     }
//   }

//   hideProgress() {
//     this.showProgress(false);
//   }

//   updateProgress() {
//     if (!this.transferState.filesize) return;

//     const percent =
//       (this.transferState.transferred / this.transferState.filesize) * 100;
//     const elapsed = (Date.now() - this.transferState.startTime) / 1000;
//     const speed = this.transferState.transferred / elapsed;
//     const remaining =
//       (this.transferState.filesize - this.transferState.transferred) / speed;

//     document.getElementById("progressPercent").textContent = `${Math.round(
//       percent
//     )}%`;
//     document.getElementById("progressBar").style.width = `${percent}%`;

//     const action = this.transferState.sending ? "Sending" : "Receiving";
//     document.getElementById(
//       "progressText"
//     ).textContent = `${action} ${this.transferState.filename}`;
//     document.getElementById("speedText").textContent = `${this.formatFileSize(
//       speed
//     )}/s`;
//     document.getElementById("etaText").textContent = isFinite(remaining)
//       ? this.formatTime(remaining)
//       : "--:--";
//   }

//   updateConnectionStatus(status) {
//     const statusEl = document.getElementById("connectionStatus");
//     statusEl.textContent = status;

//     statusEl.className = "px-3 py-1 rounded-full text-sm font-medium";
//     if (status.includes("Connected")) {
//       statusEl.classList.add("bg-green-100", "text-green-700");
//     } else if (status.includes("Failed") || status.includes("failed")) {
//       statusEl.classList.add("bg-red-100", "text-red-700");
//     } else if (status.includes("Creating") || status.includes("Connecting")) {
//       statusEl.classList.add("bg-yellow-100", "text-yellow-700");
//     } else {
//       statusEl.classList.add("bg-gray-100", "text-gray-600");
//     }
//   }

//   async copyToClipboard(elementId) {
//     const text = document.getElementById(elementId).value;
//     try {
//       await navigator.clipboard.writeText(text);
//       this.log("Copied to clipboard!", "success");
//     } catch (error) {
//       this.log("Failed to copy to clipboard", "error");
//     }
//   }

//   log(message, type = "info") {
//     const logContainer = document.getElementById("activityLog");
//     const timestamp = new Date().toLocaleTimeString();
//     const logEntry = document.createElement("div");

//     let icon = "📝";
//     let colorClass = "text-gray-600";

//     switch (type) {
//       case "success":
//         icon = "✅";
//         colorClass = "text-green-600";
//         break;
//       case "error":
//         icon = "❌";
//         colorClass = "text-red-600";
//         break;
//       case "info":
//         icon = "ℹ️";
//         colorClass = "text-blue-600";
//         break;
//     }

//     logEntry.className = colorClass;
//     logEntry.innerHTML = `${icon} ${timestamp} - ${message}`;

//     logContainer.insertBefore(logEntry, logContainer.firstChild);

//     // Keep only last 100 entries
//     while (logContainer.children.length > 100) {
//       logContainer.removeChild(logContainer.lastChild);
//     }
//   }

//   formatFileSize(bytes) {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   }

//   formatTime(seconds) {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   }
// }

// // Initialize the application
// new P2PFileTransfer();








//..................................................

class P2PFileTransfer {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.isConnected = false;
    this.selectedFile = null;

    // Transfer state
    this.transferState = {
      sending: false,
      receiving: false,
      filename: "",
      filesize: 0,
      transferred: 0,
      startTime: 0,
      chunks: [],
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.log(
      "System ready - Choose to create offer or paste an offer to connect",
      "info"
    );

    // Restore last offer/answer if available
    const lastOffer = localStorage.getItem("lastOffer");
    const lastAnswer = localStorage.getItem("lastAnswer");

    if (lastOffer) {
      document.getElementById("offerText").value = lastOffer;
      document.getElementById("offerSection").classList.remove("hidden");
      document.getElementById("answerSection").classList.remove("hidden");
      this.log("Restored previous offer from localStorage", "info");
    }

    if (lastAnswer) {
      document.getElementById("answerOutput").value = lastAnswer;
      document.getElementById("answerOutputSection").classList.remove("hidden");
      this.log("Restored previous answer from localStorage", "info");
    }
  }

  setupEventListeners() {
    document.getElementById("createOffer").addEventListener("click", () => this.createOffer());
    document.getElementById("createAnswer").addEventListener("click", () => this.createAnswer());
    document.getElementById("processAnswer").addEventListener("click", () => this.processAnswer());

    document.getElementById("copyOffer").addEventListener("click", () => this.copyToClipboard("offerText"));
    document.getElementById("copyAnswer").addEventListener("click", () => this.copyToClipboard("answerOutput"));

    const fileInput = document.getElementById("fileInput");
    const dropZone = document.getElementById("dropZone");

    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => this.handleFileSelect(e.target.files[0]));

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("border-blue-500", "bg-blue-50");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("border-blue-500", "bg-blue-50");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("border-blue-500", "bg-blue-50");
      const file = e.dataTransfer.files[0];
      if (file) this.handleFileSelect(file);
    });

    document.getElementById("sendFile").addEventListener("click", () => this.sendFile());
  }

  async createOffer() {
    try {
      this.log("Creating WebRTC connection...", "info");
      this.updateConnectionStatus("Creating offer...");

      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      this.dataChannel = this.peerConnection.createDataChannel("fileTransfer", { ordered: true });
      this.setupDataChannel(this.dataChannel);
      this.setupPeerConnection();

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await this.waitForIceGathering();

      const offerText = JSON.stringify(this.peerConnection.localDescription);
      document.getElementById("offerText").value = offerText;
      document.getElementById("offerSection").classList.remove("hidden");
      document.getElementById("answerSection").classList.remove("hidden");

      localStorage.setItem("lastOffer", offerText);
      this.log("Offer created! Share it with the receiver", "success");
      this.updateConnectionStatus("Offer created - waiting for answer");
    } catch (error) {
      this.log(`Error creating offer: ${error.message}`, "error");
      this.updateConnectionStatus("Failed to create offer");
    }
  }

  async createAnswer() {
    try {
      const offerText = document.getElementById("offerInput").value.trim() || localStorage.getItem("lastOffer");
      if (!offerText) {
        alert("Please paste the offer first");
        return;
      }

      this.log("Processing offer and creating answer...", "info");
      this.updateConnectionStatus("Creating answer...");

      const offer = JSON.parse(offerText);

      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      this.setupPeerConnection();
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };

      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await this.waitForIceGathering();

      const answerText = JSON.stringify(this.peerConnection.localDescription);
      document.getElementById("answerOutput").value = answerText;
      document.getElementById("answerOutputSection").classList.remove("hidden");

      localStorage.setItem("lastAnswer", answerText);
      this.log("Answer created! Share it with the sender", "success");
      this.updateConnectionStatus("Answer created - waiting for connection");
    } catch (error) {
      this.log(`Error creating answer: ${error.message}`, "error");
      this.updateConnectionStatus("Failed to create answer");
    }
  }

  async processAnswer() {
    try {
      const answerText = document.getElementById("answerInput").value.trim() || localStorage.getItem("lastAnswer");
      if (!answerText) {
        alert("Please paste the answer first");
        return;
      }

      this.log("Processing answer...", "info");
      this.updateConnectionStatus("Connecting...");

      const answer = JSON.parse(answerText);
      await this.peerConnection.setRemoteDescription(answer);

      this.log("Answer processed - connection established!", "info");
    } catch (error) {
      this.log(`Error processing answer: ${error.message}`, "error");
      this.updateConnectionStatus("Failed to process answer");
    }
  }

  setupPeerConnection() {
    this.peerConnection.oniceconnectionstatechange = () => {
      this.log(`ICE connection state: ${this.peerConnection.iceConnectionState}`, "info");
      if (["connected", "completed"].includes(this.peerConnection.iceConnectionState)) {
        this.onConnectionEstablished();
      } else if (this.peerConnection.iceConnectionState === "failed") {
        this.log("Connection failed", "error");
        this.updateConnectionStatus("Connection failed");
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.log(`Connection state: ${this.peerConnection.connectionState}`, "info");
      if (["disconnected", "failed"].includes(this.peerConnection.connectionState)) {
        this.log("Connection lost. Reloaded? Reapply offer/answer.", "error");
        this.isConnected = false;
        document.getElementById("sendFile").disabled = true;
      }
    };
  }

  setupDataChannel(channel) {
    channel.onopen = () => {
      this.log("Data channel opened - ready for file transfer!", "success");
      this.isConnected = true;
      document.getElementById("sendFile").disabled = false;
    };

    channel.onclose = () => {
      this.log("Data channel closed", "info");
      this.isConnected = false;
      document.getElementById("sendFile").disabled = true;
    };

    channel.onmessage = (event) => this.handleIncomingData(event.data);
    channel.onerror = (error) => this.log(`Data channel error: ${error}`, "error");
  }

  async waitForIceGathering() {
    return new Promise((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") resolve();
      else this.peerConnection.addEventListener("icegatheringstatechange", () => {
        if (this.peerConnection.iceGatheringState === "complete") resolve();
      });
    });
  }

  onConnectionEstablished() {
    this.log("🎉 Connection established successfully!", "success");
    this.updateConnectionStatus("Connected");
    document.getElementById("connectedStatus").classList.remove("hidden");
  }

  handleFileSelect(file) {
    if (!file) return;

    this.selectedFile = file;
    const dropZone = document.getElementById("dropZone");
    dropZone.innerHTML = `
                    <div class="text-4xl mb-2">📄</div>
                    <p class="text-gray-800 font-medium">${file.name}</p>
                    <p class="text-sm text-gray-500">${this.formatFileSize(
                      file.size
                    )}</p>
                    <p class="text-xs text-gray-400 mt-1">Ready to send</p>
                `;

    document.getElementById("sendFile").disabled = !this.isConnected;
    this.log(
      `File selected: ${file.name} (${this.formatFileSize(file.size)})`,
      "info"
    );
  }

  async sendFile() {
    if (!this.selectedFile || !this.isConnected || !this.dataChannel) {
      this.log("Cannot send file - not connected or no file selected", "error");
      return;
    }

    const file = this.selectedFile;
    this.transferState = {
      sending: true,
      receiving: false,
      filename: file.name,
      filesize: file.size,
      transferred: 0,
      startTime: Date.now(),
      chunks: [],
    };

    this.log(`Starting file transfer: ${file.name}`, "info");
    this.showProgress(true);

    // Send file metadata
    const metadata = {
      type: "file-start",
      filename: file.name,
      filesize: file.size,
      filetype: file.type || "application/octet-stream",
    };

    this.dataChannel.send(JSON.stringify(metadata));

    // Send file in chunks
    const CHUNK_SIZE = 16384; // 16KB chunks
    let offset = 0;

    const sendNextChunk = async () => {
      if (offset >= file.size) {
        // File transfer complete
        this.dataChannel.send(JSON.stringify({ type: "file-end" }));
        this.transferState.sending = false;
        this.hideProgress();
        this.log("File transfer completed successfully!", "success");
        return;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await chunk.arrayBuffer();

      try {
        this.dataChannel.send(arrayBuffer);
        offset += chunk.size;
        this.transferState.transferred = offset;

        this.updateProgress();

        // Continue with next chunk
        setTimeout(sendNextChunk, 1);
      } catch (error) {
        this.log(`Error sending chunk: ${error.message}`, "error");
        this.transferState.sending = false;
        this.hideProgress();
      }
    };

    sendNextChunk();
  }

  handleIncomingData(data) {
    if (typeof data === "string") {
      // JSON message
      try {
        const message = JSON.parse(data);

        if (message.type === "file-start") {
          this.transferState = {
            sending: false,
            receiving: true,
            filename: message.filename,
            filesize: message.filesize,
            filetype: message.filetype,
            transferred: 0,
            startTime: Date.now(),
            chunks: [],
          };

          this.log(
            `Receiving file: ${message.filename} (${this.formatFileSize(
              message.filesize
            )})`,
            "info"
          );
          this.showProgress(true);
        } else if (message.type === "file-end") {
          this.completeFileReceive();
        }
      } catch (error) {
        this.log(`Error parsing message: ${error.message}`, "error");
      }
    } else {
      // Binary data (file chunk)
      if (this.transferState.receiving) {
        this.transferState.chunks.push(new Uint8Array(data));
        this.transferState.transferred += data.byteLength;
        this.updateProgress();
      }
    }
  }

  completeFileReceive() {
    if (!this.transferState.receiving) return;

    // Combine all chunks
    const totalSize = this.transferState.chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );
    const combinedArray = new Uint8Array(totalSize);
    let offset = 0;

    for (const chunk of this.transferState.chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // Create blob and download URL
    const blob = new Blob([combinedArray], {
      type: this.transferState.filetype,
    });
    const url = URL.createObjectURL(blob);

    this.addReceivedFile(
      this.transferState.filename,
      this.transferState.filesize,
      url
    );

    this.log(
      `File received successfully: ${this.transferState.filename}`,
      "success"
    );
    this.hideProgress();

    // Reset state
    this.transferState.receiving = false;
  }

  addReceivedFile(filename, filesize, downloadUrl) {
    const container = document.getElementById("receivedFiles");

    // Remove empty state
    if (container.querySelector(".text-gray-500")) {
      container.innerHTML = "";
    }

    const fileElement = document.createElement("div");
    fileElement.className =
      "flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4";
    fileElement.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="text-3xl">📄</div>
                        <div>
                            <div class="font-medium text-gray-800">${filename}</div>
                            <div class="text-sm text-gray-600">${this.formatFileSize(
                              filesize
                            )}</div>
                            <div class="text-xs text-green-600 font-medium">✅ Received</div>
                        </div>
                    </div>
                    <a href="${downloadUrl}" download="${filename}" 
                       class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                        💾 Download
                    </a>
                `;

    container.appendChild(fileElement);
  }

  showProgress(show) {
    const progressDiv = document.getElementById("transferProgress");
    if (show) {
      progressDiv.classList.remove("hidden");
    } else {
      progressDiv.classList.add("hidden");
    }
  }

  hideProgress() {
    this.showProgress(false);
  }

  updateProgress() {
    if (!this.transferState.filesize) return;

    const percent =
      (this.transferState.transferred / this.transferState.filesize) * 100;
    const elapsed = (Date.now() - this.transferState.startTime) / 1000;
    const speed = this.transferState.transferred / elapsed;
    const remaining =
      (this.transferState.filesize - this.transferState.transferred) / speed;

    document.getElementById("progressPercent").textContent = `${Math.round(
      percent
    )}%`;
    document.getElementById("progressBar").style.width = `${percent}%`;

    const action = this.transferState.sending ? "Sending" : "Receiving";
    document.getElementById(
      "progressText"
    ).textContent = `${action} ${this.transferState.filename}`;
    document.getElementById("speedText").textContent = `${this.formatFileSize(
      speed
    )}/s`;
    document.getElementById("etaText").textContent = isFinite(remaining)
      ? this.formatTime(remaining)
      : "--:--";
  }

  updateConnectionStatus(status) {
    const statusEl = document.getElementById("connectionStatus");
    statusEl.textContent = status;

    statusEl.className = "px-3 py-1 rounded-full text-sm font-medium";
    if (status.includes("Connected")) {
      statusEl.classList.add("bg-green-100", "text-green-700");
    } else if (status.includes("Failed") || status.includes("failed")) {
      statusEl.classList.add("bg-red-100", "text-red-700");
    } else if (status.includes("Creating") || status.includes("Connecting")) {
      statusEl.classList.add("bg-yellow-100", "text-yellow-700");
    } else {
      statusEl.classList.add("bg-gray-100", "text-gray-600");
    }
  }

  async copyToClipboard(elementId) {
    const text = document.getElementById(elementId).value;
    try {
      await navigator.clipboard.writeText(text);
      this.log("Copied to clipboard!", "success");
    } catch (error) {
      this.log("Failed to copy to clipboard", "error");
    }
  }

  log(message, type = "info") {
    const logContainer = document.getElementById("activityLog");
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement("div");

    let icon = "📝";
    let colorClass = "text-gray-600";

    switch (type) {
      case "success":
        icon = "✅";
        colorClass = "text-green-600";
        break;
      case "error":
        icon = "❌";
        colorClass = "text-red-600";
        break;
      case "info":
        icon = "ℹ️";
        colorClass = "text-blue-600";
        break;
    }

    logEntry.className = colorClass;
    logEntry.innerHTML = `${icon} ${timestamp} - ${message}`;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // Keep only last 100 entries
    while (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}

// Initialize the application
new P2PFileTransfer();
