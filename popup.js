async function executeFunction(fun, args) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: fun,
        args: args
    });
    return results[0].result
}

function insertPrompt(prompt) {
    const pta = document.querySelector("#prompt-textarea");
    pta.innerHTML = `<p>${prompt}</p>`;
}

async function sendPrompt() {
    const btn = document.querySelector("button[data-testid='send-button']");
    btn.click();
    await new Promise((res, rej) => { setTimeout(res, 1000); });
    while (document.querySelector("button[data-testid='stop-button']") !== null) {
        await new Promise((res, rej) => { setTimeout(res, 1000); });
    }
    await new Promise((res, rej) => { setTimeout(res, 1000); });
    const articles = document.querySelectorAll("article");
    const article = articles[articles.length - 1];
    const markdown = article.querySelector(".markdown");
    return markdown.textContent;
}

const socket = new WebSocket("ws://localhost:8765");

socket.onopen = (_) => { console.log("Connection open."); };
socket.onclose = () => { console.log("Disconnected."); };

const inputPrompt = document.getElementById("input_prompt");
const response = document.getElementById("response");

socket.onmessage = async (ev) => {
    inputPrompt.value = ev.data;
    await executeFunction(insertPrompt, [ev.data]);
    const data = await executeFunction(sendPrompt, []);
    response.innerText = data;
    socket.send(data);
};

document.getElementById("send_prompt").addEventListener("click", async () => {
    socket.send(inputPrompt.value);
});
