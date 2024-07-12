const axios = require('axios');
const path = require('path');
const fs = require('fs');


const HOTS = "./rest-ws/service";
let idObj = "";
const userKeim = "root";
const passKeim = "";
const getSearch = "result/query?type=";
const getDmsId = "dms";
const ParamsChildren = "children?type=sysfolder&childType=sysobject&offset=0&limit=-1&datameta=false&complete=false";
const fileNameContracts = path.join(__dirname, "data", "ContractsTest.json");
const fileNameContractsDocs = path.join(__dirname, "data", "searchcontract-1.json");
const contracts = {
  "contract1": "abscontractfolder",
  "contract2": "abscontractdoc",
  "contract3": "absringi"
};
const dataObj = {};
async function DmsGet(urlidPrams) {
  try {
    const authHeader = "Basic " + Buffer.from(userKeim + ":" + passKeim).toString("base64");
    const response = await axios.get(urlidPrams, {
      headers: {
        Authorization: authHeader
      }
    });
    const data = response.data;
   // console.log("Dati ottenuti dalla chiamata API:", data);
    return data;
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
  }
}

async function DmsUpdate(id, dataObj) {
  try {
    const authHeader = "Basic " + Buffer.from(userKeim + ":" + passKeim).toString("base64");
    const response = await axios.put(`${HOTS}/dms/${id}`, dataObj, {
      headers: {
        Authorization: authHeader
      },
    });
    const data = response.status;
    console.log("response API:", data);
    return data;
  } catch (error) {
    console.error("Errore durante l'aggiornamento:", error);
  }
}

async function SaveData(dataObj, filePath) {
  try {
    
    await fs.writeFileSync(filePath, JSON.stringify(dataObj, null, 2));
    console.log("Dati salvati con successo",'-->',filePath);
  } catch (error) {
    console.error("Errore durante il salvataggio dei dati", error);
  }
}
// save contracfolders in  data directory
async function GetContractFolders() {
  const data = await DmsGet(`${HOTS}/${getSearch}${contracts.contract1}`);
 // console.log("data:  ", data);
  SaveData(data,fileNameContracts);
  console.log("Contracts saved", dataObj);
}


async function getContractsChilds() {  
  const contracts = require(fileNameContracts);
  let counter = 0;
  let param='p';
  for (const contract of contracts) {
    counter++;
  if (counter >= 900) {param=counter;}
    let uri =`${HOTS}/dms/${contract.id}/${ParamsChildren}?${param}`;
    console.log("get counter: ", counter,'-->',uri);
    let children = await  DmsGet(uri)
    const filePath = 'data/childs/'+contract.id + '.json';
  try {
  if (children.length > 0) {
    SaveData(children, filePath);
  }
} catch (error) {
  console.error("Errore durante l'ottenimento dei dati dei figli:", error);
}
    
  }
}

const contractsFolder = require(fileNameContracts);
async function readContracts() {  
 
  let counter = 0;
    for (const contract of contractsFolder) {
    counter++;
  let data =contract.data;
  try {
  if (data) {
    updateChildsContracts(contract.id,data)
   // console.log(counter,"data update CONTRATO FOLDER ", contract.id,'-->',data,'--',fileNameContracts);
  }
} catch (error) {
  console.error("Errore durante l'ottenimento dei dati dei figli:", error);
}
    
  }
}  


async function updateChildsContracts(id, dataContract) {
  const filePath = path.join(__dirname, 'data/childs/'+id+'.json');
  console.log("filePath :", filePath);
let checkChild = checkFileExists(filePath);
console.log("checkChild: ---->",checkChild);
  if (checkChild) {
    
  const childs = require(filePath);
    for (const child of childs) {
      if (dataContract) {
       let children = await DmsUpdate(child.id, dataContract);
      console.log("data update child: ---->",children);
      }
    }
  } else {
    console.log("file not found",filePath);
    writeErrorLog("file not found: "+filePath)
  }
}

function checkFileExists(filePath) {
  // const filePath = `${folderPath}/${fileName}`;
   try {
     fs.accessSync(filePath, fs.constants.F_OK);
     return true;
   } catch (error) {
     return false;
   }
 }

function writeErrorLog(errorMessage) {
  const logFilePath =(__dirname+'/log/error.log') ;
  const logMessage = `[${new Date().toISOString()}] ${errorMessage}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Errore durante la scrittura nel file di log:', err);
    } else {
      console.log('Messaggio di errore scritto nel file di log con successo.');
    }
  });
}

async function readContractsDocs() {  
  const contractsDocs = require(fileNameContractsDocs);
// console.log('prova--->',contractsDocs);
  let counter = 0;
  let counterOK = 0;
  let counterKo = 0;
    for (const docs of contractsDocs) {
    counter++;
  let data =docs.data;
  try {
  if (data.notificationperiod) {
   // updateChildsContracts(contract.id,data)
   // console.log(counter,"data check notificationperiod -true->",docs.id,"-->", data.notificationperiod,'<--');
   counterOK++
  }else{
    console.log(counter,"data check notificationperiod -false->",docs.id,"-->", data.notificationperiod,'<--');
    
    counterKo++;
  }
} catch (error) {
  console.error("Errore durante l'ottenimento dei dati dei figli:", error);
}
    
  }
  console.log("totale docs: "+counter, " totale ok: "+counterOK," totale KO: "+counterKo);
}  

/*  
readContracts();
getContractsChilds(); 
GetContractFolders(); 
readContractsDocs();
*/
readContractsDocs();