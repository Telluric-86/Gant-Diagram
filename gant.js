;'use strict';

const Gant = function () {
  let diagramData = null,
      dateArray = null,
      self = this;
      
  Gant.prototype.loadJSON = function () {
    let loadPromise = new Promise( (resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', 'data.json', true);
      xhr.onload = function () {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch (err) {
          reject(err);
        }
        resolve(data);
      };
      xhr.onerror = function () {
        reject(new Error('Нет данных'));
      };    
      xhr.send();   
    });
    
    loadPromise.then(
      (data) => {
        diagramData = data.items;
        dateArray = data.scale;
        self.buildDiagram();
      },
      (err) => {
        alert(err);
      }
    );
  };
  
  this.buildDiagram = function () {
    if ((diagramData === null) || (dateArray === null)) {
      self.loadJSON();
      return;
    };
    
    let output = document.getElementById('output');    
    if (output.children.length !== 0){
      output.children[0].delete();
    };
    let table = output
      .appendChild(document.createElement('table'))
      .appendChild(document.createElement('tbody'));
      
    diagramData.forEach( (itemDiagram) => {
      output = table.appendChild(document.createElement('tr'));
      output.appendChild(document.createElement('td')).textContent = itemDiagram['title'];
      
      let start = dateArray.indexOf(itemDiagram['start']),
          end = dateArray.indexOf(itemDiagram['end']);
      
      for ( let i = 1; i < dateArray.length; i += 1 ){
        if ((i > start) && (i <= end)){
          output.appendChild(document.createElement('td')).style.backgroundColor = itemDiagram['color'];
        } else {
          output.appendChild(document.createElement('td'));
        };
      };
    });
    
    output = table.appendChild(document.createElement('tr'));
    dateArray.forEach( (itemDate) => {
      output.appendChild(document.createElement('td')).textContent = itemDate;
    });
    
  };
};

document.body.addEventListener(onload, (new Gant()).buildDiagram());
