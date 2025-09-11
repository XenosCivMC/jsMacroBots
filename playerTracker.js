
const SERVICE_NAME = event.serviceName;

function getPlayerData(playerName) {

  const response = Request.get(`https://civapi.drekamor.dev/mc-sessions/all?mcName=${playerName}&mcServer=civmc`);
  const playerData = JSON.parse(response.text());

  const firstJoined = new Date(playerData.loginTimestamps[0]);
  const daysSinceJoined = Math.floor((new Date() - firstJoined) / 1000 / 60 / 60 / 24);
  return {
    firstJoined,
    daysSinceJoined
  };
}

function playerTracker(event) {
  if(!event.entity.getPlayerName) return;

  const playerName = event.entity.getPlayerName();
  if (playerName) {
    const playerData = getPlayerData(playerName);
    Chat.log(`Player tracked!: ${playerName} (joined ${playerData.firstJoined.toLocaleDateString()} - ${playerData.daysSinceJoined} days ago)`);
  }

}

Chat.log(`STARTING ${SERVICE_NAME}`);
const listener = JsMacros.on('EntityLoad', JavaWrapper.methodToJava(playerTracker));

event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
  JsMacros.off(listener);
  Chat.log(`${SERVICE_NAME} STOPPED.`);
});
