// Sending data to popup.js
function sendDataToPopup(action, data) {
    chrome.runtime.sendMessage({ action: action, data: data }, (response) => {
        if (chrome.runtime.lastError)
            console.error("Message error:", chrome.runtime.lastError.message);
        else
            console.log("Response from popup.js:", response?.result);
    });
}

function showConnectionStatus(msg) {
    const message = document.createElement("div");
    message.textContent = msg;
    message.style.position = "fixed";
    message.style.bottom = "10px";
    message.style.left = "10px";
    message.style.backgroundColor = "black";
    message.style.color = "white";
    message.style.padding = "10px";
    message.style.borderRadius = "5px";
    document.body.appendChild(message);
}

const socket = new WebSocket("ws://localhost:8765");
socket.onopen = () => { showConnectionStatus("🟢 Connected"); };
socket.onclose = () => { showConnectionStatus("🔴 Disconnected"); };
socket.onerror = () => { showConnectionStatus("❌ Error"); }

function insertPrompt(prompt) {
    const pta = document.querySelector("#prompt-textarea");
    pta.innerHTML = `<p>${prompt}</p>`;
}

function waitFor(sec) {
    return new Promise((res, rej) => { setTimeout(res, sec * 1000); });
}

async function sendPrompt() {
    const btn = document.querySelector("button[data-testid='send-button']");
    btn.click();
    await waitFor(1);
    while (document.querySelector("button[data-testid='stop-button']") !== null) {
        await waitFor(1);
    }
    await waitFor(1);
    const articles = document.querySelectorAll("article");
    const article = articles[articles.length - 1];
    const markdown = article.querySelector(".markdown");
    return markdown.textContent;
}

socket.onmessage = async (ev) => {
    insertPrompt(ev.data);
    await waitFor(1);
    const promptResponse = await sendPrompt();
    socket.send(promptResponse);
};

// Listening for data from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertAndSendPrompt") {
        insertPrompt(request.data);
        (async function () {
            await waitFor(1);
            const promptResponse = await sendPrompt();
            socket.send(promptResponse);
            sendResponse({ result: "SUCCESS" });
        })();
        return true;
    }
});