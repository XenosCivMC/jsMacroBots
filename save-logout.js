
const SERVICE_NAME = event.serviceName;

function createButton(e) {

  if (e.screenName == "Game Menu") {
    const screen = e.screen;
    screen.addButton(
      378,
      230 + 40 + 5,
      204,
      20,
      "Save Logout",
      JavaWrapper.methodToJava(() => {
        Chat.say("/logout");
        Hud.getOpenScreen().close();
      })
    );
  }
}

function startService() {
  Chat.log(`STARTING ${SERVICE_NAME}`);
  const listener = JsMacros.on('OpenScreen', JavaWrapper.methodToJava(createButton));

  event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
    JsMacros.off(listener);
    Chat.log(`${SERVICE_NAME} STOPPED.`);
  });
}

startService();
