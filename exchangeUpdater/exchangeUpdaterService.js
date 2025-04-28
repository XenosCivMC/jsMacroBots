// v0.1.0-alpha

// Config
const DISCORD_WEBHOOK_URL = "";

/**********************************************************************/

const SERVICE_NAME = event.serviceName;

const guiScreen = Hud.createScreen("Trade GUI", false);

let ctiMode = false;
let include_out_of_stock = true;

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
    Chat.log(`Exchange updated: ${shopEntry.input.item}`);
    shopEntry = {};
  }
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
    entryStarted = Time.time();
    shopEntry = {};
    shopEntry.page = match[1];
    shopEntry.maxPage = match[2];
  }
  else if (match = msgString.match(/Input: (\d+) (.+)/)) {
    shopEntry.input = {
      count: match[1],
      item: match[2]
    };
  }
  else if (match = msgString.match(/Compacted/)) {
    shopEntry.compacted = true;
  }
  else if (match = msgString.match(/Output: (\d+) (.+)/)) {
    shopEntry.output = {
      count: match[1],
      item: match[2]
    };
  }
  else if (match = msgString.match(/(\d+) exchanges? available\./)) {
    shopEntry.exchanges = match[1];
    sendIfComplete();
  }
  else if (match = msgString.match(/Reinforced at (.+)%/)) {
    let match2 = (msgJson.hoverEvent.contents).match(/Location: (.+) (.+) (.+)/);
    shopEntry.position = {
      x: match2[1],
      y: match2[2],
      z: match2[3]
    }
    sendIfComplete();
  }
}

function getShopText() {
  let shopText = "";
  let tempEntryList = entryList.slice();
  if (!include_out_of_stock)
    tempEntryList = tempEntryList.filter(entry => entry.exchanges != 0);
  tempEntryList.forEach((entry, idx) => {
    let availableString = `(${entry.exchanges} available)`.padEnd(15);
    let inputString = `${entry.input.count} ${entry.input.item}`/* .padEnd(50) */;
    let outputString = `${entry.output.count} ${entry.output.item}`/* .padEnd(50) */;
    let entryText = `${availableString} ${inputString}`;
    shopText += `${entryText} -> ${outputString}\\n`
  });
  shopText = `\`\`\`${shopText}\`\`\``;
  shopText = shopText.replaceAll("\\\"", "");
  shopText = shopText.replaceAll("\"", "");

  return shopText;
}

function screenInit(screen) {
  const offsetX = 50;
  const offsetY = 50;
  const textSize = 300;
  const componentHeight = 16;
  const componentSpace = 2;


  entryList.forEach((entry, idx) => {
    let availableString = `(${entry.exchanges} available)`.padEnd(15);
    let inputString = `${entry.input.count} ${entry.input.item}`/* .padEnd(50) */;
    let outputString = `${entry.output.count} ${entry.output.item}`/* .padEnd(50) */;
    let entryText = `${availableString} ${inputString}`;

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

  screen.addButton(
    offsetX + 17 + componentHeight, 400,
    200, componentHeight,
    -1,
    "Copy",
    JavaWrapper.methodToJava(() => {
      let shopText = getShopText();
      shopText = shopText.replaceAll("\\n", "\n");
      console.log(shopText);
      Utils.copyToClipboard(shopText);
      screen.close();
    })
  )

  screen.addButton(
    offsetX + 17 + componentHeight + 210, 400,
    200, componentHeight,
    -1,
    "Send it to Discord",
    JavaWrapper.methodToJava(() => {

      let shopText = getShopText();
      if (DISCORD_WEBHOOK_URL) {
      let answere = Request.post(
        DISCORD_WEBHOOK_URL,
        `{"content": "${shopText}"}`,
        { "Content-Type": "application/json" }
      );
      }
      else {
        Chat.log("No Webhook url set!");
      }
      screen.close();
    })
  )

  screen.addCheckbox(
    offsetX + 17 + componentHeight, 400 + componentHeight + 10,
    200, componentHeight,
    "Include out of stock", include_out_of_stock,
    JavaWrapper.methodToJava(() => {
      include_out_of_stock = !include_out_of_stock;
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
GlobalVars.putObject("exchangeUpdaterGuiScreen", guiScreen);
