const axios = require('axios');
const path = require('path');
const fs = require('fs');


const HOTS = "http://keim-demosrv/rest-ws/service";
let idObj = "";
const userKeim = "root";
const passKeim = "optimal";
const getSearch = "result/query?type=";
const getDmsId = "dms";
const ParamsChildren = "children?type=sysfolder&childType=sysobject&offset=0&limit=-1&datameta=false&complete=false";
const fileNameContracts = path.join(__dirname, "data", "Contracts.json");
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
  SaveData(data,fileNameContracts);
  console.log("Contracts saved", dataObj);
}


async function getContractsChilds() {  
  const contracts = require(fileNameContracts);
    
  for (const contract of contracts) {
    let uri =`${HOTS}/dms/${contract.id}/${ParamsChildren}`;

    let children = await  DmsGet(uri)
    const filePath = 'data/childs/'+contract.id + '.json';
    if (children.length > 0){
      SaveData(children,filePath );
    } 
  
    
  }
 /*  
 const promises = [];
 // promises.push(children); 
 try {
    const responses = await Promise.all(promises);
    const dataChilds =  responses.map((response) => response);
    console.log("dataChilds", dataChilds);
   
  } catch (error) {
    console.error("Error during API requests:", error);
  } 
  */
}
getContractsChilds();
//GetContractFolders(); 