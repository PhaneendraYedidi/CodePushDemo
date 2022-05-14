import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';

import CodePush from "react-native-code-push";

class App extends Component {
  constructor() {
    super();
    this.state = { restartAllowed: true, deploymentKey: 'CAbDGF5FOJwimuANPwCjRrPqQzChplbaK5etK'};
  }

  codePushStatusDidChange(syncStatus) {
    switch(syncStatus) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ syncMessage: "Checking for update." });
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ syncMessage: "Downloading package." });
        break;
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        this.setState({ syncMessage: "Awaiting user action." });
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ syncMessage: "Installing update." });
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        this.setState({ syncMessage: "App up to date.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        this.setState({ syncMessage: "Update cancelled by user.", progress: false });
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ syncMessage: "Update installed and will be applied on restart.", progress: false });
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        this.setState({ syncMessage: "An unknown error occurred.", progress: false });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress });
  }

  toggleAllowRestart() {
    this.state.restartAllowed
      ? CodePush.disallowRestart()
      : CodePush.allowRestart();

    this.setState({ restartAllowed: !this.state.restartAllowed });
  }

  getUpdateMetadata() {
    CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
      .then((metadata) => {
        this.setState({ syncMessage: metadata ? JSON.stringify(metadata) : "Running binary version", progress: false });
      }, (error) => {
        this.setState({ syncMessage: "Error: " + error, progress: false });
      });
  }

  /** Update is downloaded silently, and applied on restart (recommended) */
  sync() {
    CodePush.sync(
      { deploymentKey: this.state.deploymentKey },
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
  }

  /** Update pops a confirmation dialog, and then immediately reboots the app */
  syncImmediate() {
    CodePush.sync(
      { deploymentKey: this.state.deploymentKey,installMode: CodePush.InstallMode.IMMEDIATE, updateDialog: true },
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
  }
  
  restartApp() {
	  CodePush.restartApp();
  }

  onChangeTextInput = (text) => {
    this.setState({deploymentKey: text})
  }

  render() {
    let progressView;

    if (this.state.progress) {
      progressView = (
        <Text style={styles.messages}>{this.state.progress.receivedBytes} of {this.state.progress.totalBytes} bytes received</Text>
      );
    }

    return (
		<SafeAreaView>
			<ScrollView>
				<View style={styles.container}>
					<Text style={styles.welcome}>
					  Welcome to CodePush Demo!
					</Text>
          <Text>Updating MainBundle.JS using code push</Text>
          <Text style={{fontWeight: 'bold', paddingTop: 20}}>Deployment Key</Text>
          <TextInput
            style={styles.input}
            onChangeText={this.onChangeTextInput}
            value={this.state.deploymentKey}
            placeholder="Enter Deployment Key"
          />
          <Text style={{fontWeight: 'bold', padding: 30}}>Mobile App - Main branch</Text>
          {/* <Image
            style={styles.tinyLogo}
            source={require('./images/twitter.png')}
          /> */}

					<TouchableOpacity onPress={this.restartApp.bind(this)}>
						<Text style={styles.syncButton}>Press to restart</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.sync.bind(this)}>
					  <Text style={styles.syncButton}>Press for background sync</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.syncImmediate.bind(this)}>
					  <Text style={styles.syncButton}>Press for dialog-driven sync</Text>
					</TouchableOpacity>
					{progressView}
					<TouchableOpacity onPress={this.toggleAllowRestart.bind(this)}>
					  <Text style={styles.restartToggleButton}>Restart { this.state.restartAllowed ? "allowed" : "forbidden"}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.getUpdateMetadata.bind(this)}>
					  <Text style={styles.syncButton}>Press for Update Metadata</Text>
					</TouchableOpacity>
					<Text style={styles.messages}>{this.state.syncMessage || ""}</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    paddingTop: 50
  },
  image: {
    margin: 30,
    width: Dimensions.get("window").width - 100,
    height: 365 * (Dimensions.get("window").width - 100) / 651,
  },
  messages: {
    marginTop: 30,
    textAlign: "center",
  },
  restartToggleButton: {
    color: "blue",
    fontSize: 17
  },
  syncButton: {
    color: "green",
    fontSize: 17
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 20
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  tinyLogo: {
    width: 50,
    height: 50,
    marginTop: 20,
    marginBottom: 20
  }
});

/**
 * Configured with a MANUAL check frequency for easy testing. For production apps, it is recommended to configure a
 * different check frequency, such as ON_APP_START, for a 'hands-off' approach where CodePush.sync() does not
 * need to be explicitly called. All options of CodePush.sync() are also available in this decorator.
 */
let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };

App = CodePush(codePushOptions)(App);

export default App;