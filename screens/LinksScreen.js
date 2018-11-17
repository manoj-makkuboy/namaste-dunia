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

var recordInstance;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: "pronouncation"
  };

  recordAudio = async () => {
    recordInstance = new Expo.Audio.Recording();
    try {
      await recordInstance.prepareToRecordAsync(
        Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
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
