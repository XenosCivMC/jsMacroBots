
var threshold = 10;
let items = [
  "minecraft:golden_pickaxe",
  "minecraft:stone_axe"
]

const { selectItem } = require('./lib/inventoryUtils.js');
const SERVICE_NAME = event.serviceName;
// var item = event.item;
//
// // I dont care about armor
// if (!item.isWearable() == true) {
//   var curDamage = item.getMaxDamage() - event.damage;
//
//   if (curDamage <= threshold) {
//     Chat.log("Item saved!");
//     selectItem(item.getItemID(), true, threshold);
//   }
// f
let itemSaverEventHandler = function(event) {
  let item = event.item;
  // Chat.log(event.item)
  // Chat.log(event.oldItem)
  let itemName = event.item.getItemId().toLowerCase();
  if (items.includes(itemName)) {
    let curDamage = item.getMaxDamage() - item.getDamage();
    if (curDamage <= threshold) {
      // let player = Player.getPlayer();
      let inv = Player.openInventory();
      let curSlot = inv.getSelectedHotbarSlotIndex() + 36;
      for (const foundItemSlot of inv.findItem(itemName)) {
        if (foundItemSlot == curSlot)
          continue;
        let foundItem = inv.getSlot(foundItemSlot);
        let foundItemDmg = foundItem.getMaxDamage() - foundItem.getDamage();

        if (foundItemDmg <= threshold) {
          KeyBind.keyBind('key.forward', false);
          KeyBind.keyBind('key.jump', false);
          KeyBind.keyBind('key.sneak', false);
          inv.swap(curSlot, 1)
          Client.waitTick(5);
          inv.swap(foundItemSlot, 2)
          Client.waitTick(5);
          inv.swap(0, curSlot)
          Client.waitTick(5);
          return;
        }
      }
      // no item found: select a new one
      for (const foundItemSlot of inv.findItem(itemName)) {
        if (foundItemSlot == curSlot)
          continue;
        KeyBind.keyBind('key.forward', false);
        KeyBind.keyBind('key.jump', false);
        KeyBind.keyBind('key.sneak', false);
        inv.swap(curSlot, foundItemSlot)
      }

    }
  }
}



Chat.log(`STARTING ${SERVICE_NAME}`);
let listener = JsMacros.on('HeldItemChange', JavaWrapper.methodToJava(itemSaverEventHandler));

event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
  JsMacros.off(listener);
  Chat.log(`${SERVICE_NAME} STOPPED.`);
});
