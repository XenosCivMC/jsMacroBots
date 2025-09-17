
const SERVICE_NAME = event.serviceName;

function createButton(e) {

  if (e.screenName == "Game Menu") {
    const screen = e.screen;
    // Chat.log(screen.getButtonWidgets());
    // const result = screen.getButtonWidgets().find(obj => obj.getLabel() == "Disconnect");
    // const discBtn = screen.getButtonWidgets()[7];
    // Chat.log(discBtn.getX());
    // Chat.log(discBtn.getY());
    // Chat.log(discBtn.getWidth());
    // Chat.log(discBtn.getHeight());
    // discBtn.setLabel("Save Logout");
    const btn = screen.addButton(
      378,
      230 + 20 + 5,
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
