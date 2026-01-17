// v0.2.0-alpha

// Config
const DISCORD_WEBHOOK_URL = "";

const abbreviations = {
  "Eye of Ender \"Player Essence\"": "Player Essence",
};
const enchants = [
  "Unbreaking 1",
  "Unbreaking 2",
  "Unbreaking 3",
  "Efficiency 1",
  "Efficiency 2",
  "Efficiency 3",
  "Efficiency 4",
  "Efficiency 5",
  "Silk Touch 1",
  "Fortune 1",
  "Fortune 2",
  "Fortune 3",
  "Protection 1",
  "Protection 2",
  "Protection 3",
  "Protection 4",
  "Protection 5",
  "Aqua Affinity 1",
  "Respiration 1",
  "Respiration 2",
  "Respiration 3",
  "Depth Strider 1",
  "Depth Strider 2",
  "Depth Strider 3",
  "Feather Falling 1",
  "Feather Falling 2",
  "Feather Falling 3",
  "Feather Falling 4",
];
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
  const keys = ["page", "input", "output", "exchanges"];

  if ((Time.time() - entryStarted) > 300)
    return false;
  return keys.every(key => key in shopEntry);
}

function sendIfComplete() {
  if (!shopEntry.compacted) shopEntry.compacted = false;
  if (isComplete()) {

    // Chat.log(shopEntry);
    const idx = entryList.findIndex(c =>
      c.output.item === shopEntry.output.item &&
      c.output.count === shopEntry.output.count &&
      c.input.item === shopEntry.input.item &&
      c.input.count === shopEntry.input.count &&
      c.page === shopEntry.page
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
  const msgJson = JSON.parse(recvMessageEvent.text.getJson()); // get formatted message from the event
  const msgString = recvMessageEvent.text.getString();

  const patterns = [
    {
      description: "toggle cfi mode",
      regex: /Toggled reinforcement information mode ((off)|(on))/,
      action: function(match) {
        ctiMode = match[1] == "on";
        Chat.log(ctiMode);
      }
    }, {
      description: "page number",
      regex: /\((\d+)\/(\d+)\) exchanges present\./,
      action: function(match) {
        entryStarted = Time.time();
        shopEntry = {};
        shopEntry.page = match[1];
        shopEntry.maxPage = match[2];
      }
    }, {
      description: "Input item",
      regex: /Input: (\d+) (.+)/,
      action: function(match) {
        shopEntry.input = {
          count: match[1],
          item: match[2]
        };

        console.log(shopEntry.input.item)
        if (abbreviations[shopEntry.input.item])
          shopEntry.input.item = abbreviations[shopEntry.input.item];
      }
    }, {
      description: "is compacted",
      regex: /Compacted/,
      action: function() {
        shopEntry.compacted = true;
      }
    }, {
      description: "Output item",
      regex: /Output: (\d+) (.+)/,
      action: function(match) {
        shopEntry.output = {
          count: match[1],
          item: match[2]
        };
        if (abbreviations[shopEntry.output.item])
          shopEntry.output.item = abbreviations[shopEntry.output.item];
      }
    }, {
      description: "Exchanges left",
      regex: /(\d+) exchanges? available\./,
      action: function(match) {
        shopEntry.exchanges = match[1];
        sendIfComplete();
      }
    }, /*{
      description: "Position",
      regex: /Reinforced at (.+)%/,
      action: function() {
        const match2 = (msgJson.hoverEvent.contents).match(/Location: (.+) (.+) (.+)/);
        shopEntry.position = {
          x: match2[1],
          y: match2[2],
          z: match2[3]
        };
        sendIfComplete();
      }
    }*/
    {
      description: "Everything else",
      regex: /.*/,
      action: function(match) {
          match = match[0].trim();
        if (enchants.includes(match)) {
          shopEntry.output.item += " " + match;
        }
      }
    }
  ];

  for (const pattern of patterns) {
    const match = msgString.match(pattern.regex);
    if (match) {
      pattern.action(match);
      break;
    }
  }
}

function getShopText() {
  let shopText = "";
  let tempEntryList = entryList.slice();
  if (!include_out_of_stock)
    tempEntryList = tempEntryList.filter(entry => entry.exchanges != 0);
  tempEntryList.forEach((entry) => {
    const availableString = `(${entry.exchanges.toString().padStart(2)} available)`;
    let inputUnit;
    if (!entry.compacted)
      inputUnit = `(${entry.input.count.toString().padStart(2)})`;
    else if (entry.input.count == 64)
      inputUnit = `( 1 CS)`;
    else
      inputUnit = `(${entry.input.count.toString().padStart(2)} CI)`;
    inputUnit = inputUnit.padEnd(7);
    const inputString = `${entry.input.item.padEnd(14)} ${inputUnit}`;
    const outputString = `${entry.output.count.toString().padStart(2)} ${entry.output.item}`/* .padEnd(50) */;
    const entryText = `${availableString} ${inputString}`;
    shopText += `${entryText} -> ${outputString}\\n`;
  });
  shopText = `\`\`\`\\n${shopText}\`\`\``;
  shopText = shopText.replaceAll("\\\"", "");
  shopText = shopText.replaceAll("\"", "");

  return shopText;
}

function getSpreadsheetText() {
  let shopText = "";
  let tempEntryList = entryList.slice();
  if (!include_out_of_stock)
    tempEntryList = tempEntryList.filter(entry => entry.exchanges != 0);
  tempEntryList.forEach((entry) => {
    const inputItem = `${entry.input.item}`;
    const inputCount = entry.input.count;
    let outputItem = `${entry.output.item}`;
    let outputCount = entry.output.count;
    // TODO: I think compacted needs to be in input/output item
    if (entry.compacted) {
      if (entry.output.count == 64) {
        outputItem = "CS " + outputItem;
        outputCount = 1;

      } else
        outputItem = "CI " + outputItem;
    }
    const entryText = `${inputItem}	${inputCount}	${outputItem}	${outputCount}	${entry.exchanges}`;
    shopText += `${entryText}\n`;
  });

  return shopText;
  // return "Test	123" + "\n" + "foo	456";
}

function screenInit(screen) {
  const offsetX = 50;
  const offsetY = 50;
  const textSize = 300;
  const componentHeight = 16;
  const componentSpace = 2;


  entryList.forEach((entry, idx) => {
    const availableString = `(${entry.exchanges.toString().padStart(2)} available)`;
    let inputUnit;
    if (!entry.compacted)
      inputUnit = `(${entry.input.count.toString().padStart(2)})`;
    else if (entry.input.count == 64)
      inputUnit = `( 1 CS)`;
    else
      inputUnit = `(${entry.input.count.toString().padStart(2)} CI)`;
    inputUnit = inputUnit.padEnd(7);
    const inputString = `${entry.input.item.padEnd(14)} ${inputUnit}`;
    const outputString = `${entry.output.count.toString().padStart(2)} ${entry.output.item}`/* .padEnd(50) */;
    const entryText = `${availableString} ${inputString}`;

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
  );

  screen.addButton(
    offsetX + 17 + componentHeight + 210, 400,
    200, componentHeight,
    -1,
    "Send to Discord",
    JavaWrapper.methodToJava(() => {

      if (DISCORD_WEBHOOK_URL) {
        const shopText = getShopText();
        Request.post(
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
  );

  screen.addButton(
    offsetX + 17 + componentHeight + 420, 400,
    200, componentHeight,
    -1,
    "Clear",
    JavaWrapper.methodToJava(() => {
      entryList = [];
      screen.close();
    })
  );

  screen.addButton(
    offsetX + 17 + componentHeight + 620, 400,
    200, componentHeight,
    -1,
    "Send to log",
    JavaWrapper.methodToJava(() => {
      const shopText = getSpreadsheetText();
      console.log(shopText);
      entryList = [];
      screen.close();
    })
  );

  screen.addCheckbox(
    offsetX + 17 + componentHeight, 400 + componentHeight + 10,
    200, componentHeight,
    "Include out of stock", include_out_of_stock,
    JavaWrapper.methodToJava(() => {
      include_out_of_stock = !include_out_of_stock;
    })
  );
}



guiScreen.setOnInit(JavaWrapper.methodToJava(screenInit));

function startReader() {
  Chat.log(`STARTING ${SERVICE_NAME}`);
  const listener = JsMacros.on('RecvMessage', JavaWrapper.methodToJava(HandleReader));

  event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
    JsMacros.off(listener);
    Hud.unregisterDraw2D(guiScreen);
    Chat.log(`${SERVICE_NAME} STOPPED.`);
  });
}

startReader();
GlobalVars.putObject("exchangeUpdaterGuiScreen", guiScreen);
