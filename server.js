const eureka = require("eo-discovery");
const express = require("express");
const stompit = require("stompit");
const request = require("request-json");

const app = express();
let dmsHost;

const listener = app.listen(3000, () => {
  const startup = async () => {
    const discovery = await eureka.init({
      name: "stateservice",
      express: app,
      port: listener.address().port
    });
    dmsHost = discovery.getAppUrl("DMS");
    console.log("Service manager node address : " + dmsHost);
    app.get("/list", (req, res) => {
      res.send({
        config: {
          allelementsselectable: false,
          valueField: "listvalue",
          subEntriesField: "subentries"
        },
        entries: [
          {
            listvalue: "Germany",
            subentries: [
              {
                listvalue: "Berlin"
              },
              {
                listvalue: "Bavaria"
              }
            ]
          },
          {
            listvalue: "USA",
            subentries: [
              {
                listvalue: "California"
              },
              {
                listvalue: "Texas"
              }
            ]
          }
        ]
      });
    });
    const connectOptions = {
      host: "localhost",
      port: 61777,
      connectHeaders: {
        host: "/",
        "heart-beat": "5000,5000"
      }
    };

    client = stompit.connect(connectOptions);

    client.on("error", error => {
      console.log('Messaging client error : ', error);
      reconnect();
    });

    const subscribeHeaders = {
      destination: "/topic/indexDataChanged",
      ack: "client-individual"
    };
    client.subscribe(subscribeHeaders, (error, message) => {
      if (error) {
        console.log("subscribe error " + error.message);
        return;
      }
      message.readString("utf-8", (error, body) => {
        if (error) {
          console.log("read message error " + error.message);
          return;
        }
        const msgData = JSON.parse(body);
        console.log("received message: ", msgData.messages[0].itemid);
        client.ack(message);
        const httpclient = request.createClient(dmsHost + "/");
        const dmsReq = "/rest-ws/service/dms/" + msgData.messages[0].itemid;
        httpclient.get(dmsReq, (err, res, body) => {
          if (err) {
            console.log("Error while fetching data from DMS: ", err);
            return;
          }
          console.log("Data from DMS: ", body);
        });
      });
    });
  };
  startup();
});