import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Button
} from "react-native";
import { ExpoLinksView } from "@expo/samples";
import Expo from "expo";
import axios from 'axios'


const RecordingOptions = {
  android: {
      extension: '.m4a',
      outputFormat: Expo.Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Expo.Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
  },
  ios: {
      extension: '.caf',
      outputFormat: Expo.Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
      audioQuality: Expo.Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
  },
};
// const speech = require("@google-cloud/speech");

// Creates a client
// const client = new speech.SpeechClient();

// const filename = "Local path to audio file, e.g. /path/to/audio.raw";
// const encoding = "Encoding of the audio file, e.g. LINEAR16";
// const sampleRateHertz = 16000;
// const languageCode = "BCP-47 language code, e.g. en-US";

// const config = {
//   encoding: encoding,
//   sampleRateHertz: sampleRateHertz,
//   languageCode: languageCode
// };
// var audio = {
//   content: fs.readFileSync(filename).toString("base64")
// };



var recordInstance;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: "pronouncation"
  };

  // recognizeAudio = async (audioBase64) => {
  //   let config = {
  //     encoding: 'BASE64',
  //     sampleRateHertz: 16000,
  //     languageCode: 'en-US'
  //   }; 

  //   let request = {
  //     config: config,
  //     audio: {content: audioBase64}
  //   };

  //   client
  //     .recognize(request)
  //     .then(data => {
  //       const response = data[0];
  //       const transcription = response.results
  //         .map(result => result.alternatives[0].transcript)
  //         .join("\n");
  //       console.log(`Transcription: `, transcription);
  //     })
  //     .catch(err => {
  //       console.error("ERROR:", err);
  //     });
  // };

  recordAudio = async () => {
    recordInstance = new Expo.Audio.Recording();
    try {
      await recordInstance.prepareToRecordAsync(
        RecordingOptions
      );
      await recordInstance.startAsync();

      console.log("recording 1 2 3");
      // You are now recording!
    } catch (error) {
      console.log("recording failed", error);
      // An error occurred!
    }
  };

  stopRecording = async () => {
    let recordedSound = recordInstance.getURI();
    console.log("recorded sound", recordedSound);
    console.log("log before stoping", await recordInstance.getStatusAsync());
    let stopResponse = await recordInstance.stopAndUnloadAsync();
    console.log("stop response", stopResponse);

    let recordedSoundBase64 = await Expo.FileSystem.readAsStringAsync(
      recordedSound,
      { encoding: Expo.FileSystem.EncodingTypes.Base64 }
    );

    console.log("recorded base 64", recordedSoundBase64);

    // this.recognizeAudio(recordedSoundBase64)
    axios.post('http://10.10.22.96:5000/todos', {recordedSoundBase64})
  };

  getAudioRecordingAsync = async () => {
    let responseSettingAudio = await Expo.Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Expo.Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Expo.Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });

    const { Location, Permissions } = Expo;
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === "granted") {
      return;
    } else {
      throw new Error("Location permission not granted");
    }
  };

  componentDidMount() {
    this.getAudioRecordingAsync();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Pronouce the letter क</Text>
        <Button
          onPress={this.recordAudio}
          title="Record"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={this.stopRecording}
          title="stop"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  }
});
