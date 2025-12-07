import ConnectedState from "@/components/bluetooth/ConnectedState";
import DisconnectedState from "@/components/bluetooth/DisconnectedState";
import { PeripheralServices } from "@/types/bluetooth";
import { handleAndroidPermissions } from "@/utils/permission";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, Alert, Linking } from "react-native";
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";
import * as Speech from 'expo-speech';


declare module "react-native-ble-manager" {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const SECONDS_TO_SCAN_FOR = 5;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const DEVICE_SERVICE_UUID = "FFE0";
const TRANSFER_CHARACTERISTIC_UUID = "FFE1";
const RECEIVE_CHARACTERISTIC_UUID = "FFE1";

// let serialReceived = "";
let serialTemp = "";
let alreadyCalibrated = false;

function fieldContainsBit(mask: bigint, bit: bigint): boolean{
  return (mask & bit) != 0n;
}
function matchLetterToField(mask: bigint){
  let letters = "";
  if(fieldContainsBit(mask, 1n << 0n)){
    letters += "A ";
  }
  if(fieldContainsBit(mask, 1n << 1n)){
    letters += "B ";
  }
  if(fieldContainsBit(mask, 1n << 2n)){
    letters += "C ";
  }
  if(fieldContainsBit(mask, 1n << 3n)){
    letters += "D ";
  }
  if(fieldContainsBit(mask, 1n << 4n)){
    letters += "E ";
  }
  if(fieldContainsBit(mask, 1n << 5n)){
    letters += "F ";
  }
  if(fieldContainsBit(mask, 1n << 6n)){
    letters += "G ";
  }
  if(fieldContainsBit(mask, 1n << 7n)){
    letters += "H ";
  }
  if(fieldContainsBit(mask, 1n << 8n)){
    letters += "I ";
  }
  if(fieldContainsBit(mask, 1n << 9n)){
    letters += "J ";
  }
  if(fieldContainsBit(mask, 1n << 10n)){
    letters += "K ";
  }
  if(fieldContainsBit(mask, 1n << 11n)){
    letters += "L ";
  }
  if(fieldContainsBit(mask, 1n << 12n)){
    letters += "M ";
  }
  if(fieldContainsBit(mask, 1n << 13n)){
    letters += "N ";
  }
  if(fieldContainsBit(mask, 1n << 14n)){
    letters += "O ";
  }
  if(fieldContainsBit(mask, 1n << 15n)){
    letters += "P ";
  }
  if(fieldContainsBit(mask, 1n << 16n)){
    letters += "Q ";
  }
  if(fieldContainsBit(mask, 1n << 17n)){
    letters += "R ";
  }
  if(fieldContainsBit(mask, 1n << 18n)){
    letters += "S ";
  }
  if(fieldContainsBit(mask, 1n << 19n)){
    letters += "T ";
  }
  if(fieldContainsBit(mask, 1n << 20n)){
    letters += "U ";
  }
  if(fieldContainsBit(mask, 1n << 21n)){
    letters += "V ";
  }
  if(fieldContainsBit(mask, 1n << 22n)){
    letters += "W ";
  }
  if(fieldContainsBit(mask, 1n << 23n)){
    letters += "X ";
  }
  if(fieldContainsBit(mask, 1n << 24n)){
    letters += "Y ";
  }
  if(fieldContainsBit(mask, 1n << 25n)){
    letters += "Z ";
  }
  if(letters === ""){
    letters = "NONE"
  }
  return letters;
}

const BluetoothDemoScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral["id"], Peripheral>()
  );
  const [isConnected, setIsConnected] = useState(false);
  const [bleService, setBleService] = useState<PeripheralServices | undefined>(
    undefined
  );
  const [serialReceived, setSerialReceived] = useState<string>("");
  const [lettersReceived, setLettersReceived] = useState<string>("");

  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => console.debug("BleManager started."))
      .catch((error: any) =>
        console.error("BeManager could not be started.", error)
      );

    const listeners: any[] = [
      BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      BleManager.onStopScan(handleStopScan),
      BleManager.onConnectPeripheral(handleConnectPeripheral),
      BleManager.onDidUpdateValueForCharacteristic(
        handleUpdateValueForCharacteristic
      ),
      BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    handleAndroidPermissions();

    return () => {
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent
  ) => {
    console.debug(
      `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`
    );
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleConnectPeripheral = (event: any) => {
    console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
  };

  const handleUpdateValueForCharacteristic = async (
    data: BleManagerDidUpdateValueForCharacteristicEvent
  ) => {
    console.debug(
      `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}====='`
    );
    let str = new TextDecoder().decode(new Uint8Array(data.value));
    console.debug(str);
    serialTemp += str;
    if(serialTemp.indexOf("*****************************************") !== -1){
      setSerialReceived(serialTemp);
      serialTemp = "";
      // alreadyCalibrated = true;
    }
    let str2 = serialTemp.slice(serialTemp.indexOf("5:"), serialTemp.indexOf("//"));
    let another = str2.split("\n");
    // if(serialTemp.indexOf("Calibrating") != -1){
    //   alreadyCalibrated = false;
    // }iuh98lnpkhjkhkjhkjhkjhonopipoijopaiuhiuhiuhiuhiuhkjkjkjkjkjkkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkkkk
    //hkuhioyhlhkihlikhkihkhkjhkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkkjkjjhkuhuihiugiuiiuyiuyiuyiuyiutiuyiuyiuyyiuyyiu7ttu7ittiu7tkjugskjgkjhhkhjjugjugjjugjgykkkkkkuhiohkihlkhkhjkjhkjhkiyhhkjhgkyhhukjh,mhlklykjhkjhikhkugukgkiugkjugjkgjukjgkjgkjgkjghlhlihlhljkhlkhlkhlkhgjuygkkugjuggjujuggjhgjhgjhgjhgshjgsjhgjhgjhgjhgjhgjhgjhgjhgjiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhjjjjjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjnkjhkjhkjhkjhkjhkjhijopijpoijopijopijopijoijpoijjjjjjjjjjjjjjjjjjjjjjjjjjjj
    // if(alreadyCalibrated === false){
    //   setSerialReceived(serialTemp);
    // }
    // add 5 to make up for mask text
    let field = serialReceived.slice(serialReceived.indexOf("MASK:") + 5, serialReceived.indexOf("//"));
    // console.debug(serialReceived.slice(serialReceived.indexOf("MASK:"), serialReceived.indexOf("//")));
    // console.debug(field);
    // console.debug(serialReceived);
    console.debug(serialTemp);
    // console.debug("soueiyguhjrliwkuyeh")
    // console.debug(another);
    // console.debug(str);sasakjnkjnkjnkjnkjnnnkjhkhkjhkjhkjhkjhkjhkjhkjhkjhkjhkjhkjhkjhkjhkjfgggggsfddfgdfhgdgjfgjfgjfhgsdgsdghhgytgdffddtrtftgggtgtgfgfkjhkjhlkjhkjhkhjlkihhikhjujnkkjjhjhjhjhjhjhjhkjjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjugjhgjhgjhgjhgjygjhgjhghgjhgjhgjhgjhgjhgjhghjgjhgjhgjhg
    // console.debug(kkkkkkkkskkjkjhjhkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkffffdttftfdrggrdrdrgdfcdfdfdfggdfyfghfftghfygfjgfghghfghfgfggfhdddgfgrtuyffghgdrydrdfggdfrtyytrrtyhftyrtthrfghhgfghffhfdfdghfggfdssdfsdfkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkknhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhjkjhjkjkjkjkjkjjkkjjkkjkjukjkjkjkjkjjkjhjhjhjhjhjhjhjhjhkjujkukkjukjjkjjhjjjkjkjkkjkjkjkjkjkjkjkjkjukjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjjjkjkhguhhhkkkkkkkkkkkkkkkkkkkkhgyhhhjhjhjhikukghgliuyhvnmhbbv  soiuhkjubkugkuhgkiuhgkiuhgkjhbkjuhgkjugbjkjjkkjkjkjkjkjkjkjkmjmkjkjkjjhjhkhkjkjhmhkhkhkhkkjkjkjkjkjhjjjjjkhhjhhjjhjhjhjhjnmjhnjhjhjjhjhjhjkkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjk,mkjkjkjkjkjkjkjkjkjkjnmjjhkjkjkjkjkjkjkjkijkjjhjhjhjkjhjhhkjkjkjjhkjkjkjkjnmkjkkjkjkjjkjmnm,mmkjkjmjnmjnnmjhnmmjnjhkjjhkjhkjkjkjkjkljkjnkjhkjhkjhkjhkjhkjhkjhkjkjhkjhkjnkjkjkjkjkjkjnkjhnhkjhjhkjhkjkjkjkjkjkjnjkjhkjkjhnkjhkjnnkjkjhkjhjhjhbjhjiokjhkljkjkljkljkljkiljkiljkjhkjhkjnmkjkjhkjuhkjhkjhhkjkjkjhkjhkjhkjhkjhkljkjkjhhkjhkjhkjhkjhkjhkjhkjhkjhgkjhkjhkjhjnmbkjhkjhkljhkjhkjhkhjbmjbmbkjgkjuuhg                                       iohuliu`lh`ohjkluhklhkjhkljhihiuhkjuhjhhhpbhhggggghyhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhjjjjjjjjjhjjjjjjkjjjjjjjjjjjhjjjjjjjjjujbjkjkjkjkjkjkjkjkjkjkjkjkjkuhkhkhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhkuhuhiuhiuhiuhiuhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjoijoijoijoijjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjklkjllllllkkkkkkkkkaaaasaasassaassaliyygligiuhiuhiuhiouhiuhiuhiouhiuhiuhoiujoijjjjjjjjjjjsjjjjjjjjjjjjjjjjjjjjjjjjjjoijoijoijjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjoijjhiouhouhoiybiuobchjlk;ijhkgchtjymghuykjghghjukioiuouyjhgygui9o8iuygfjhghgjguiygjhhpoiugyuuiyygjhgfyuyuiyiouyguouiyhjgfyuyoiuyguoiygjhgjguituyouiyhjgjuiu98ouiyghfalReceived);
    if(field === "") return;
    let bitmask = BigInt(field);
    console.debug(bitmask);
    setLettersReceived(matchLetterToField(bitmask).trim());
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug("[handleStopScan] scan is stopped.");
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    console.debug("[handleDiscoverPeripheral] new BLE peripheral=", peripheral);
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
    }
    setPeripherals((map) => {
      return new Map(map.set(peripheral.id, peripheral));
    });
  };

  const connectPeripheral = async (
    peripheral: Omit<Peripheral, "advertising">
  ) => {
    try {
      if (peripheral) {
        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            p.connecting = true;
            return new Map(map.set(p.id, p));
          }
          return map;
        });

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);
        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            p.connecting = false;
            p.connected = true;
            return new Map(map.set(p.id, p));
          }
          return map;
        });

        // before retrieving services, it is often a good idea to let bonding & connection finish properly
        await sleep(900);
        /* Test read current RSSI value, retrieve services first */
        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        console.log(
          peripheralData.characteristics,
          "peripheralData.characteristics======="
        );
        if (peripheralData.characteristics) {
          const peripheralParameters = {
            peripheralId: peripheral.id,
            serviceId: DEVICE_SERVICE_UUID,
            transfer: TRANSFER_CHARACTERISTIC_UUID,
            receive: RECEIVE_CHARACTERISTIC_UUID,
          };
          setBleService(peripheralParameters);
          setIsConnected(true);
        }
        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            return new Map(map.set(p.id, p));
          }
          return map;
        });
        const rssi = await BleManager.readRSSI(peripheral.id);
        if (peripheralData.characteristics) {
          for (const characteristic of peripheralData.characteristics) {
            if (characteristic.descriptors) {
              for (const descriptor of characteristic.descriptors) {
                try {
                  let data = await BleManager.readDescriptor(
                    peripheral.id,
                    characteristic.service,
                    characteristic.characteristic,
                    descriptor.uuid
                  );
                  console.log(
                    `[readDescriptor] Descriptor ${data} for ${peripheral.id} `
                  );
                } catch (error) {
                  console.error(
                    `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor.value} for characteristic ${characteristic.characteristic}:`,
                    error
                  );
                }
              }
            }
          }
        }
        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            p.rssi = rssi;
            return new Map(map.set(p.id, p));
          }
          return map;
        });
      }
    } catch (error) {
      console.error(
        `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
        error
      );
    }
  };

  const disconnectPeripheral = async (peripheralId: string) => {
    try {
      await BleManager.disconnect(peripheralId);
      setBleService(undefined);
      setPeripherals(new Map());
      setIsConnected(false);
    } catch (error) {
      console.error(
        `[disconnectPeripheral][${peripheralId}] disconnectPeripheral error`,
        error
      );
    }
  };

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  const enableBluetooth = async () => {
    try {
      console.debug("[enableBluetooth]");
      await BleManager.enableBluetooth();
    } catch (error) {
      console.error("[enableBluetooth] thrown", error);
    }
  };

  const startScan = async () => {
    const state = await BleManager.checkState();

    console.log(state);

    if (state === "off") {
      if (Platform.OS == "ios") {
        Alert.alert(
          "Enable Bluetooth",
          "Please enable Bluetooth in Settings to continue.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openURL("App-Prefs:Bluetooth");
              },
            },
          ]
        );
      } else {
        enableBluetooth();
      }
    }
    if (!isScanning) {
      setPeripherals(new Map<Peripheral["id"], Peripheral>());
      try {
        console.debug("[startScan] starting scan...");
        setIsScanning(true);
        BleManager.scan({
          serviceUUIDs: SERVICE_UUIDS, seconds: SECONDS_TO_SCAN_FOR, allowDuplicates: ALLOW_DUPLICATES,
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        })
          .then(() => {
            console.debug("[startScan] scan promise returned successfully.");
          })
          .catch((err: any) => {
            console.error("[startScan] ble scan returned in error", err);
          });
      } catch (error) {
        console.error("[startScan] ble scan error thrown", error);
      }
    }
  };

  const write = async () => {
    const MTU = 255;
    if (bleService) {
      const data = Array.from(new TextEncoder().encode("Hello World"));
      await BleManager.write(
        bleService.peripheralId,
        bleService.serviceId,
        bleService.transfer,
        data,
        MTU
      );
    }
  };

  const read = async () => {
    if (bleService) {
      const response = await BleManager.read(
        bleService.peripheralId,
        bleService.serviceId,
        bleService.receive
      );
      return response;
    }
  };

  const notify = async () => {
    if (bleService) {
      const response = await BleManager.startNotification(
        bleService.peripheralId,
        bleService.serviceId,
        bleService.receive
      );
      return response;
    }
  };
  const speak = async () => {
    const thingToSay = lettersReceived;
    Speech.speak(thingToSay);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bluetooth Demo</Text>
      {!isConnected ? (
        <DisconnectedState
          peripherals={Array.from(peripherals.values())}
          isScanning={isScanning}
          onScanPress={startScan}
          onConnect={connectPeripheral}
        />
      ) : (
        bleService && (
          <ConnectedState
            onSpeak={speak}
            onNotify={notify}
            bleService={bleService}
            onDisconnect={disconnectPeripheral}
            serialOutput={serialReceived}
            lettersOutput={lettersReceived}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: "10%",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
});

export default BluetoothDemoScreen;