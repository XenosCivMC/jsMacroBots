
const SERVICE_NAME = event.serviceName;
const TRADE_OUTPUT_FILE = "trades.txt";
const CTI_MODE_CHANGE_PART = "Toggled reinforcement information mode ";

const guiScreen = Hud.createScreen("Trade GUI", false);

let ctiMode = false;

let shopEntry = {};
let entryStarted;

let entryList = [];

// example shop entry:
// {
//   "page": 1,
//   "compacted": true,
//   "input": { "item": "Diamond Ore", "count": 64 },
//   "output": { "item": "Diamond", "count": 64 },
//   "exchanges": 1,
//   "position": {
//     "x": 100,
//     "y": 200,
//     "z": 300
//   }
// }

function isComplete() {
  let keys = ["page", "input", "output", "position", "exchanges"];

  // Chat.log(Time.time() - entryStarted);
  if ((Time.time() - entryStarted) > 300)
    return false;
  return keys.every(key => key in shopEntry);
}
function sendIfComplete() {
  if (!shopEntry.compacted) shopEntry.compacted = false;
  if (isComplete()) {

    // Chat.log(shopEntry);
    const idx = entryList.findIndex(c =>
      c.position.x === shopEntry.position.x &&
      c.position.y === shopEntry.position.y &&
      c.position.z === shopEntry.position.z
    );
    if (idx !== -1)
      entryList[idx] = shopEntry;
    else
      entryList.push(shopEntry);
    shopEntry = {};
    Chat.log(entryList.length);
  }
  // Chat.log(isComplete(entry));

}

function HandleReader(recvMessageEvent) {
  let msgJson = JSON.parse(recvMessageEvent.text.getJson()) // get formatted message from the event
  let msgString = recvMessageEvent.text.getString();


  let match;
  if (match = msgString.match(/Toggled reinforcement information mode ((off)|(on))/)) {
    ctiMode = match[1] == "on";
    Chat.log(ctiMode);
  }
  else if (match = msgString.match(/\((\d+)\/(\d+)\) exchanges present\./)) {
    // Chat.log("create shop obj " + match[1] + " von " + match[2]);
    entryStarted = Time.time();
    shopEntry = {};
    shopEntry.page = match[1];
    shopEntry.maxPage = match[2];
  }
  else if (match = msgString.match(/Input: (\d+) (.+)/)) {
    // Chat.log("input: " + match[1] + " | " + match[2]);
    shopEntry.input = {
      count: match[1],
      item: match[2]
    };
  }
  // TODO: something something compacted
  else if (match = msgString.match(/Compacted/)) {
    shopEntry.compacted = true;
  }
  else if (match = msgString.match(/Output: (\d+) (.+)/)) {
    // Chat.log("output: " + match[1] + " | " + match[2]);
    shopEntry.output = {
      count: match[1],
      item: match[2]
    };
  }
  else if (match = msgString.match(/(\d+) exchanges? available\./)) {
    // Chat.log("available: " + match[1]);
    shopEntry.exchanges = match[1];
    sendIfComplete();
  }
  else if (match = msgString.match(/Reinforced at (.+)%/)) {
    let match2 = (msgJson.hoverEvent.contents).match(/Location: (.+) (.+) (.+)/);
    // Chat.log(match2[1] + "|" + match2[2] + "|" + match2[3]);
    shopEntry.position = {
      x: match2[1],
      y: match2[2],
      z: match2[3]
    }
    sendIfComplete();
  }
}

function screenInit(screen) {
  const offsetX = 50;
  const offsetY = 50;
  const textSize = 300;
  const componentHeight = 16;
  const componentSpace = 2;

  let shopText = "";

  entryList.forEach((entry, idx) => {
    Chat.log(entry.input);

    // let entryText = entry.input.item + " -> " + entry.output.item;
    let availableString = `(${entry.exchanges} available)`.padEnd(15);
    let inputString = `${entry.input.count} ${entry.input.item}`/* .padEnd(50) */;
    let outputString = `${entry.output.count} ${entry.output.item}`/* .padEnd(50) */;
    let entryText = `${availableString} ${inputString}`;
    shopText += `${entryText} -> ${outputString}\\n`

    screen.addText(
      entryText,
      offsetX + 17 + componentHeight,
      offsetY + 4 + idx * componentHeight + idx * componentSpace,
      0xffffff,
      false
    );
    screen.addText(
      `-> ${outputString}`,
      offsetX + 17 + componentHeight + textSize,
      offsetY + 4 + idx * componentHeight + idx * componentSpace,
      0xffffff,
      false
    );
  });

  shopText = `\`\`\`${shopText}\`\`\``;
  shopText = shopText.replaceAll("\\\"", "");
  shopText = shopText.replaceAll("\"", "");
  Chat.log(shopText.length);
  screen.addButton(
    offsetX + 17 + componentHeight, 400,
    200, componentHeight,
    -1,
    "Send it to Discord",
    JavaWrapper.methodToJava(() => {

      let answere = Request.post(
        "https://discord.com/api/webhooks/1356231555428909197/tdC_5lMDbuWgQQRDUUAEOIJDmBqHsjew5cxHS7-TLJZCS3SW3SPQuftEOXrKSLFdgYym",
        `{"content": "${shopText}"}`,
        { "Content-Type": "application/json" }
      );
    })
  )
}

guiScreen.setOnInit(JavaWrapper.methodToJava(screenInit));

function startReader() {
  Chat.log(`STARTING ${SERVICE_NAME}`);
  let listener = JsMacros.on('RecvMessage', JavaWrapper.methodToJava(HandleReader));

  event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
    JsMacros.off(listener);
    Hud.unregisterDraw2D(guiScreen);
    Chat.log(`${SERVICE_NAME} STOPPED.`);
  });
}

startReader();
GlobalVars.putObject("TradeGuiScreen", guiScreen);
