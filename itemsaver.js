
var threshold = 10;

const { selectItem } = require('./lib/inventoryUtils.js');

var item = event.item;

// I dont care about armor
if (!item.isWearable() == true) {
  var curDamage = item.getMaxDamage() - event.damage;

  if (curDamage <= threshold) {
    Chat.log("Item saved!");
    selectItem(item.getItemID(), true, threshold);
  }
}
