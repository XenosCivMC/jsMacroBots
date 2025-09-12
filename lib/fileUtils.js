function loadObjectFromFile(filename, defaultValue) {
  if (!FS.isFile(filename)) return defaultValue ? defaultValue : null;
  const file = FS.open(filename);
  const data = file.read();
  return JSON.parse(data);
}

function saveObjectToFile(object, filename) {
  const jsonData = JSON.stringify(object, null, 2);
  const file = FS.open(filename);
  file.write(jsonData);
}

module.exports = {
  loadObjectFromFile,
  saveObjectToFile
};
