;'use strict';

const Gant = function (JSONFile) {
  if ( !(this instanceof Gant) ){
    return new Gant(JSONFile);
  };
  
  this.buildDiagram(JSONFile);
};

Gant.prototype.loadJSON = function (JSONFile) {
  return new Promise( (resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', JSONFile, true);
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
};
  
Gant.prototype.buildDiagram = function (JSONFile) {
  let loadPromise = this.loadJSON(JSONFile);
  loadPromise.then(
    (data) => {
      let diagramData = data.items,
          dateArray = data.scale;
      
      let tempNode = document.getElementById('output'),
          output = null;
      if (tempNode.children.length !== 0){
        tempNode.children[0].delete();
      };

      let timeScale = {},
          timeArray = [];
      dateArray.forEach( (item) => {
        let date = item.split('.');
        timeArray.push(new Date(date[2], date[1], date[0]).getTime());
      });
      diagramData.forEach( (item) => {
        let date = item['start'].split('.');
        timeArray.push(new Date(date[2], date[1], date[0]).getTime());
        date = item['end'].split('.');
        timeArray.push(new Date(date[2], date[1], date[0]).getTime());
      });
      
      timeScale.start = Math.min(...timeArray);
      timeScale.end = Math.max(...timeArray);
      timeScale.msInDay = 86400000;
      timeScale.mainInterval = Math.ceil((timeScale.end - timeScale.start) / timeScale.msInDay);
      timeScale.scale = 100 / timeScale.mainInterval;
      timeScale.interval = function (time1, time2){
        return Math.round( Math.abs(time1 - time2) / timeScale.msInDay);
      };
      
      let mainDiv = document.createElement('div');
      mainDiv.setAttribute('class', 'diagram-frame');
      
      output = mainDiv.appendChild(document.createElement('div'));
      output.setAttribute('class', 'tasks');
      diagramData.forEach( (item) => {
        let outputLocal = output.appendChild(document.createElement('div'));
        outputLocal.setAttribute('class', 'task-type');
        outputLocal = outputLocal.appendChild(document.createElement('span'));
        outputLocal.textContent = item['title'];        
      });
      
      output = mainDiv.appendChild(document.createElement('div'));
      output.setAttribute('class', 'diagram');
      diagramData.forEach( (item) => {
        let date,
            time1, time2,
            interval;
        output = output.appendChild(document.createElement('div'));
        output.setAttribute('class', 'row');
        
        date = item['start'].split('.');
        time1 = new Date(date[2], date[1], date[0]).getTime();
        interval = timeScale.interval(time1, timeScale.start);
        if ( interval !== 0 ){
          let outputLocal = output.appendChild(document.createElement('div'));
          let width = interval * timeScale.scale;
          outputLocal.style.cssText = `width:${width}%;height:inherit;float:left;`;
        };
        
        date = item['end'].split('.');
        time2 = new Date(date[2], date[1], date[0]).getTime();
        interval = timeScale.interval(time2, time1);
        if ( interval !== 0 ){
          let outputLocal = output.appendChild(document.createElement('div'));
          let width = interval * timeScale.scale;
          outputLocal.style.cssText = `width:${width}%;background-color:${item['color']};height:inherit;float:left;`;
        };
        
        output = output.parentNode;
      });

      output = output.appendChild(document.createElement('div'));
      output.setAttribute('class', 'row');
      for (let i = 0; i < dateArray.length; i += 1) {
        let date,
            time1, time2,
            interval;
    
        if ( i === 0 ){
          date = dateArray[i].split('.');
          time1 = timeScale.start;
          time2 = new Date(date[2], date[1], date[0]).getTime();
          interval = timeScale.interval(time2, time1);
          if ( interval === 0 ) {
            continue          
          } else {
            let width = interval * timeScale.scale;
            let outputLocal = output.appendChild(document.createElement('div'));
            outputLocal.style.cssText = `width:${width}%;height:inherit;float:left;`;
            continue;
          };
        };
        
        date = dateArray[i-1].split('.');
        time1 = new Date(date[2], date[1], date[0]).getTime();
        date = dateArray[i].split('.');
        time2 = new Date(date[2], date[1], date[0]).getTime();
        interval = timeScale.interval(time2, time1);
        
        let width = interval * timeScale.scale;
        let outputLocal = output.appendChild(document.createElement('div'));
        outputLocal.style.cssText = `width:${width}%;height:inherit;float:left;`;
        if (i === 1){
          outputLocal = outputLocal.appendChild(document.createElement('span'));
          outputLocal.setAttribute('class', 'date-left');
          outputLocal.textContent = dateArray[i-1];
          outputLocal = outputLocal.parentNode;
        };
        outputLocal = outputLocal.appendChild(document.createElement('span'));
        outputLocal.setAttribute('class', 'date-right');
        outputLocal.textContent = dateArray[i];        
      };
      
      tempNode.appendChild(mainDiv);
//    
// == Old code ==
//      
//      let table = document
//        .createElement('table')
//        .appendChild(document.createElement('tbody'));
//
//      diagramData.forEach((itemDiagram) => {
//        output = table.appendChild(document.createElement('tr'));
//        output.appendChild(document.createElement('td')).textContent = itemDiagram['title'];
//
//        let start = dateArray.indexOf(itemDiagram['start']),
//            end = dateArray.indexOf(itemDiagram['end']);
//
//        for ( let i = 1; i < dateArray.length; i += 1 ){
//          if ((i > start) && (i <= end)){
//            output.appendChild(document.createElement('td')).style.backgroundColor = itemDiagram['color'];
//          } else {
//            output.appendChild(document.createElement('td'));
//          };
//        };
//      });
//      output = table.appendChild(document.createElement('tr'));
//      dateArray.forEach((itemDate) => {
//        output.appendChild(document.createElement('td')).textContent = itemDate;
//      });
//      tempNode.appendChild(table.parentNode);
    },
    
    (err) => {
      alert(err);
    }
  );
    
  

};

window.addEventListener('DOMContentLoaded', () => Gant('data.json') );
