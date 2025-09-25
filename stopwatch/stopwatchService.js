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



const SERVICE_NAME = event.serviceName;

const stopwatch = new Stopwatch();

function testStopwatch(event) {
  if (event.key == "key.keyboard.g" && event.action == 1) {
    Chat.log(event.action);

    if(!stopwatch.isRunning) {
      stopwatch.start();
    }
    else {
      stopwatch.stop();
      Chat.log(stopwatch.getElapsedTime());
    }
  }
}

Chat.log(`STARTING ${SERVICE_NAME}`);
const listener = JsMacros.on('Key', JavaWrapper.methodToJava(testStopwatch));

event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
  JsMacros.off(listener);
  Chat.log(`${SERVICE_NAME} STOPPED.`);
});
