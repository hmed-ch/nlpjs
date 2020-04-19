const { NlpManager,XDoc,XTableUtils } = require('node-nlp');
const lang = 'fr';
var url = require('url');
var manager = new NlpManager({ languages: [lang],keepStopWords: true });
var iconv = require('iconv-lite');
manager.save('initialmodal.nlp');
//const xdoc     = new XDoc()

const XLSX = require('xlsx');

makeintent=function (id) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text+id;
}

getRect=function (sheet) {
    const keys = Object.keys(sheet);
    let minRow;
    let maxRow;
    let minColumn;
    let maxColumn;
    for (let i = 0, l = keys.length; i < l; i += 1) {
      const key = keys[i];
      if (key[0] !== '!') {
        const coord = XTableUtils.excel2coord(key);
        
        if (minColumn === undefined || minColumn > coord.column) {
          minColumn = coord.column;
        }
        if (maxColumn === undefined || maxColumn < coord.column) {
          maxColumn = coord.column;
        }
        if (minRow === undefined || minRow > coord.row) {
          minRow = coord.row;
        }
        if (maxRow === undefined || maxRow < coord.row) {
          maxRow = coord.row;
        }
      }
    }
    return {
      top: minRow,
      bottom: maxRow,
      left: minColumn,
      right: maxColumn,
    };
  }
exports.train = async function(req, res) {
    manager = new NlpManager({ languages: [lang],keepStopWords: true });
    


    
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    const wb = XLSX.readFile(query.path,{encoding: 'binary'});
    
    for (let i = 0, l = wb.SheetNames.length; i < l; i += 1) {
      const sheet=wb.Sheets[wb.SheetNames[i]];
      const rect = getRect(sheet);
      const keyquestion='';
      const keyresponse='';
      const keyintent='';
      
      for (let j = 2, h = rect.bottom; j < h+2; j += 1) {
        if (sheet['A'+j] && sheet['C'+j] && sheet['B'+j]){
          
      	manager.addDocument(lang,iconv.decode(sheet['A'+j]['v'], 'utf-8') , iconv.decode(sheet['C'+j]['v'] , 'utf-8'));
        manager.addAnswer(lang, iconv.decode(sheet['C'+j]['v'],  'utf-8'), iconv.decode(sheet['B'+j]['v'], 'utf-8'));}
      
    }
}


  
	

	
	  await manager.train();
    manager.save();
    res.json({ message: 'Train successfully' })

};


 exports.response = async function(req, res) {
	const response = await manager.process(lang, req.body['message']);
    res.json(response)
  };
