import React, { Component } from "react";
import { ScrollView, StyleSheet, Image } from "react-native";
import { ExpoLinksView } from "@expo/samples";
import {Audio, FileSystem, Permissions} from "expo";
import axios from "axios";

import {
  Container,
  Header,
  View,
  DeckSwiper,
  Card,
  CardItem,
  Thumbnail,
  Text,
  Left,
  Body,
  Icon,
  Button,
  Toast
} from "native-base";

const RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000
  },
  ios: {
    extension: ".caf",
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false
  }
};

var recordInstance;

const cards = [
  {
    wordToBePronouncedInHindi: "नमस्ते",
    wordToBePronouncedInEnglish: "Namaste",
    meaningInEnglish: ''
  },
  {
    wordToBePronouncedInHindi: "धन्यवाद",
    wordToBePronouncedInEnglish: "dhanyavaad",
    meaningInEnglish: ''
  },
  {
    wordToBePronouncedInHindi: "अच्छा",
    wordToBePronouncedInEnglish: "achchha",
    meaningInEnglish: ''
  },
  {
    wordToBePronouncedInHindi: "बच्चा",
    wordToBePronouncedInEnglish: "bachcha",
    meaningInEnglish: ''
  },
  {
    wordToBePronouncedInHindi: "मेरा नाम मनोज है",
    wordToBePronouncedInEnglish: "mera naam manoj hai",
    meaningInEnglish: ''
  },
];
export default class DeckSwiperAdvancedExample extends Component {
  state = { wordPronouncedCorrectly: null, isRecording: false };

  wordToPronounce = "";

  recordAudio = async () => {
    this.setState({ isRecording: true });
    recordInstance = new Audio.Recording();
    try {
      await recordInstance.prepareToRecordAsync(RecordingOptions);
      await recordInstance.startAsync();

      console.log("recording 3 2 1");
      // You are now recording!
    } catch (error) {
      console.log("recording failed", error);
      // An error occurred!
    }
  };

  recognizeAudio = async recordedSoundBase64 => {
    let response = await axios.post("http://localhost:3000/speechToText", {
      recordedSoundBase64
    });
    console.log("response", response.data);
    if (this.wordToPronounce === response.data) {
      this.setState({ wordPronouncedCorrectly: true });
    } else {
      this.setState({ wordPronouncedCorrectly: false });
    }

    this._renderResult()
  };

  stopRecording = async () => {
    let recordedSound = recordInstance.getURI();
    console.log("recorded sound", recordedSound);
    console.log("log before stoping", await recordInstance.getStatusAsync());
    let stopResponse = await recordInstance.stopAndUnloadAsync();
    console.log("stop response", stopResponse);

    let recordedSoundBase64 = await FileSystem.readAsStringAsync(
      recordedSound,
      { encoding: FileSystem.EncodingTypes.Base64 }
    );

    console.log("recorded base 64", recordedSoundBase64);

    this.recognizeAudio(recordedSoundBase64);

    this.setState({ isRecording: false });
  };

  getAudioRecordingAsync = async () => {
    let responseSettingAudio = await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });


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

  _renderRecordButton() {
    return (
      <Button iconCenter onPress={this.recordAudio}>
        <Text>Record</Text>
      </Button>
    );
  }

  _renderStopButton() {
    return (
      <Button iconCenter onPress={this.stopRecording}>
        <Text>Stop</Text>
      </Button>
    );
  }

  _renderResult() {
    if (this.state.wordPronouncedCorrectly === null) {
      return null;
    } else if (this.state.wordPronouncedCorrectly === true) {
      this._deckSwiper._root.swipeRight()
      Toast.show({
        text: "You are correct"
      });
      return null
    } else {
      Toast.show({
        text: "Wrongly pronounced, Try Again"
      });
      return null
    }
  }

  render() {
    return (
      <Container>
        <Header />
        <View>
          <DeckSwiper
            looping={false}
            ref={c => (this._deckSwiper = c)}
            dataSource={cards}
            renderEmpty={() => (
              <View style={{ alignSelf: "center" }}>
                <Text>That was fantastic, Thanks for Trying</Text>
              </View>
            )}
            renderItem={item => {
              this.wordToPronounce = item.wordToBePronouncedInHindi;
              return (
                <Card style={{ elevation: 3 }}>
                  <CardItem>
                    <Left>
                      <Body>
                        <Text>Say Aloud the below word</Text>
                      </Body>
                    </Left>
                  </CardItem>
                  <CardItem cardBody />
                  <CardItem>
                    <Text style={{fontSize: 45}}>{item.wordToBePronouncedInHindi}</Text>
                  </CardItem>
                  <CardItem>
                    <Text note>{item.wordToBePronouncedInEnglish}</Text>
                  </CardItem>
                </Card>
              );
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            justifyContent: "space-between",
            padding: 15
          }}
        >
        
          {this.state.isRecording
            ? this._renderStopButton()
            : this._renderRecordButton()}

        </View>
      </Container>
    );
  }
}
