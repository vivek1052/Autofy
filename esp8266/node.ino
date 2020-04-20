#include <NetworkInfo.h>
#include <TransmissionResult.h>
#include <TypeConversionFunctions.h>

#include <ArduinoJson.h>
#include <ESPAsyncUDP.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>

#define TCP_PORT 5555

#define NO_COMMAND 99
#define NODE_STATUS_REQ 0
#define NODE_STATUS_RES 1

AsyncUDP udp;

const char* ssid = "Moto G Play 7720";
const char* password = "qwertyuiop";
const char* requestingIPGuid = "5ef0b3f6-56a5-4437-bc4b-99a23b6e4159";
const char* nodeName = "Master Bedroom";

IPAddress serverIP;
AsyncClient* serverCon;

static void handleServerConData(void* arg, AsyncClient* serverCon, void *data, size_t len) {
  Serial.printf("\n Data received from %s \n", serverCon->remoteIP().toString().c_str());
  Serial.write((uint8_t*)data,len);
  String sCommand = String((const char*)data).substring(0,len);
  const int capacity = JSON_OBJECT_SIZE(2);
  StaticJsonDocument<capacity> command;
  DeserializationError err = deserializeJson(command, sCommand);
  if (err) {
    Serial.print(F("deserializeJson() failed with code "));
    Serial.println(err.c_str());
  }

  int cmd = command["cmd"] | NO_COMMAND ;
  switch(cmd){
    case NODE_STATUS_REQ:{
      const int capacity = JSON_OBJECT_SIZE(20); 
      StaticJsonDocument<capacity> appliances;
      appliances["cmd"] = NODE_STATUS_RES;
      JsonObject res = appliances.createNestedObject("response");
      res["mac"] = WiFi.macAddress();
      res["devices"][0]["i2cAddress"] = "0X20";
      res["devices"][0]["state"] = true;
      res["devices"][0]["pwm"] = 40;
      res["devices"][1]["i2cAddress"]="0X30";
      res["devices"][1]["state"] = false;
      res["devices"][1]["pwm"] = 0;
      if (serverCon->canSend()) {
         String out;
         serializeJson(appliances,out);
         Serial.println("\n\n Response Generated");
         Serial.print(out);
         Serial.println("\n");
         serverCon->add(out.c_str(), strlen(out.c_str()));
         serverCon->send();
      } 
      break;
    }
    case 98:{
      ESP.reset();
      break;
    }
             
   }
}

void onServerConConnect(void* arg, AsyncClient* serverCon) {
  Serial.printf("\n Server has been connected to %s on port %d \n", serverCon->remoteIP().toString().c_str(), TCP_PORT);
}

void handleServerConDisconnect(void* arg, AsyncClient* serverCon) {
  Serial.printf("\n Server has been disconnected. Trying to reconnect \n");
}

void setup() {
  Serial.begin(115200);
  delay(10);
  
  Serial.println("\n Configuring node \n");
  
  //Wifi configuration
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.printf("\n Connecting to network %s \n", ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
   }
  
  Serial.printf("\n Connected\n");

  // Print the IP address ---------------------------------------------------
  Serial.printf("\n Station IP: %s \n", WiFi.localIP().toString().c_str());
  Serial.printf("\n Gateway IP: %s \n", WiFi.gatewayIP().toString().c_str());

  //Establish TCP connection with Parent node
  serverCon = new AsyncClient;
  serverCon->onData(&handleServerConData, NULL);
  serverCon->onConnect(&onServerConConnect, NULL);
  serverCon->onDisconnect(&handleServerConDisconnect, NULL);
  
  //Get parent Ip from which connection has to be made as a client
  //Message is broadcast on the local network and the parent node replies on it.
  udp.onPacket([](AsyncUDPPacket packet) {
    serverIP = packet.remoteIP();
    serverCon->connect(serverIP, TCP_PORT);
    Serial.printf("\n Establishing connection with %s:%d \n", serverIP.toString().c_str(),TCP_PORT);
  });
  udp.listen(TCP_PORT);
  Serial.printf("\n UDP server listening on %d \n", TCP_PORT);
  Serial.println(" Broadcasting message on local network for any server");
}

void loop() {
  if(WiFi.status() != WL_CONNECTED){
    Serial.printf(" \n Wifi Disconnected. Trying to connect with %s \n", ssid);
    serverCon->close(true);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
   }
   Serial.printf("\n Connection Re-established. Trying to establish connection with server \n");
  }
  if(serverCon->disconnected()){
    udp.broadcastTo(requestingIPGuid,TCP_PORT);
    Serial.printf(".");
    delay(1000);
  }
}
