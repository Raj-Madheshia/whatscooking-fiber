import * as React from "react";
import {StatusBar, Platform} from "react-native";
import {StyleProvider} from "native-base";
import {SwitchNavigator, StackNavigator, TabNavigator} from "react-navigation";
import {Font, AppLoading} from "expo";
import {useStrict} from "mobx";
import {Provider, inject} from "mobx-react";
import {Feather} from "@expo/vector-icons";

import {Images, Firebase, FeedStore} from "./src/components";

import type {ScreenProps} from "./src/components/Types";

import {Welcome} from "./src/welcome";
import {Walkthrough} from "./src/walkthrough";
import {Login} from "./src/sign-up";
import {
    Profile, Explore, Share, SharePicture, HomeTab, Comments, Settings, ProfileStore,Details
} from "./src/home";

import Gallery from "./src/home/share/Gallery";
import ImageEdit from "./src/home/share/ImageEdit";
import getTheme from "./native-base-theme/components";
import variables from "./native-base-theme/variables/commonColor";

// $FlowFixMe
const SFProTextMedium = require("./fonts/SF-Pro-Text-Medium.otf");
// $FlowFixMe
const SFProTextHeavy = require("./fonts/SF-Pro-Text-Heavy.otf");
// $FlowFixMe
const SFProTextBold = require("./fonts/SF-Pro-Text-Bold.otf");
// $FlowFixMe
const SFProTextSemibold = require("./fonts/SF-Pro-Text-Semibold.otf");
// $FlowFixMe
const SFProTextRegular = require("./fonts/SF-Pro-Text-Regular.otf");
// $FlowFixMe
const SFProTextLight = require("./fonts/SF-Pro-Text-Light.otf");
// $FlowFixMe
const Billabong = require("./fonts/billabong.otf");

useStrict(true);

const originalSend = XMLHttpRequest.prototype.send;
// https://github.com/firebase/firebase-js-sdk/issues/283
// $FlowFixMe
XMLHttpRequest.prototype.send = function (body: string) {
    if (body === "") {
        originalSend.call(this);
    } else {
        originalSend.call(this, body);
    }
};

// https://github.com/firebase/firebase-js-sdk/issues/97
if (!console.ignoredYellowBox) {
    // $FlowFixMe
    console.ignoredYellowBox = [];
}
// $FlowFixMe
console.ignoredYellowBox.push("Setting a timer");

@inject("profileStore", "feedStore", "userFeedStore")
class Loading extends React.Component<ScreenProps<>> {

    async componentDidMount(): Promise<void> {
        const {navigation, profileStore, feedStore, userFeedStore} = this.props;
        await Loading.loadStaticResources();
        Firebase.init();
        Firebase.auth.onAuthStateChanged(user => {
            const isUserAuthenticated = !!user;
            if (isUserAuthenticated) {
                const {uid} = Firebase.auth.currentUser;
                const feedQuery = Firebase.firestore
                    .collection("feed")
                    .orderBy("timestamp", "desc");
                const userFeedQuery = Firebase.firestore
                    .collection("feed")
                    .where("uid", "==", uid)
                    .orderBy("timestamp", "desc");
                profileStore.init();
                feedStore.init(feedQuery);
                userFeedStore.init(userFeedQuery);
                navigation.navigate("Home");
            } else {
                navigation.navigate("Walkthrough");
            }
        });
    }

    static async loadStaticResources(): Promise<void> {
        try {
            const images = Images.downloadAsync();
            const fonts = Font.loadAsync({
                "SFProText-Medium": SFProTextMedium,
                "SFProText-Heavy": SFProTextHeavy,
                "SFProText-Bold": SFProTextBold,
                "SFProText-Semibold": SFProTextSemibold,
                "SFProText-Regular": SFProTextRegular,
                "SFProText-Light": SFProTextLight,
                "Billabong": Billabong
            });
            const icons = Font.loadAsync(Feather.font);
            await Promise.all([...images, fonts, icons]);
        } catch (error) {
            console.error(error);
        }
    }

    render(): React.Node {
        return <AppLoading />;
    }
}

// eslint-disable-next-line react/no-multi-comp
export default class App extends React.Component<{}> {

    profileStore = new ProfileStore();
    feedStore = new FeedStore();
    userFeedStore = new FeedStore();

    componentDidMount() {
        StatusBar.setBarStyle("default");
        StatusBar.setBackgroundColor("#f27842");
    }

    render(): React.Node {
        const {feedStore, profileStore, userFeedStore} = this;
        console.log("Till here")
        return (
            <StyleProvider style={getTheme(variables)}>
                <Provider {...{feedStore, profileStore, userFeedStore}}>
                    <AppNavigator />
                </Provider>
            </StyleProvider>
        );
    }
}

const StackNavigatorOptions = {
    headerMode: "none",
    cardStyle: {
        backgroundColor: "white"
    }
};

const ExploreNavigator = StackNavigator({
    Explore: { screen: Explore },
    Comments: { screen: Comments },
}, StackNavigatorOptions);

const ProfileNavigator = StackNavigator({
    Profile: { screen: Profile },
    Settings: { screen: Settings },
    Comments: { screen: Comments }
}, StackNavigatorOptions);

const ShareNavigator = StackNavigator({
    Share: { screen: Share },
    Gallery: { screen: Gallery },
    ImageEdit:{ screen: ImageEdit},
    SharePicture: { screen: SharePicture },

}, StackNavigatorOptions);

const HomeTabs = TabNavigator({
    Explore: { screen: ExploreNavigator },
    Share: { screen: ShareNavigator },
    Profile: { screen: ProfileNavigator }
}, {
    animationEnabled: true,
    tabBarComponent: HomeTab,
    tabBarPosition: "bottom",
    swipeEnabled: false
});

const HomeNavigator = SwitchNavigator({
    //Walkthrough: { screen: Walkthrough },
    Home: { screen: HomeTabs }
}, StackNavigatorOptions);


const AppNavigator = SwitchNavigator({
    Loading: { screen: Loading },
    Walkthrough: { screen: Walkthrough },
    Welcome: { screen: Welcome },
    Login: { screen: Login },
    Home: { screen: HomeNavigator }
}, StackNavigatorOptions);

export {AppNavigator};