import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

//dom 選到對應的HTML 標籤
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//輸入中的loading 狀態
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//設定文字逐一顯現，以每隔20毫秒，如果沒設定這個，畫面更新會一次生成，
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

//透過時間戳與random 生成一個id
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//引入對應的參數
function chatStripe(isAi, value, uniqueId) {
  return ` 
     <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
  //阻止表單送出
  e.preventDefault();
  const data = new FormData(form);

  //使用者的聊天欄
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //機器人的聊天欄
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  //限制聊天對話框的的size，限定在box裡面
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //每一個DIV 訊息欄都要有一個id
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch 後端的api ->bot's response

  const response = await fetch("http://localhost:8000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //使用者輸入的內容
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  //執行完畢，清除loading 的狀態
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "請求次數已達上限";
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
