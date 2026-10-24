const fs = require("fs");

const deleteAllFiles = (files) => {
  if (!files || files.length === 0) {
    return;
  }

  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

module.exports = deleteAllFiles;