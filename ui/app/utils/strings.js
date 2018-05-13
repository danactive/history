function capitalize(words) {
  return words.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

export {
  capitalize,
};
