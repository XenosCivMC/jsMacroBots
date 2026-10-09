var botname = "XenosBrewBot";
const farmLength = 1;
const globalTickWait = 4;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');
const { getDistance, getCenterPosition, directionToString, getPlayerDirection } = require('./lib/vectorUtils.js');
const { selectItem, dropResources, freeInventorySlots } = require('./lib/inventoryUtils.js');

const storeMapping = {
  0: "Electricity",
  1: "Electricity",
  2: "Electricity",
  3: "Hydrogen",
  4: "Hydrogen",
  5: "Hydrogen",
  6: "Hydrogen",
  9: "Helium",
  10: "Helium",
  11: "Helium",
  12: "Carbon",
  13: "Carbon",
  14: "Carbon",
};

const recipes = [{
  result: "Oxygen",
  time: 3 * 60 * 20, // 3min in ticks
  count: 3,
  ingredients: [{
    name: "Carbon",
    count: 1
  }, {
    name: "Helium",
    count: 1
  }]

}, {
  result: "Carbon",
  time: 3 * 60 * 20, // 3min in ticks
  count: 3,
  ingredients: [{
    name: "Helium",
    count: 3
  }]

}, {
  result: "Helium",
  time: 3 * 60 * 20, // 3min in ticks
  count: 3,
  ingredients: [{
    name: "Hydrogen",
    count: 2
  }]

}, {
  result: "Hydrogen",
  time: 3 * 60 * 20, // 3min in ticks
  count: 3,
  ingredients: [{
    name: "Electricity",
    count: 1
  }, {
    name: "Ice",
    count: 1
  }]

}, {
  result: "Electricity",
  time: 30 * 20, // 30s in ticks
  count: 3,
  ingredients: [{
    name: "Redstone Torch",
    count: 1
  }]

}];

const currentCauldrons = [];
let found;

function setupCauldrons(mainDir) {
  const player = Player.getPlayer();
  const playerPos = player.getPos();
  for (let i = 0; i < farmLength; i++) {
    const cauldronPos = {
      x: Math.floor(playerPos.x) + 0.5,
      y: Math.floor(playerPos.y) + 0.5,
      z: Math.floor(playerPos.z) + 0.5,
    };
    currentCauldrons.push({
      inUse: false,
      startTime: -1,
      recipe: null,
      pos: cauldronPos,
      visuals: {
        text: null,
        rect: null
      }
    });
  }
}

function getContainerItems() {
  const inv = Player.openInventory();
  const invMap = inv.getMap();
  const containerMap = invMap.container;
  const result = [];
  for (var i = 0; i < containerMap.length; i++) {
    var slotNumber = containerMap[i];
    result.push(inv.getSlot(slotNumber));
  }
  return result;
}

function getItemSummary() {

  const inv = Player.openInventory();
  const itemList = getContainerItems();
  const result = {};
  itemList.forEach(item => {
    const itemName = item.getName().getString();
    if (itemName === "Air") {
      return; // Skip
    }
    if (result[itemName]) {
      result[itemName]++;
    } else {
      result[itemName] = 1;
    }
  });

  const finds = inv.findItem("minecraft:ice");
  if (finds.length > 0) {
    const item = inv.getSlot(finds[0]);
    result[item.getName().getString()] = item.getCount();
  }
  const finds2 = inv.findItem("minecraft:redstone_torch");
  if (finds2.length > 0) {
    const item = inv.getSlot(finds2[0]);
    result[item.getName().getString()] = item.getCount();
  }

  return result;
}

function getNextRecipe() {
  const containerItems = getContainerItems();
  const items = getItemSummary(containerItems);
  for (const recipe of recipes) {
    const hasAllIngredients = recipe.ingredients.every(ingredient => {
      const available = items[ingredient.name] || 0;
      return available >= ingredient.count;
    });

    if (hasAllIngredients) {
      return recipe;
    }
  }
  return null;
}

function storeBrews() {
  const inv = Player.openInventory();
  const invMap = inv.getMap();
  const mainHotbarMap = invMap.main.concat(invMap.hotbar);
  for (var i = 0; i < mainHotbarMap.length; i++) {
    const slotNumber = mainHotbarMap[i];
    const item = inv.getSlot(slotNumber);
    if (item.getItemId() !== "minecraft:potion")
      continue;
    for (const containerSlot in storeMapping) {

      const containerItem = inv.getSlot(parseInt(containerSlot));
      if (containerItem.getItemId() !== "minecraft:air")
        continue;
      if (storeMapping[containerSlot] != item.getName().getString())
        continue;
      inv.swap(slotNumber, parseInt(containerSlot));
      Client.waitTick(globalTickWait);
      break;
    }
  }
}

function pickupIngredients(recipe) {
  const inv = Player.openInventory();
  const invMap = inv.getMap();
  const containerMap = invMap.container;
  recipe.ingredients.forEach(ingredient => {
    for (let j = 0; j < ingredient.count; j++) {
      for (var i = 0; i < containerMap.length; i++) {
        const slotNumber = containerMap[i];
        const item = inv.getSlot(slotNumber);
        if (item.getName().getString() != ingredient.name)
          continue;

        const freeHotbarSlot = inv.findFreeHotbarSlot();
        if (freeHotbarSlot) {
          inv.swap(slotNumber, freeHotbarSlot);
          Client.waitTick(globalTickWait);
        }
        break;
      }
    }
  });
}

function findInHotbar(name) {

  const inv = Player.openInventory();
  const invMap = inv.getMap();
  const hotbarMap = invMap.hotbar;
  for (var i = 0; i < hotbarMap.length; i++) {
    const slotNumber = hotbarMap[i];
    const item = inv.getSlot(slotNumber);
    if (item.getName().getString() == name)
      return slotNumber - 36;
  }
}

function fillIngredients(recipe) {
  const inv = Player.openInventory();
  const player = Player.getPlayer();
  recipe.ingredients.forEach(ingredient => {
    for (let j = 0; j < ingredient.count; j++) {
      const hotbarSlot = findInHotbar(ingredient.name);
      inv.setSelectedHotbarSlotIndex(hotbarSlot);
      player.interact();
      // Chat.log("click");
      Client.waitTick(globalTickWait);
    }
  });
  const bottleSlot = findInHotbar("Glass Bottle");
  inv.grabAll(bottleSlot + 36);
  inv.click(bottleSlot + 36);
  Client.waitTick(globalTickWait);
  // setTimer(0, recipe);
}

function resetTimer(index) {

  currentCauldrons[index].inUse = false;
  currentCauldrons[index].startTime = -1;
  currentCauldrons[index].recipe = null;
  const surf = currentCauldrons[index].visuals.text.parent;
  surf.removeElement(currentCauldrons[index].visuals.text);
  const surfBg = currentCauldrons[index].visuals.rect.parent;
  surfBg.removeElement(currentCauldrons[index].visuals.rect);
}

function setTimer(index, recipe) {
  currentCauldrons[index].inUse = true;
  currentCauldrons[index].startTime = World.getTime();
  currentCauldrons[index].recipe = recipe;
  const surf = found.addDraw2D(
    -3073,
    -9.5,
    -15315.5,
    // -90, 0, 0
  );
  surf.setRotateToPlayer(true);
  surf.setRotateCenter(true);
  currentCauldrons[index].visuals.text = surf.addText("0.00%", 90, 100, 0xFFFFFF, true);
  const surfBg = found.addDraw2D(
    -3073,
    -10,
    -15316,
    -90, 0, 0
  );
  currentCauldrons[index].visuals.rect = surfBg.addRect(0, 0, 200, 200, 0xFF0000, 80);
}

function updateVisuals(index, percent) {

  const currentCauldron = currentCauldrons[index];
  const percentText = (100.0 * percent).toFixed(2) + "%";
  // Chat.log(percentText);
  currentCauldron.visuals.text.setText(percentText);
  currentCauldron.visuals.rect.setColor(percentageToColor(percent), 80);
}

function collect(dir) {
  const inv = Player.openInventory();
  const player = Player.getPlayer();
  const playerPos = player.getPos();
  const cauldronPos = {
    x: Math.floor(playerPos.x) + 0.5 + dir.x,
    y: Math.floor(playerPos.y) + 0.5,
    z: Math.floor(playerPos.z) + 0.5 + dir.z,
  };
  const bottleSlot = findInHotbar("Glass Bottle");
  inv.setSelectedHotbarSlotIndex(bottleSlot);
  Client.waitTick(globalTickWait);
  player.lookAt(cauldronPos.x, cauldronPos.y, cauldronPos.z);
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  player.lookAt(0, 90);
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  storeBrews();
  Client.waitTick(globalTickWait);
  inv.close();
  Client.waitTick(globalTickWait);
  resetTimer(0);
  Client.waitTick(globalTickWait);
}
function brew(dir) {
  const inv = Player.openInventory();
  const player = Player.getPlayer();
  const playerPos = player.getPos();
  const cauldronPos = {
    x: Math.floor(playerPos.x) + 0.5 + dir.x,
    y: Math.floor(playerPos.y) + 0.5,
    z: Math.floor(playerPos.z) + 0.5 + dir.z,
  };
  const waterPos = { // look a bit higher to really click on the water
    x: Math.floor(playerPos.x) + 0.5 + (dir.x * 3),
    y: Math.floor(playerPos.y) + 0.5,
    z: Math.floor(playerPos.z) + 0.5 + (dir.z * 3),
  };
  const bucketSlot = findInHotbar("Bucket");
  player.lookAt(waterPos.x, waterPos.y, waterPos.z);
  inv.setSelectedHotbarSlotIndex(bucketSlot);
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  player.lookAt(cauldronPos.x, cauldronPos.y, cauldronPos.z);
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  player.lookAt(0, 90);
  Client.waitTick(globalTickWait);
  player.interact();
  Client.waitTick(globalTickWait);
  const recipe = getNextRecipe();
  pickupIngredients(recipe);
  Client.waitTick(globalTickWait);
  inv.close();
  Client.waitTick(globalTickWait);
  player.lookAt(cauldronPos.x, cauldronPos.y, cauldronPos.z);
  Client.waitTick(globalTickWait);
  fillIngredients(recipe);
}

function percentageToColor(percentage) {
  const p = Math.min(1, Math.max(0, percentage));

  const red = Math.round(255 * p);
  const green = Math.round(255 * (1 - p));
  const blue = 0;

  return (red << 16) | (green << 8) | blue;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// toggleGlobalVar(botname);

brew({ x: 0, z: -1 });
Chat.log("finished");

// const inv = Player.openInventory();
// const player = Player.getPlayer();
// Client.waitTick(3);
// player.lookAt(0, 90);
// Client.waitTick(3);
// player.interact();
// Client.waitTick(3);
// storeBrews();
// Client.waitTick(3);
// inv.close();
// Client.waitTick(3);
// collect({ x: 0, z: -1 });

if (isRunning(botname)) {
  found = Hud.createDraw3D();
  Hud.registerDraw3D(found);
  setupCauldrons({ x: -1, z: 0 });
  // brew({ x: 0, z: -1 });
  // Player.getPlayer().interact();
  // Client.waitTick(5);
  // const recipe = getNextRecipe();
  // setTimer(0, recipe);
  // pickupIngredients(recipe);
  // storeBrews();
  // const time = World.getTime();
  // Chat.log(time);
}

let walkTarget = null;
let targetAction = null;

while (isRunning(botname)) {

  if (walkTarget) {
    const player = Player.getPlayer();
    const distance = getDistance(player.getPos(), walkTarget);

    if (distance < 0.5) {
      if (targetAction == "brew")
        brew({ x: 0, z: -1 });
      else
        collect({ x: 0, z: -1 });
      walkTarget = null;
      targetAction = null;
    }
  }

  for (let i = 0; i < currentCauldrons.length; i++) {
    const currentCauldron = currentCauldrons[i];
    if (currentCauldron.inUse) {
      const passedTime = World.getTime() - currentCauldron.startTime;
      const percentFinished = passedTime / currentCauldron.recipe.time;
      updateVisuals(i, percentFinished);
      if (percentFinished > 1) {
        if (!walkTarget) {
          walkTarget = currentCauldron.pos;
          targetAction = "collect";
        }
      }
    } else {
      if (!walkTarget) {
        walkTarget = currentCauldron.pos;
        targetAction = "brew";
      }
    }
  }

  Client.waitTick(globalTickWait);
  if (!isRunning(botname)) {
    cleanup(botname);
    Hud.unregisterDraw3D(found);
  }
}
