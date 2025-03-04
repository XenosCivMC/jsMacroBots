// Config
const dests = [
  { name: "Felsenheim", dest: "imperial priderock felsenheim" },
  { name: "Priderock", dest: "imperial priderock" },
  { name: "New Callisto", dest: "imperial newcallisto" },
  { name: "Regensburg", dest: "imperial regensburg" },
  { name: "Groveheart", dest: "bay groveheart" },
  { name: "Arlington", dest: "karydia arlington" },
]

const buttonWidth = 100;
const buttonHeight = 15;
const buttonSpace = 3;

/**********************************************************************/
const listener = JsMacros.on(
  "OpenScreen",
  JavaWrapper.methodToJavaAsync((screen) => {
    const screenName = screen.screenName;
    if (screenName != "Chat") return;
    for (let i = 0; i < dests.length; i++) {
      let dest = dests[i];
      Hud.getOpenScreen().addButton(
        buttonSpace,
        buttonSpace + buttonSpace * i + buttonHeight * i,
        buttonSpace + buttonWidth,
        buttonSpace + buttonHeight,
        dest.name,
        JavaWrapper.methodToJava(() => {
          Chat.say("/dest " + dest.dest);
          Hud.getOpenScreen().close();
        })
      );
    }
  })
);


event.stopListener = JavaWrapper.methodToJava(() => {
  JsMacros.off(listener);
});
