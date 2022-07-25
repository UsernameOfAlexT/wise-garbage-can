const Canvas = require('@napi-rs/canvas');
const { pickRandomly: randomly, randomInt } = require('../../utils.js');
const { dada } = require('../../datalists/movietimephrase.json');
const { readFile } = require('fs/promises');
const { readdirSync } = require('fs');
const CANVAS_DIM = { w: 800, h: 600 };

async function drawBg(canvas, context) {
  const getDirImages = (path) => readdirSync(path).filter(file => file.endsWith('.png')).map(file => `${path}/${file}`);
  const DADA_BGS = getDirImages('./img');
  const file = await readFile(randomly(DADA_BGS)); // TODO fails well?
  const background = new Canvas.Image();
  background.src = file;
  const { width, height } = canvas;
  context.drawImage(background, 0, 0, width, height);
  const AUX_BGS = getDirImages('./img/mvtaux');
  const MAX_AUX = 3;
  for (let i = 0; i <= randomInt(MAX_AUX + 1, 1); i++) {
    await drawBgExtras({ toDraw: randomly(AUX_BGS), width, height }, context, background); // TODO consider caching used images
  }
}

async function drawBgExtras({toDraw, width, height}, context, background) {
  const secondaryImg = await readFile(toDraw);
  background.src = secondaryImg;
  const MAX_SECONDARY = 5;
  const MAX_IMG_SCALE = 1.5;
  const MIN_IMG_SCALE = 0.1;
  const IMG_ADJUST = 100; // TODO based on chosen image
  for (let i = 0; i <= randomInt(MAX_SECONDARY + 1, 1); i++) { // + 1 as randomInt does not include max
    context.save();
    context.translate(randomInt(width) - IMG_ADJUST, randomInt(height) - IMG_ADJUST);
    context.rotate(boundRandom(Math.PI * 2));
    context.drawImage(
      background,
      0,
      0,
      width * boundRandom(MAX_IMG_SCALE, MIN_IMG_SCALE),
      height * boundRandom(MAX_IMG_SCALE, MIN_IMG_SCALE)
    );
    context.restore();
  }
}

function drawTextOverlay({width, height}, context) {
  const { opening, body, closing } = dada;
  const TEXT_WIDTH_FACTOR = 0.2;
  const H_RANGE_FACTORS = {
    opening: { min: 0.2, max: 0.4 },
    body: { min: 0.5, max: 0.6 },
    closing: { min: 0.7, max: 0.9 }
  }
  const textToFill = {
    [randomly(opening)]: {
      wfactor: boundRandom(TEXT_WIDTH_FACTOR),
      hfactor: boundRandom(H_RANGE_FACTORS.opening.max, H_RANGE_FACTORS.opening.min)
    },
    [randomly(body)]: {
      wfactor: boundRandom(TEXT_WIDTH_FACTOR),
      hfactor: boundRandom(H_RANGE_FACTORS.body.max, H_RANGE_FACTORS.body.min)
    },
    [randomly(closing)]: {
      wfactor: boundRandom(TEXT_WIDTH_FACTOR),
      hfactor: boundRandom(H_RANGE_FACTORS.closing.max, H_RANGE_FACTORS.closing.min)
    }
  }
  // making sure text fits
  const TEXT_PADDING_FACTOR = 0.1;
  const TEXT_STYLES = [
    '#0000FF', // blue
    '#FF002E', // red
    '#000000', // black
    '#FFFFFF', // white
    '#10C613', // green
  ];
  for ([title, dims] of Object.entries(textToFill)) {
    let fontSize = 70;
    const textWidthTarget = width * (1 - dims.wfactor - TEXT_PADDING_FACTOR);
    do {
      context.font = `${fontSize -= 6}px sans-serif`; // TODO works on heroku?
    } while (context.measureText(title).width > textWidthTarget && fontSize > 10)
    context.fillStyle = randomly(TEXT_STYLES);
    context.fillText(title, width * dims.wfactor, height * dims.hfactor);
  }
}

// TODO extract to utils? is it a common case?
const boundRandom = (max, min = 0) => {
  return Math.random() * (max - min) + min;
}

exports.generateImage = async () => {
  const canvas = Canvas.createCanvas(CANVAS_DIM.w, CANVAS_DIM.h); // TODO accepts obj?
  const context = canvas.getContext('2d');
  await drawBg(canvas, context);
  drawTextOverlay(canvas, context);
  return canvas;
}