class P2PFileShare {
  constructor() {
    this.ws = null;
    this.peerId = null;
    this.peers = new Map();
    this.selectedFiles = [];
    this.transfers = new Map();
    this.dataTransferred = 0;
    this.isConnected = false;

    this.init();
  }

  init() {
    this.setupWebSocket();
    this.setupDragAndDrop();
    this.setupEventListeners();
    this.startHeartbeat();
    this.updateUI();
  }

  setupWebSocket() {
    // Simulate WebSocket connection (in real Next.js app, this would connect to your WebSocket server)
    this.simulateWebSocketConnection();
  }

  simulateWebSocketConnection() {
    this.addActivity("Establishing WebSocket connection...");

    setTimeout(() => {
      this.peerId = "peer-" + Math.random().toString(36).substr(2, 8);
      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.addActivity(`Connected as ${this.peerId}`);

      // Simulate peer discovery
      this.simulatePeerDiscovery();

      // Start receiving simulated messages
      this.startMessageSimulation();
    }, 1000);
  }

  simulatePeerDiscovery() {
    const peerNames = [
      "alice-dev",
      "bob-mobile",
      "charlie-web",
      "diana-desktop",
      "eve-tablet",
    ];

    setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance to add/remove peer
        if (this.peers.size < 5 && Math.random() < 0.7) {
          // Add peer
          const name = peerNames[Math.floor(Math.random() * peerNames.length)];
          const id = "peer-" + Math.random().toString(36).substr(2, 8);
          const latency = Math.floor(Math.random() * 200) + 20;

          if (!Array.from(this.peers.values()).some((p) => p.name === name)) {
            this.peers.set(id, {
              id,
              name,
              latency,
              status: "online",
              lastSeen: Date.now(),
            });
            this.addActivity(`Peer ${name} joined the network`);
          }
        } else if (this.peers.size > 0) {
          // Remove peer
          const peerIds = Array.from(this.peers.keys());
          const randomId = peerIds[Math.floor(Math.random() * peerIds.length)];
          const peer = this.peers.get(randomId);
          this.peers.delete(randomId);
          this.addActivity(`Peer ${peer.name} left the network`);
        }
        this.updatePeerList();
      }
    }, 3000);
  }

  startMessageSimulation() {
    setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance to receive file
        this.simulateIncomingFile();
      }
    }, 5000);

    // Update latency
    setInterval(() => {
      const latency = Math.floor(Math.random() * 50) + 15;
      document.getElementById("networkLatency").textContent = latency + " ms";
    }, 2000);
  }

  setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");

    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      this.handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });
  }

  setupEventListeners() {
    document
      .getElementById("sendBtn")
      .addEventListener("click", () => this.sendFiles());
    document
      .getElementById("broadcastBtn")
      .addEventListener("click", () => this.broadcastFiles());
    document
      .getElementById("refreshPeers")
      .addEventListener("click", () => this.refreshPeers());
    document
      .getElementById("reconnectBtn")
      .addEventListener("click", () => this.reconnect());

    // Peer input with suggestions
    const targetPeerInput = document.getElementById("targetPeer");
    targetPeerInput.addEventListener("input", (e) =>
      this.showPeerSuggestions(e.target.value)
    );
    targetPeerInput.addEventListener("blur", () => {
      setTimeout(
        () =>
          document.getElementById("peerSuggestions").classList.add("hidden"),
        200
      );
    });
  }

  handleFiles(files) {
    this.selectedFiles = Array.from(files);
    this.displaySelectedFiles();
    this.addActivity(`Selected ${files.length} file(s) for sharing`);
  }

  displaySelectedFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";

    this.selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className =
        "bg-white bg-opacity-10 rounded-lg p-4 flex items-center justify-between slide-in";
      fileItem.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                ${this.getFileIcon(file.type)}
                            </div>
                            <div>
                                <div class="text-white font-medium">${
                                  file.name
                                }</div>
                                <div class="text-blue-200 text-sm">${this.formatFileSize(
                                  file.size
                                )} • ${file.type || "Unknown type"}</div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="text-blue-200 text-sm">${this.getFileCategory(
                              file.type
                            )}</div>
                            <button onclick="p2pShare.removeFile(${index})" class="text-red-400 hover:text-red-300 transition-colors p-1">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    `;
      fileList.appendChild(fileItem);
    });
  }

  getFileIcon(type) {
    if (type.startsWith("image/")) {
      return '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
    } else if (type.startsWith("video/")) {
      return '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>';
    } else if (type.includes("pdf")) {
      return '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path></svg>';
    }
    return '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>';
  }

  getFileCategory(type) {
    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Audio";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("text")) return "Text";
    if (type.includes("zip") || type.includes("rar")) return "Archive";
    return "File";
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.displaySelectedFiles();
  }

  showPeerSuggestions(query) {
    const suggestions = document.getElementById("peerSuggestions");
    const peers = Array.from(this.peers.values()).filter(
      (peer) =>
        peer.name.toLowerCase().includes(query.toLowerCase()) ||
        peer.id.toLowerCase().includes(query.toLowerCase())
    );

    if (query && peers.length > 0) {
      suggestions.innerHTML = peers
        .map(
          (peer) => `
                        <div class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white" onclick="p2pShare.selectPeer('${peer.id}', '${peer.name}')">
                            <div class="font-medium">${peer.name}</div>
                            <div class="text-sm text-gray-400">${peer.id} • ${peer.latency}ms</div>
                        </div>
                    `
        )
        .join("");
      suggestions.classList.remove("hidden");
    } else {
      suggestions.classList.add("hidden");
    }
  }

  selectPeer(id, name) {
    document.getElementById("targetPeer").value = `${name} (${id})`;
    document.getElementById("peerSuggestions").classList.add("hidden");
  }

  sendFiles() {
    const targetInput = document.getElementById("targetPeer").value.trim();

    if (!targetInput) {
      alert("Please select a peer to send files to");
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert("Please select files to send");
      return;
    }

    const targetPeer = this.extractPeerId(targetInput);
    this.startFileTransfer(targetPeer, this.selectedFiles);
  }

  broadcastFiles() {
    if (this.selectedFiles.length === 0) {
      alert("Please select files to broadcast");
      return;
    }

    const activePeers = Array.from(this.peers.keys());
    if (activePeers.length === 0) {
      alert("No active peers to broadcast to");
      return;
    }

    activePeers.forEach((peerId) => {
      this.startFileTransfer(peerId, this.selectedFiles, true);
    });
  }

  extractPeerId(input) {
    const match = input.match(/\(([^)]+)\)/);
    return match ? match[1] : input;
  }

  startFileTransfer(targetPeer, files, isBroadcast = false) {
    const transferSection = document.getElementById("transferSection");
    const transferList = document.getElementById("transferList");

    transferSection.classList.remove("hidden");

    files.forEach((file, index) => {
      const transferId = Date.now() + index;
      const peer = this.peers.get(targetPeer) || {
        name: targetPeer,
        id: targetPeer,
      };

      const transferItem = document.createElement("div");
      transferItem.className =
        "bg-white bg-opacity-10 rounded-lg p-4 file-transfer-animation slide-in";
      transferItem.innerHTML = `
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    ${this.getFileIcon(file.type)}
                                </div>
                                <div>
                                    <div class="text-white font-medium">${
                                      file.name
                                    }</div>
                                    <div class="text-blue-200 text-sm">To: ${
                                      peer.name
                                    } • ${this.formatFileSize(file.size)}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-blue-200 text-sm" id="status-${transferId}">Initializing...</div>
                                <div class="text-blue-300 text-xs" id="speed-${transferId}">Preparing transfer</div>
                            </div>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" id="progress-${transferId}" style="width: 0%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-blue-200">
                            <span id="transferred-${transferId}">0 MB</span>
                            <span id="eta-${transferId}">Calculating...</span>
                        </div>
                    `;
      transferList.appendChild(transferItem);

      this.simulateTransfer(transferId, file.size, peer.name, isBroadcast);
    });

    // Clear selected files
    this.selectedFiles = [];
    this.displaySelectedFiles();
    document.getElementById("targetPeer").value = "";

    this.addActivity(
      `Started ${isBroadcast ? "broadcast" : "transfer"} of ${
        files.length
      } file(s)`
    );
  }

  simulateTransfer(transferId, fileSize, peerName, isBroadcast) {
    let progress = 0;
    let transferred = 0;
    const startTime = Date.now();

    const statusEl = document.getElementById(`status-${transferId}`);
    const progressEl = document.getElementById(`progress-${transferId}`);
    const speedEl = document.getElementById(`speed-${transferId}`);
    const transferredEl = document.getElementById(`transferred-${transferId}`);
    const etaEl = document.getElementById(`eta-${transferId}`);

    const interval = setInterval(() => {
      const increment = Math.random() * 8 + 2; // 2-10% progress
      progress = Math.min(progress + increment, 100);
      transferred = (progress / 100) * fileSize;

      const elapsed = (Date.now() - startTime) / 1000;
      const speed = transferred / elapsed; // bytes per second
      const eta = progress < 100 ? (fileSize - transferred) / speed : 0;

      if (progress >= 100) {
        statusEl.textContent = "Completed";
        statusEl.className = "text-green-300 text-sm";
        speedEl.textContent = "Transfer completed successfully";
        etaEl.textContent = "Done";

        this.dataTransferred += fileSize / (1024 * 1024); // Convert to MB
        this.updateDataTransferred();
        this.addActivity(`File sent to ${peerName} successfully`);

        clearInterval(interval);
      } else {
        statusEl.textContent = "Transferring...";
        speedEl.textContent = `${this.formatSpeed(speed)} • ${progress.toFixed(
          1
        )}% complete`;
        etaEl.textContent = `${Math.ceil(eta)}s remaining`;
      }

      progressEl.style.width = `${progress}%`;
      transferredEl.textContent = this.formatFileSize(transferred);
    }, 300);
  }

  simulateIncomingFile() {
    const fileNames = [
      "document.docx",
      "presentation.pdf",
      "image.jpg",
      "video.mp4",
      "archive.zip",
      "spreadsheet.xlsx",
      "code.js",
      "design.psd",
    ];
    const peers = Array.from(this.peers.values());

    if (peers.length === 0) return;

    const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const peer = peers[Math.floor(Math.random() * peers.length)];
    const fileSize = Math.floor(Math.random() * 50 * 1024 * 1024) + 1024 * 1024; // 1MB to 50MB

    this.addIncomingFile(fileName, peer, fileSize);
    this.addActivity(`Received ${fileName} from ${peer.name}`);
  }

  addIncomingFile(fileName, peer, fileSize) {
    const receivedFiles = document.getElementById("receivedFiles");

    // Remove "no files" message if it exists
    const noFilesMsg = receivedFiles.querySelector(".text-center");
    if (noFilesMsg) noFilesMsg.remove();

    const fileItem = document.createElement("div");
    fileItem.className = "bg-white bg-opacity-10 rounded-lg p-4 slide-in";
    fileItem.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="text-white font-medium">${fileName}</div>
                                <div class="text-blue-200 text-sm">From: ${
                                  peer.name
                                } • ${this.formatFileSize(fileSize)}</div>
                                <div class="text-green-300 text-xs">${new Date().toLocaleTimeString()}</div>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="p2pShare.downloadFile(this)" class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105">
                                Download
                            </button>
                            <button onclick="p2pShare.previewFile(this, '${fileName}')" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                                👁️
                            </button>
                        </div>
                    </div>
                `;

    receivedFiles.insertBefore(fileItem, receivedFiles.firstChild);
  }

  downloadFile(button) {
    button.innerHTML = "✓ Downloaded";
    button.className =
      "bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed";
    button.disabled = true;
  }

  previewFile(button, fileName) {
    alert(
      `Preview functionality for ${fileName} would open here in a real implementation`
    );
  }

  updatePeerList() {
    const peerList = document.getElementById("peerList");
    peerList.innerHTML = "";

    if (this.peers.size === 0) {
      peerList.innerHTML = `
                        <div class="text-center py-6 text-blue-200">
                            <svg class="mx-auto h-8 w-8 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                            </svg>
                            <p class="text-sm">No peers online</p>
                        </div>
                    `;
      return;
    }

    Array.from(this.peers.values()).forEach((peer) => {
      const peerItem = document.createElement("div");
      peerItem.className =
        "bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all transform hover:scale-[1.02] slide-in";
      peerItem.onclick = () => this.selectPeer(peer.id, peer.name);

      const statusColor = peer.status === "online" ? "green" : "yellow";

      peerItem.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-gradient-to-br from-${statusColor}-500 to-${statusColor}-600 rounded-full flex items-center justify-center">
                                    <span class="text-white text-xs font-bold">${peer.name
                                      .charAt(0)
                                      .toUpperCase()}</span>
                                </div>
                                <div>
                                    <div class="text-white font-medium text-sm">${
                                      peer.name
                                    }</div>
                                    <div class="text-${statusColor}-300 text-xs">${
        peer.status
      } • ${peer.latency}ms</div>
                                </div>
                            </div>
                            <div class="w-2 h-2 bg-${statusColor}-400 rounded-full pulse-dot"></div>
                        </div>
                    `;
      peerList.appendChild(peerItem);
    });

    document.getElementById("peerCount").textContent = this.peers.size;
  }

  updateConnectionStatus(connected) {
    const wsStatus = document.getElementById("wsStatus");
    const reconnectBtn = document.getElementById("reconnectBtn");
    const myPeerId = document.getElementById("myPeerId");

    if (connected) {
      wsStatus.innerHTML = `
                        <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                        <span class="text-green-300 font-medium">Connected</span>
                    `;
      reconnectBtn.classList.add("hidden");
      myPeerId.textContent = this.peerId;
    } else {
      wsStatus.innerHTML = `
                        <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span class="text-red-300 font-medium">Disconnected</span>
                    `;
      reconnectBtn.classList.remove("hidden");
      myPeerId.textContent = "Disconnected";
    }
  }

  updateDataTransferred() {
    document.getElementById("dataTransferred").textContent =
      this.dataTransferred.toFixed(1) + " MB";
  }

  addActivity(message) {
    const activityFeed = document.getElementById("activityFeed");
    const timestamp = new Date().toLocaleTimeString();

    const activity = document.createElement("div");
    activity.className = "text-green-400 text-sm font-mono mb-1 slide-in";
    activity.textContent = `[${timestamp}] ${message}`;

    activityFeed.insertBefore(activity, activityFeed.firstChild);

    // Keep only last 10 activities
    while (activityFeed.children.length > 10) {
      activityFeed.removeChild(activityFeed.lastChild);
    }

    activityFeed.scrollTop = 0;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatSpeed(bytesPerSecond) {
    return this.formatFileSize(bytesPerSecond) + "/s";
  }

  refreshPeers() {
    this.addActivity("Refreshing peer list...");
    // In real implementation, this would send a discovery request
    setTimeout(() => {
      this.addActivity("Peer discovery completed");
    }, 500);
  }

  reconnect() {
    this.addActivity("Attempting to reconnect...");
    this.setupWebSocket();
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        // In real implementation, send heartbeat to server
        this.addActivity("Heartbeat sent");
      }
    }, 30000); // Every 30 seconds
  }

  updateUI() {
    // Update UI elements periodically
    setInterval(() => {
      this.updatePeerList();
    }, 5000);
  }
}

// Initialize the P2P file sharing application
const p2pShare = new P2PFileShare();
