
var threshold = 10;

var getEmptyInventorySpace = function() {
  var inv = Player.openInventory();
  var slots = inv.getMap();
  for (var slot in slots["main"]) {

    // skip armor slots
    if (slot >= 0 && slot <= 8 && slot != 45)
      continue;
    item = inv.getSlot(slot)
    if (!item.getItemId().includes("pickaxe"))
      return slot;
  }
  return -1;
}

var findItemSlot = function() {
  var inv = Player.openInventory();
  var slots = inv.getMap();
  for (var slot in slots["main"]) {

    // skip armor slots
    if (slot >= 0 && slot <= 8 && slot != 45)
      continue;
    item = inv.getSlot(slot)
    if (!item.getItemId().includes("pickaxe"))
      return slot;
  }
  return -1;
}

var item = event.item;

// I dont care about armor
if (!item.isWearable() == true) {
  var curDamage = item.getMaxDamage() - event.damage;

  if (curDamage <= threshold) {
    Chat.log("Item saved!");
    var inv = Player.openInventory();
    var emptySlot = getEmptyInventorySpace();
    var curSlot = inv.getSelectedHotbarSlotIndex();

    if (emptySlot >= 0 && curSlot >= 0)
      inv.swapHotbar(emptySlot, curSlot);
  }
}
