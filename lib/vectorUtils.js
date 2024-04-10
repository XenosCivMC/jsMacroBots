
/**
  * Calculates the distance between 2 positions.
  * Only works in xz direction!
  */
function getDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.z - pos1.z) ** 2);
}

/**
  * Centers the given position to the middle of the block.
  * Only works in xz direction!
  */
function getCenterPosition(position) {
  var newPos = {
    x: Math.floor(position.x) + 0.5,
    y: position.y,
    z: Math.floor(position.z) + 0.5
  };

  return newPos;
}

function directionToString(primaryDir, secondaryDir) {
  var result = -1;
  if (primaryDir.z < 0) result = "North";
  if (primaryDir.z > 0) result = "South";
  if (primaryDir.x < 0) result = "West";
  if (primaryDir.x > 0) result = "East";

  if (secondaryDir.z < 0) result += "-North";
  if (secondaryDir.z > 0) result += "-South";
  if (secondaryDir.x < 0) result += "-West";
  if (secondaryDir.x > 0) result += "-East";
  return result;
}

function getPlayerDirection() {
  const player = Player.getPlayer();
  const yaw = player.getYaw();

  if (yaw > -180 && yaw < -135)
    return { primaryDir: { x: 0, z: -1 }, secondaryDir: { x: 1, z: 0 } };
  if (yaw > -135 && yaw < -90)
    return { primaryDir: { x: 1, z: 0 }, secondaryDir: { x: 0, z: -1 } };
  if (yaw > -90 && yaw < -45)
    return { primaryDir: { x: 1, z: 0 }, secondaryDir: { x: 0, z: 1 } };
  if (yaw > -45 && yaw < 0)
    return { primaryDir: { x: 0, z: 1 }, secondaryDir: { x: 1, z: 0 } };
  if (yaw > 0 && yaw < 45)
    return { primaryDir: { x: 0, z: 1 }, secondaryDir: { x: -1, z: 0 } };
  if (yaw > 45 && yaw < 90)
    return { primaryDir: { x: -1, z: 0 }, secondaryDir: { x: 0, z: 1 } };
  if (yaw > 90 && yaw < 135)
    return { primaryDir: { x: -1, z: 0 }, secondaryDir: { x: 0, z: -1 } };
  if (yaw > 135 && yaw < 180)
    return { primaryDir: { x: 0, z: -1 }, secondaryDir: { x: -1, z: 0 } };
}

module.exports = {
  getDistance,
  getCenterPosition,
  directionToString,
  getPlayerDirection
}
