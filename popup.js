const inputPrompt = document.getElementById("input_prompt");
const messageList = document.getElementById("message_list");

function addMessageToList(msg, error) {
    const p = document.createElement("p");
    p.style.color = error ? "lightcoral" : "lightgreen";
    p.innerText = msg;
    messageList.append(p);
}

// Sending data to content.js
function sendDataToContent(action, data) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) return addMessageToList("No active tab found", true);
        chrome.tabs.sendMessage(tabId, { action: action, data: data }, (response) => {
            if (chrome.runtime.lastError)
                addMessageToList(chrome.runtime.lastError.message, true);
            else
                addMessageToList(response?.result, false);
        });
    });
}

document.getElementById("send_prompt").addEventListener("click", () => {
    addMessageToList("Prompt sent!", false);
    sendDataToContent("insertAndSendPrompt", inputPrompt.value);
});

// Listening for data from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fromInsertPrompt") {
        addMessageToList(request.data, false);
        sendResponse({ result: "SUCCESS" });
    }
});