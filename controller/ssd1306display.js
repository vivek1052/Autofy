const i2c = require('i2c-bus');
const oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const i2cBus = i2c.openSync(1);
const opts = {
    width: 128,
    height: 32,
    address: 0x3C
  };

const oled = new oled(i2cBus,opts);
oled.setCursor(0, 25);
oled.writeString(font, 1, 'Cats and dogs are really cool animals, you know.', 1, true);

