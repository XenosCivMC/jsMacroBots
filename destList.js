// v0.4.0-alpha

// Config
const favorites = [
  "Pride Rock",
  "New Callisto (Capital)",
  { "name": "Felsenheim", "dest": "imperial priderock felsenheim" },
  { "name": "Zoryawa", "dest": "anisso zoryawa" },
];

const SOURCE_URL = "https://raw.githubusercontent.com/XenosCivMC/IF-data/refs/heads/main/railstations.json";

const buttonWidth = 140;
const buttonHeight = 15;
const buttonSpaceX = 3;
const buttonSpaceY = 1;
const buttonOffsetY = 30;
const buttonMaxLines = 12;

/**********************************************************************/
let data = [];
try {
  data = Request.get(SOURCE_URL).text();
  data = JSON.parse(data);
} catch (error) {
  Chat.log(JSON.stringify(error));
}

const createButtons = function(stations) {
  const btns = [];
  if (!stations)
    return [];
  for (let i = 0; i < stations.length; i++) {
    const dest = stations[i];
    const btn = Hud.getOpenScreen().addButton(
      buttonSpaceX + (buttonWidth + buttonSpaceX * 2) * parseInt(i / buttonMaxLines),
      buttonOffsetY + buttonSpaceY + buttonSpaceY * (i % buttonMaxLines) + buttonHeight * (i % buttonMaxLines),
      buttonWidth,
      buttonHeight,
      dest.name,
      JavaWrapper.methodToJava(() => {
        Chat.say("/dest " + dest.dest);
        Hud.getOpenScreen().close();
      })
    );
    btns.push(btn);
  }

  return btns;
};

const listener = JsMacros.on(
  "OpenScreen",
  JavaWrapper.methodToJavaAsync((screen) => {
    const screenName = screen.screenName;
    if (screenName != "Chat") return;

    let btns = [];
    btns = createButtons(data.stations);

    // Favorites
    Hud.getOpenScreen().addText("Favorites:", 500, 20, 0xffffff, true);
    let favoriteDests = [];
    if (data.stations)
      favoriteDests = data.stations.filter(station => favorites.includes(station.name));
    favoriteDests.push(...favorites.filter(item => typeof item === 'object' && item !== null));
    for (let i = 0; i < favoriteDests.length; i++) {
      const dest = favoriteDests[i];
      Hud.getOpenScreen().addButton(
        500,
        buttonOffsetY + buttonSpaceY + buttonSpaceY * i + buttonHeight * i,
        buttonWidth,
        buttonHeight,
        dest.name,
        JavaWrapper.methodToJava(() => {
          Chat.say("/dest " + dest.dest);
          Hud.getOpenScreen().close();
        })
      );
    }
    // Search
    Hud.getOpenScreen().addTextInput(
      buttonSpaceX,
      buttonSpaceY,
      buttonWidth,
      buttonHeight,
      "search...",
      JavaWrapper.methodToJava((search) => {
        for (let i = 0; i < btns.length; i++) {
          Hud.getOpenScreen().removeElement(btns[i]);
        }
        btns = [];
        let foundStation = data.stations;
        if (search)
          foundStation = data.stations.filter(station => station.name.toLowerCase().includes(search.toLowerCase()));
        if (foundStation)
          btns = createButtons(foundStation);
      })
    );
  })
);


event.stopListener = JavaWrapper.methodToJava(() => {
  JsMacros.off(listener);
});
