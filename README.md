# Bluetooth serial letter display

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

Forked from [cmcWebCode40 React-Native-Expo-Bluetooth-Integration](https://github.com/cmcWebCode40/React-Native-Expo-Bluetooth-Integration)

## What this project adds

This project specifically integrates with HC-05 bluetooth module.
It parses the output from the serial connection and obtains a bitmask.
That bitmask is translated into a list of different letters that are potentially being signed with ASL.
Those letters are displayed on a card below the connection buttons.
There is a TTS functionality for reading the letters out loud (unused during the presentation to to unreliable letter data).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```