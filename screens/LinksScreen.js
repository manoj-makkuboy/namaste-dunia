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
import axios from "axios";

const RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Expo.Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Expo.Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000
  },
  ios: {
    extension: ".caf",
    outputFormat: Expo.Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: Expo.Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false
  }
};

var recordInstance;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: "pronouncation"
  };

  state = { wordToPronounce: "नमस्ते", wordPronouncedCorrectly: null };

  recordAudio = async () => {
    recordInstance = new Expo.Audio.Recording();
    try {
      await recordInstance.prepareToRecordAsync(RecordingOptions);
      await recordInstance.startAsync();

      console.log("recording 1 2 3");
      // You are now recording!
    } catch (error) {
      console.log("recording failed", error);
      // An error occurred!
    }
  };

  recognizeAudio = async recordedSoundBase64 => {
    let response = await axios.post("http://10.10.22.96:5000/todos", {
      recordedSoundBase64
    });
    console.log("response", response.data);
    if(this.state.wordToPronounce === response.data.message){
      this.setState({wordPronouncedCorrectly: true})
    }
    else{
      this.setState({wordPronouncedCorrectly: false})
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

    this.recognizeAudio(recordedSoundBase64);
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

  _renderResult() {
    if (this.state.wordPronouncedCorrectly === null) return null;
    else if (this.state.wordPronouncedCorrectly === true)
      return "word correctly pronounced";
    else return "word wrongly pronounced";
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{`pronounce the word ${this.state.wordToPronounce}`}</Text>
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

        <Text>{this._renderResult()}</Text>
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
