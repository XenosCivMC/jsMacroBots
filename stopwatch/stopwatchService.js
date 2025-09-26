class Stopwatch {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.isRunning = false;
  }

  start() {
    this.startTime = Time.time();
    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.endTime = Time.time();
    this.isRunning = false;
  }

  getElapsedTime() {
    if (this.isRunning) {
      return (Date.now() - this.startTime);
    }
    return (this.endTime - this.startTime);
  }

  reset() {
    this.startTime = null;
    this.endTime = null;
    this.isRunning = false;
  }
}

function testStopwatch(event) {
  if (event.key == "key.keyboard.g" && event.action == 1) {
    Chat.log(event.action);

    if (!stopwatch.isRunning) {
      stopwatch.start();
    }
    else {
      stopwatch.stop();
      Chat.log(stopwatch.getElapsedTime());
    }
  }
}

function interactEntity(event) {
  // check if user is really in a minecart
  // TODO: check event for minecart
  if (Player.getPlayer().getVehicle() == null) {

    isInCart = false;
    return;
  } else {

    isInCart = true;
    tickListener = JsMacros.on('Tick', JavaWrapper.methodToJava(function() {
      const currentPosition = Player.player.getPos();

      // player is moving...
      if (currentPosition.x != lastPosition.x ||
        currentPosition.y != lastPosition.y ||
        currentPosition.z != lastPosition.z
      ) {
        if (!stopwatch.isRunning) {
          stopwatch.start();
        }
      }
      // player is not moving...
      else {
        if (stopwatch.isRunning) {
          stopwatch.stop();
        }
      }


      Chat.log(stopwatch.getElapsedTime());
    }));
  }
}

const SERVICE_NAME = event.serviceName;
const stopwatch = new Stopwatch();

const keyListener = JsMacros.on('Key', JavaWrapper.methodToJava(testStopwatch));
const entityInteractListener = JsMacros.on('InteractEntity', JavaWrapper.methodToJava(interactEntity));
let tickListener;

let isInCart = false;
let lastPosition;

Chat.log(`STARTING ${SERVICE_NAME}`);
event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
  JsMacros.off(keyListener);
  JsMacros.off(entityInteractListener);
  if (tickListener)
    JsMacros.off(tickListener);
  Chat.log(`${SERVICE_NAME} STOPPED.`);
});
