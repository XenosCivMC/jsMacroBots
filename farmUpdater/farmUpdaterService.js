// v0.1.0-alpha

/**********************************************************************/

const SERVICE_NAME = event.serviceName;

const guiScreen = Hud.createScreen("Farm Updater", false);
let farms;

function loadObjectFromFile(filename, defaultValue) {
  if (!FS.isFile(filename)) return defaultValue ? defaultValue : null;
  const file = FS.open(filename);
  const data = file.read();
  return JSON.parse(data);
}

function initFarms() {

  farms = loadObjectFromFile("farms.json");
}

function screenInit(screen) {
  const offsetX = 50;
  const offsetY = 50;
  const textSize = 150;
  const componentHeight = 16;
  const componentSpace = 2;

  farms.farms.forEach((farm, idx) => {

    screen.addText(
      farm,
      offsetX,
      offsetY + 5 + ((componentHeight +componentSpace) * idx),
      0xffffff,
      false
    );
    screen.addButton(
      offsetX + textSize, offsetY + ((componentHeight +componentSpace) * idx),
      40, componentHeight,
      -1,
      "start",
      JavaWrapper.methodToJava(() => {
        Chat.say(`/g IF-AgribotUpdates ${farm} | started`);
        screen.close();
      })
    );
    screen.addButton(
      offsetX + textSize + 40 + 5, offsetY + ((componentHeight +componentSpace) * idx),
      40, componentHeight,
      -1,
      "finish",
      JavaWrapper.methodToJava(() => {
        Chat.say(`/g IF-AgribotUpdates ${farm} | finished`);
        screen.close();
      })
    );
  });
}

function startService() {
  Chat.log(`STARTING ${SERVICE_NAME}`);

  initFarms();
  guiScreen.setOnInit(JavaWrapper.methodToJava(screenInit));
  GlobalVars.putObject("farmUpdaterGuiScreen", guiScreen);

  event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
    Hud.unregisterDraw2D(guiScreen);
    Chat.log(`${SERVICE_NAME} STOPPED.`);
  });
}

startService();
