const divEscapedContentElement = (message) => {
  const dom = document.createElement('div');
  dom.innerText = message;
  return dom;
};

const divSystemContentElement = (message) => {
  const dom = document.createElement('div');
  const domMessage = document.createElement('li');
  domMessage.innerText = message;
  dom.appendChild(domMessage);
  return dom;
};
